from typing import Callable, Dict

from fastapi.testclient import TestClient

from tests.api.conftest import (
    TestUserType,
)
from api.routes.error import UserFriendlyErrorSchema
from db.models.user_project_permission import Permission
from db.schemas.project import (
    PartialUserWithPermission,
    Project,
)
from db.schemas.todo_category import TodoCategory
from error.exceptions import ErrorCode


def test_updating_user_permissions(
    auth_header_factory: Callable[[TestUserType], Dict[str, str]],
    test_project_factory: Callable[[TestUserType], Project],
    test_attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    test_users: list[TestUserType],
    test_client: TestClient,
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Shared user with permission

    # Create the projects
    project_one = test_project_factory(user_a)
    project_two = test_project_factory(
        user_b
    )  # just created this project because this should leak into project one permissions list

    # Share project_two with user_a with CREATE_TODO_CATEGORY permission just make sure permissions don't leak to other projects
    test_attach_project_to_user(
        user_b, user_a, project_two.id, [Permission.CREATE_TODO_CATEGORY]
    )

    # Share project_one with user_b with UPDATE_TODO_CATEGORY permission
    test_attach_project_to_user(
        user_a, user_b, project_one.id, [Permission.UPDATE_TODO_CATEGORY]
    )

    user_no_access_response = test_client.put(
        f"/permissions/{project_one.id}",
        headers=auth_header_factory(user_a),
        json={
            "user_id": test_users[2]["id"],
            "permissions": [Permission.ALL],
        },
    )

    assert user_no_access_response.status_code == 400
    assert (
        UserFriendlyErrorSchema.model_validate(user_no_access_response.json()).code
        == ErrorCode.USER_DOESNT_HAVE_ACCESS_TO_PROJECT
    )

    change_user_b_permissions = test_client.put(
        f"/permissions/{project_one.id}",
        headers=auth_header_factory(user_a),
        json={
            "user_id": user_b["id"],
            "permissions": [Permission.ALL],
        },
    )
    assert change_user_b_permissions.status_code == 200
    assert PartialUserWithPermission.model_validate(
        change_user_b_permissions.json()
    ).permissions == [Permission.ALL]

    change_user_a_permissions = test_client.put(
        f"/permissions/{project_one.id}",
        headers=auth_header_factory(user_b),
        json={
            "user_id": user_a["id"],
            "permissions": [Permission.DELETE_COMMENT, Permission.DELETE_TODO_ITEM],
        },
    )

    assert change_user_a_permissions.status_code == 200
    assert (
        PartialUserWithPermission.model_validate(
            change_user_a_permissions.json()
        ).permissions.sort()
        == [Permission.DELETE_COMMENT, Permission.DELETE_TODO_ITEM].sort()
    )

    searched_project = Project.model_validate(
        test_client.get(
            f"/projects/{project_one.id}",
            headers=auth_header_factory(user_a),
        ).json()
    )

    assert len(searched_project.users) == 2

    user_a_permissions = next(
        filter(lambda user: user.id == user_a["id"], searched_project.users)
    )
    user_b_permissions = next(
        filter(lambda user: user.id == user_b["id"], searched_project.users)
    )

    assert (
        user_a_permissions.permissions.sort()
        == [Permission.DELETE_COMMENT, Permission.DELETE_TODO_ITEM].sort()
    )
    assert user_b_permissions.permissions == [Permission.ALL]
