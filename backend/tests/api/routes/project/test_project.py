from tkinter import ALL
from typing import Callable, Dict
import pytest
from fastapi.testclient import TestClient

from tests.api.conftest import (
    TestUserType,
)
from api.routes.error import UserFriendlyErrorSchema
from db.models.user_project_permission import Permission
from db.schemas.project import (
    PartialUserWithPermission,
    Project,
    ProjectAttachAssociation,
    ProjectAttachAssociationResponse,
)
from db.schemas.todo_category import TodoCategory
from error.exceptions import ErrorCode


@pytest.mark.parametrize("template_flag", [False, True])
def test_create_project(
    auth_header_factory: Callable[[TestUserType], Dict[str, str]],
    test_users: list[TestUserType],
    test_client: TestClient,
    template_flag: bool,
):
    # Choose a random user from `test_users`
    user = test_users[0]
    auth_header = auth_header_factory(user)

    json_payload: dict[str, str | bool] = {"title": "test", "description": "test"}
    if template_flag:
        json_payload["create_from_default_template"] = True

    response = test_client.post(
        "/project/create",
        headers=auth_header,
        json=json_payload,
    )

    assert response.status_code == 200

    project = Project.model_validate(response.json(), strict=True)

    # Common assertions for both cases
    assert (
        len(project.users) == 1
    ), "new project should be associated to only one user (the creator of this project)"
    assert (
        project.users[0].username == user["username"]
    ), "owner of the created project should be the user who created it"

    # Additional assertions for the template case
    if template_flag:
        assert (
            len(project.todo_categories) == 4
        ), "a new project made from the template should have 4 categories"
    else:
        assert (
            len(project.todo_categories) == 0
        ), "an empty project should have no categories"

    assert project.done_todos_count == 0, "an empty project should have no done todos"
    assert (
        project.pending_todos_count == 0
    ), "an empty project should have no pending todos"


def test_project_accessibility(
    auth_header_factory: Callable[[TestUserType], Dict[str, str]],
    test_project_factory: Callable[[TestUserType], Project],
    test_attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    test_users: list[TestUserType],
    test_client: TestClient,
):
    # Project creation by user A
    user_a = test_users[0]
    project = test_project_factory(user_a)

    # Verify project owner (user A) can access their project
    search_response_a = test_client.get(
        "/project/search",
        headers=auth_header_factory(user_a),
        params={"project_id": project.id},
    )
    assert (
        search_response_a.status_code == 200
    ), "owner of project should be able to search their own project"

    # Verify user B cannot access user A's project before sharing
    user_b = test_users[1]
    search_response_b = test_client.get(
        "/project/search",
        headers=auth_header_factory(user_b),
        params={"project_id": project.id},
    )
    assert (
        search_response_b.status_code == 400
    ), "user B should not see user A's projects before it is shared"

    # Share the project with user B and verify access
    test_attach_project_to_user(user_a, user_b, project.id, [Permission.ALL])

    search_response_b_after_share = test_client.get(
        "/project/search",
        headers=auth_header_factory(user_b),
        params={"project_id": project.id},
    )
    assert (
        search_response_b_after_share.status_code == 200
    ), "user B should be able to see user A's project after it was shared"


def test_owner_detaching_projects(
    auth_header_factory: Callable[[TestUserType], Dict[str, str]],
    test_project_factory: Callable[[TestUserType], Project],
    test_attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]],
        ProjectAttachAssociationResponse,
    ],
    test_users: list[TestUserType],
    test_client: TestClient,
):

    # Project creation by user A
    user_a = test_users[0]
    user_b = test_users[1]
    project = test_project_factory(user_a)

    attach_response = test_attach_project_to_user(
        user_a, user_b, project.id, [Permission.CREATE_COMMENT]
    )

    detach_by_owner_response_json = test_client.request(
        method="delete",
        url="/project/detach-from-user",
        headers=auth_header_factory(user_a),
        json={
            "project_id": project.id,
            "user_id": attach_response.user_id,
        },
    )

    assert (
        detach_by_owner_response_json.status_code == 200
    ), "owner should be detach from other users"

    test_attach_project_to_user(user_a, user_b, project.id, [Permission.CREATE_COMMENT])

    attach_to_user_c_response = test_attach_project_to_user(
        user_a, test_users[2], project.id, [Permission.CREATE_COMMENT]
    )

    detach_by_user_response_json = test_client.request(
        method="delete",
        url="/project/detach-from-user",
        headers=auth_header_factory(user_b),
        json={
            "project_id": project.id,
            "user_id": attach_to_user_c_response.user_id,
        },
    )

    assert (
        detach_by_user_response_json.status_code == 400
    ), "none-owner shouldn't be able to detach projects from other users"

    detach_by_owner_response_json = test_client.request(
        method="delete",
        url="/project/detach-from-user",
        headers=auth_header_factory(user_a),
        json={
            "project_id": project.id,
            "user_id": attach_to_user_c_response.user_id,
        },
    )
    assert (
        detach_by_owner_response_json.status_code == 200
    ), "owner should be able to detach projects from other users"


def test_cannot_share_project_to_same_user_multiple_times(
    auth_header_factory: Callable[[TestUserType], Dict[str, str]],
    test_project_factory: Callable[[TestUserType], Project],
    test_attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    test_users: list[TestUserType],
    test_client: TestClient,
):
    project = test_project_factory(test_users[0])
    test_attach_project_to_user(
        test_users[0], test_users[1], project.id, [Permission.ALL]
    )

    _reattach_project_to_user(
        auth_header_factory, test_users, test_client, project, [Permission.DELETE_TAG]
    )
    _reattach_project_to_user(
        auth_header_factory,
        test_users,
        test_client,
        project,
        [Permission.DELETE_TODO_CATEGORY, Permission.CREATE_COMMENT],
    )
    _reattach_project_to_user(
        auth_header_factory,
        test_users,
        test_client,
        project,
        [
            Permission.ALL,
        ],
    )
    _reattach_project_to_user(
        auth_header_factory,
        test_users,
        test_client,
        project,
        [
            Permission.ALL,
        ],
    )


def test_user_permissions_per_project(
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

    projects_json = test_client.get(
        "/project/list", headers=auth_header_factory(user_a)
    ).json()
    parsed_projects = [Project.model_validate(x, strict=True) for x in projects_json]
    assert len(parsed_projects) >= 2, "at least two projects should exist"

    parsed_project_one = list(
        filter(lambda project: project.id == project_one.id, parsed_projects)
    )[0]
    assert parsed_project_one is not None

    parsed_project_two = list(
        filter(lambda project: project.id == project_two.id, parsed_projects)
    )[0]
    assert parsed_project_two is not None

    assert (
        len(parsed_project_one.users) == 2
    ), "project one should be associated with two users"

    assert parsed_project_one.users[0].username == user_a["username"]
    assert parsed_project_one.users[1].username == user_b["username"]
    assert parsed_project_one.users[0].permissions == [Permission.ALL]
    assert parsed_project_one.users[1].permissions == [Permission.UPDATE_TODO_CATEGORY]

    assert parsed_project_two.users[0].username == user_a["username"]
    assert parsed_project_two.users[1].username == user_b["username"]
    assert parsed_project_two.users[0].permissions == [Permission.CREATE_TODO_CATEGORY]
    assert parsed_project_two.users[1].permissions == [Permission.ALL]


@pytest.mark.parametrize("values", [[], "", None])
def test_cannot_pass_empty_permissions_to_attach_association(
    auth_header_factory: Callable[[TestUserType], Dict[str, str]],
    test_project_factory: Callable[[TestUserType], Project],
    test_users: list[TestUserType],
    test_client: TestClient,
    values: str | list | None,
):
    p1 = test_project_factory(test_users[0])
    response = test_client.post(
        "/project/attach-to-user",
        headers=auth_header_factory(test_users[0]),
        json={
            "project_id": p1.id,
            "username": test_users[1],
            "permissions": values,
        },
    )

    assert (
        response.status_code == 422
    ), "we shouldn't be able to pass empty permissions lists to this service"


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

    user_no_access_response = test_client.patch(
        "/project/update-user-permissions",
        headers=auth_header_factory(user_a),
        json={
            "project_id": project_one.id,
            "user_id": test_users[2]["id"],
            "permissions": [Permission.ALL],
        },
    )

    assert user_no_access_response.status_code == 400
    assert (
        UserFriendlyErrorSchema.model_validate(user_no_access_response.json()).code
        == ErrorCode.USER_DOESNT_HAVE_ACCESS_TO_PROJECT
    )

    change_user_b_permissions = test_client.patch(
        "/project/update-user-permissions",
        headers=auth_header_factory(user_a),
        json={
            "project_id": project_one.id,
            "user_id": user_b["id"],
            "permissions": [Permission.ALL],
        },
    )
    assert change_user_b_permissions.status_code == 200
    assert PartialUserWithPermission.model_validate(
        change_user_b_permissions.json()
    ).permissions == [Permission.ALL]

    change_user_a_permissions = test_client.patch(
        "/project/update-user-permissions",
        headers=auth_header_factory(user_b),
        json={
            "project_id": project_one.id,
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
            "/project/search",
            headers=auth_header_factory(user_a),
            params={"project_id": project_one.id},
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


def test_cannot_set_all_with_other_permissions(
    auth_header_factory: Callable[[TestUserType], Dict[str, str]],
    test_project_factory: Callable[[TestUserType], Project],
    test_users: list[TestUserType],
    test_client: TestClient,
):
    user_a = test_users[0]  # Owner

    # Create the projects
    project_one = test_project_factory(user_a)

    attach_to_user_response = test_client.post(
        "/project/attach-to-user",
        headers=auth_header_factory(user_a),
        json={
            "project_id": project_one.id,
            "username": test_users[1]["username"],
            "permissions": [Permission.ALL, Permission.CREATE_COMMENT],
        },
    )

    assert (
        attach_to_user_response.status_code == 422
    ), "shouldn't be able to set ALL permission alongside other permissions to one user"


def _reattach_project_to_user(
    auth_header_factory: Callable[[TestUserType], dict[str, str]],
    test_users: list[TestUserType],
    test_client: TestClient,
    project: Project,
    permissions: list[Permission],
):
    reattach_to_user_response = test_client.post(
        "/project/attach-to-user",
        headers=auth_header_factory(test_users[0]),
        json={
            "project_id": project.id,
            "username": test_users[1]["username"],
            "permissions": permissions,
        },
    )

    assert (
        reattach_to_user_response.status_code == 400
    ), "Reattaching user(b) with new permissions should still be considered a USER_ASSOCIATION_ALREADY_EXISTS error"

    parsed_reattach_to_user_response = UserFriendlyErrorSchema.model_validate(
        reattach_to_user_response.json()
    )

    assert (
        parsed_reattach_to_user_response.code
        == ErrorCode.USER_ASSOCIATION_ALREADY_EXISTS
    ), "Invalid error code for project reassociation"
