from encodings import search_function
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
    create_project: Callable[[TestUserType], Project],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    search_project: Callable[[TestUserType, int], Project],
    verify_user_permissions: Callable[
        [TestUserType, Project, dict[int, list[Permission]]], None
    ],
    test_users: list[TestUserType],
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Shared user with permission
    user_c = test_users[2]

    # Create the projects
    project_one = create_project(user_a)
    project_two = create_project(user_b)

    # Attach users to projects with specific permissions
    attach_project_to_user(
        user_a,
        user_b,
        project_one.id,
        [Permission.CREATE_COMMENT, Permission.CREATE_TODO_CATEGORY],
    )
    attach_project_to_user(
        user_b,
        user_a,
        project_two.id,
        [Permission.CREATE_TODO_ITEM, Permission.CREATE_TODO_CATEGORY],
    )
    attach_project_to_user(
        user_b,
        user_c,
        project_two.id,
        [Permission.CREATE_TODO_ITEM, Permission.CREATE_TODO_CATEGORY],
    )

    # Verify permissions in Project One
    verify_user_permissions(
        user_a,
        search_project(user_a, project_one.id),
        {
            user_a["id"]: [Permission.ALL],
            user_b["id"]: [
                Permission.CREATE_COMMENT,
                Permission.CREATE_TODO_CATEGORY,
            ],
        },
    )

    # Verify permissions in Project Two
    verify_user_permissions(
        user_b,
        search_project(user_a, project_two.id),
        {
            user_a["id"]: [
                Permission.CREATE_TODO_ITEM,
                Permission.CREATE_TODO_CATEGORY,
            ],
            user_b["id"]: [Permission.ALL],
            user_c["id"]: [
                Permission.CREATE_TODO_ITEM,
                Permission.CREATE_TODO_CATEGORY,
            ],
        },
    )


def test_prevent_user_without_access_from_updating_permissions(
    create_project: Callable[[TestUserType], Project],
    update_user_permissions: Callable[
        [TestUserType, TestUserType, int, list[Permission]], Response
    ],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    search_project: Callable[[TestUserType, int], Project],
    verify_user_permissions: Callable[
        [TestUserType, Project, dict[int, list[Permission]]], None
    ],
    test_users: list[TestUserType],
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Shared user with permission

    # Create a project and share it
    project_one = create_project(user_a)
    attach_project_to_user(
        user_a, user_b, project_one.id, [Permission.UPDATE_TODO_CATEGORY]
    )

    # User C (no access) tries to update permissions
    user_no_access_response = update_user_permissions(
        user_a, test_users[2], project_one.id, [Permission.ALL]
    )
    assert user_no_access_response.status_code == 400
    assert (
        UserFriendlyErrorSchema.model_validate(user_no_access_response.json()).code
        == ErrorCode.USER_DOESNT_HAVE_ACCESS_TO_PROJECT
    )

    # Verify that no permissions were changed
    verify_user_permissions(
        user_a,
        search_project(user_a, project_one.id),
        {
            user_a["id"]: [Permission.ALL],
            user_b["id"]: [Permission.UPDATE_TODO_CATEGORY],
        },
    )


def test_owner_can_update_user_permissions(
    create_project: Callable[[TestUserType], Project],
    update_user_permissions: Callable[
        [TestUserType, TestUserType, int, list[Permission]], Response
    ],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    verify_user_permissions: Callable[
        [TestUserType, Project, dict[int, list[Permission]]], None
    ],
    search_project: Callable[[TestUserType, int], Project],
    test_users: list[TestUserType],
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Shared user with permission

    # Create a project and share it
    project_one = create_project(user_a)
    attach_project_to_user(
        user_a, user_b, project_one.id, [Permission.UPDATE_TODO_CATEGORY]
    )

    # Owner updates user_b permissions
    change_user_b_permissions = update_user_permissions(
        user_a, user_b, project_one.id, [Permission.ALL]
    )
    assert change_user_b_permissions.status_code == 200
    assert PartialUserWithPermission.model_validate(
        change_user_b_permissions.json()
    ).permissions == [Permission.ALL]

    # Verify the updated permissions
    verify_user_permissions(
        user_a,
        search_project(user_b, project_one.id),
        {
            user_a["id"]: [Permission.ALL],
            user_b["id"]: [Permission.ALL],
        },
    )


def test_shared_user_cant_update_owner_permissions(
    create_project: Callable[[TestUserType], Project],
    update_user_permissions: Callable[
        [TestUserType, TestUserType, int, list[Permission]], Response
    ],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    search_project: Callable[[TestUserType, int], Project],
    verify_user_permissions: Callable[
        [TestUserType, Project, dict[int, list[Permission]]], None
    ],
    test_users: list[TestUserType],
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Shared user with permission

    # Create a project and share it
    project_one = create_project(user_a)
    attach_project_to_user(
        user_a, user_b, project_one.id, [Permission.UPDATE_TODO_CATEGORY]
    )

    # Shared user (user_b) tries to update owner (user_a) permissions
    change_user_a_permissions = update_user_permissions(
        user_b,
        user_a,
        project_one.id,
        [Permission.DELETE_COMMENT, Permission.DELETE_TODO_ITEM],
    )
    assert change_user_a_permissions.status_code == 400

    # Verify that permissions were not changed
    verify_user_permissions(
        user_a,
        search_project(user_b, project_one.id),
        {
            user_a["id"]: [Permission.ALL],
            user_b["id"]: [Permission.UPDATE_TODO_CATEGORY],
        },
    )


def test_users_of_project_grows_after_share(
    create_project: Callable[[TestUserType], Project],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    search_project: Callable[[TestUserType, int], Project],
    test_users: list[TestUserType],
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Shared user with permission

    # Create the projects
    project_one = create_project(user_a)

    # Share project_one with user_b with UPDATE_TODO_CATEGORY permission
    attach_project_to_user(
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
    create_project: Callable[[TestUserType], Project],
    update_user_permissions: Callable[
        [TestUserType, TestUserType, int, list[Permission]], Response
    ],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    search_project: Callable[[TestUserType, int], Project],
    test_users: list[TestUserType],
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Other

    # Create the projects
    project_one = create_project(user_a)

    attach_project_to_user(user_a, user_b, project_one.id, [Permission.ALL])

    update_user_permissions(user_b, user_a, project_one.id, [Permission.CREATE_COMMENT])

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
