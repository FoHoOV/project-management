from typing import Callable

from httpx import Response

from tests.api.conftest import (
    TestUserType,
)
from api.routes.error import UserFriendlyErrorSchema
from db.models.user_project_permission import Permission
from db.schemas.project import (
    PartialUserWithPermission,
    Project,
)
from error.exceptions import ErrorCode
from tests.api.routes.user import test_user


def test_permissions_dont_leak(
    test_project_factory: Callable[[TestUserType], Project],
    test_attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    search_project: Callable[[TestUserType, int], Project],
    test_users: list[TestUserType],
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Shared user with permission
    user_c = test_users[2]

    # Create the projects
    project_one = test_project_factory(user_a)
    project_two = test_project_factory(user_b)

    test_attach_project_to_user(
        user_a,
        user_b,
        project_one.id,
        [Permission.CREATE_COMMENT, Permission.CREATE_TODO_CATEGORY],
    )

    test_attach_project_to_user(
        user_b,
        user_a,
        project_two.id,
        [Permission.CREATE_TODO_ITEM, Permission.CREATE_TODO_CATEGORY],
    )

    test_attach_project_to_user(
        user_b,
        user_c,
        project_two.id,
        [Permission.CREATE_TODO_ITEM, Permission.CREATE_TODO_CATEGORY],
    )

    project_a = search_project(user_b, project_one.id)

    assert len(project_a.users) == 2

    user_a_permissions = next(
        filter(lambda user: user.id == user_a["id"], project_a.users)
    )
    user_b_permissions = next(
        filter(lambda user: user.id == user_b["id"], project_a.users)
    )

    assert user_a_permissions.permissions.sort() == [Permission.ALL].sort()
    assert (
        user_b_permissions.permissions.sort()
        == [Permission.CREATE_COMMENT, Permission.CREATE_TODO_CATEGORY].sort()
    )

    project_b = search_project(user_b, project_two.id)

    assert len(project_b.users) == 3

    user_a_permissions = next(
        filter(lambda user: user.id == user_a["id"], project_b.users)
    )
    user_b_permissions = next(
        filter(lambda user: user.id == user_b["id"], project_b.users)
    )

    assert user_b_permissions.permissions.sort() == [Permission.ALL].sort()
    assert (
        user_a_permissions.permissions.sort()
        == [Permission.CREATE_TODO_ITEM, Permission.CREATE_TODO_CATEGORY].sort()
    )


def test_prevent_user_without_access_from_updating_permissions(
    test_project_factory: Callable[[TestUserType], Project],
    update_user_permissions: Callable[
        [TestUserType, int, int, list[Permission]], Response
    ],
    test_attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    test_users: list[TestUserType],
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Shared user with permission

    # Create projects
    project_one = test_project_factory(user_a)

    test_attach_project_to_user(
        user_a, user_b, project_one.id, [Permission.UPDATE_TODO_CATEGORY]
    )

    # User C (no access) tries to update permissions
    user_no_access_response = update_user_permissions(
        user_a, project_one.id, test_users[2]["id"], [Permission.ALL]
    )
    assert user_no_access_response.status_code == 400
    assert (
        UserFriendlyErrorSchema.model_validate(user_no_access_response.json()).code
        == ErrorCode.USER_DOESNT_HAVE_ACCESS_TO_PROJECT
    )


def test_owner_can_update_user_permissions(
    test_project_factory: Callable[[TestUserType], Project],
    update_user_permissions: Callable[
        [TestUserType, int, int, list[Permission]], Response
    ],
    test_attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    test_users: list[TestUserType],
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Shared user with permission

    # Create projects
    project_one = test_project_factory(user_a)

    test_attach_project_to_user(
        user_a, user_b, project_one.id, [Permission.UPDATE_TODO_CATEGORY]
    )

    # Owner updates user_b permissions
    change_user_b_permissions = update_user_permissions(
        user_a, project_one.id, user_b["id"], [Permission.ALL]
    )
    assert change_user_b_permissions.status_code == 200
    assert PartialUserWithPermission.model_validate(
        change_user_b_permissions.json()
    ).permissions == [Permission.ALL]


def test_shared_user_cant_update_owner_permissions(
    test_project_factory: Callable[[TestUserType], Project],
    update_user_permissions: Callable[
        [TestUserType, int, int, list[Permission]], Response
    ],
    test_attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    test_users: list[TestUserType],
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Shared user with permission

    # Create projects
    project_one = test_project_factory(user_a)

    project_two = test_project_factory(user_b)

    test_attach_project_to_user(
        user_a, user_b, project_one.id, [Permission.UPDATE_TODO_CATEGORY]
    )

    test_attach_project_to_user(
        user_b,
        user_a,
        project_two.id,
        [Permission.DELETE_COMMENT, Permission.DELETE_TODO_ITEM],
    )

    # Shared user (user_b) updates owner (user_a) permissions
    change_user_a_permissions = update_user_permissions(
        user_b,
        project_one.id,
        user_a["id"],
        [Permission.DELETE_COMMENT, Permission.DELETE_TODO_ITEM],
    )
    assert change_user_a_permissions.status_code == 400


def test_users_of_project_grows_after_share(
    test_project_factory: Callable[[TestUserType], Project],
    test_attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    search_project: Callable[[TestUserType, int], Project],
    test_users: list[TestUserType],
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Shared user with permission

    # Create the projects
    project_one = test_project_factory(user_a)

    # Share project_one with user_b with UPDATE_TODO_CATEGORY permission
    test_attach_project_to_user(
        user_a, user_b, project_one.id, [Permission.UPDATE_TODO_CATEGORY]
    )

    searched_project = search_project(user_b, project_one.id)

    assert len(searched_project.users) == 2

    user_a_permissions = next(
        filter(lambda user: user.id == user_a["id"], searched_project.users)
    )
    user_b_permissions = next(
        filter(lambda user: user.id == user_b["id"], searched_project.users)
    )

    assert user_a_permissions.permissions == [Permission.ALL]
    assert user_b_permissions.permissions == [Permission.UPDATE_TODO_CATEGORY]


def test_changing_project_owner(
    test_project_factory: Callable[[TestUserType], Project],
    update_user_permissions: Callable[
        [TestUserType, int, int, list[Permission]], Response
    ],
    test_attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    search_project: Callable[[TestUserType, int], Project],
    test_users: list[TestUserType],
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Other

    # Create the projects
    project_one = test_project_factory(user_a)

    test_attach_project_to_user(user_a, user_b, project_one.id, [Permission.ALL])

    update_user_permissions(
        user_b, project_one.id, user_a["id"], [Permission.CREATE_COMMENT]
    )

    searched_project = search_project(user_b, project_one.id)

    assert len(searched_project.users) == 2

    user_a_permissions = next(
        filter(lambda user: user.id == user_a["id"], searched_project.users)
    )
    user_b_permissions = next(
        filter(lambda user: user.id == user_b["id"], searched_project.users)
    )

    assert user_a_permissions.permissions == [Permission.CREATE_COMMENT]
    assert user_b_permissions.permissions == [Permission.ALL]
