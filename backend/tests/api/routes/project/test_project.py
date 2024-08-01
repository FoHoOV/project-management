from typing import Callable, cast
import pytest
from httpx import Response
from tests.api.conftest import TestUserType
from api.routes.error import UserFriendlyErrorSchema
from db.models.user_project_permission import Permission
from db.schemas.project import Project, ProjectAttachAssociationResponse
from error.exceptions import ErrorCode


@pytest.mark.parametrize("template_flag", [False, True])
def test_create_project(
    test_users: list[TestUserType],
    create_project_request: Callable[[TestUserType, bool], Response],
    template_flag: bool,
):
    user = test_users[0]

    response = create_project_request(user, template_flag)
    assert response.status_code == 200

    project = Project.model_validate(response.json(), strict=True)

    assert (
        len(project.users) == 1
    ), "new project should be associated to only one user (the creator of this project)"
    assert (
        project.users[0].username == user["username"]
    ), "owner of the created project should be the user who created it"

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
    create_and_attach_project: Callable[
        [TestUserType, TestUserType, list[Permission], bool], Project
    ],
    search_project: Callable[[TestUserType, int], Project],
    test_users: list[TestUserType],
):
    user_a = test_users[0]
    user_b = test_users[1]

    project = create_and_attach_project(user_a, user_b, [Permission.ALL], False)

    # Verify project owner (user A) can access their project
    project_a = search_project(user_a, project.id)
    assert (
        project_a is not None
    ), "owner of project should be able to search their own project"

    # Verify user B can access the shared project
    project_b = search_project(user_b, project.id)
    assert (
        project_b is not None
    ), "user B should be able to see user A's project after it was shared"


def test_owner_detaching_projects(
    create_and_attach_project: Callable[
        [TestUserType, TestUserType, list[Permission]], Project
    ],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]],
        ProjectAttachAssociationResponse,
    ],
    detach_project_from_user: Callable[[TestUserType, TestUserType, int], None],
    detach_project_from_user_request: Callable[
        [TestUserType, TestUserType, int], Response
    ],
    search_project: Callable[[TestUserType, int], Project],
    test_users: list[TestUserType],
):
    user_a = test_users[0]
    user_b = test_users[1]
    user_c = test_users[2]

    project = create_and_attach_project(user_a, user_b, [Permission.CREATE_COMMENT])

    # Detach user B by owner A
    detach_project_from_user(user_a, user_b, project.id)

    # Verify user B is detached
    project = search_project(user_a, project.id)
    assert len(project.users) == 1, "user B should be detached from the project"

    # Re-attach user B and attach user C
    attach_project_to_user(user_a, user_b, project.id, [Permission.CREATE_COMMENT])
    attach_project_to_user(user_a, user_c, project.id, [Permission.CREATE_TAG])

    # Verify user B cannot detach user C
    detach_by_user_response = detach_project_from_user_request(
        user_b, user_c, project.id
    )
    assert (
        detach_by_user_response.status_code == 400
    ), "non-owner shouldn't be able to detach other users"

    detach_by_owner_response = detach_project_from_user_request(
        user_a, user_c, project.id
    )
    assert (
        detach_by_owner_response.status_code == 200
    ), "owner should be able to detach other users"

    # Verify user C is detached
    project = search_project(user_a, project.id)
    assert len(project.users) == 2, "user C should be detached from the project"


def test_cannot_share_project_to_same_user_multiple_times(
    create_project: Callable[[TestUserType], Project],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    attach_project_to_user_request: Callable[
        [TestUserType, TestUserType, int, list[Permission]], Response
    ],
    search_project: Callable[[TestUserType, int], Project],
    test_users: list[TestUserType],
):
    project = create_project(test_users[0])
    attach_project_to_user(test_users[0], test_users[1], project.id, [Permission.ALL])

    response = attach_project_to_user_request(
        test_users[0], test_users[1], project.id, [Permission.DELETE_TAG]
    )
    assert response.status_code == 400
    assert (
        UserFriendlyErrorSchema.model_validate(response.json()).code
        == ErrorCode.USER_ASSOCIATION_ALREADY_EXISTS
    )

    response = attach_project_to_user_request(
        test_users[0],
        test_users[1],
        project.id,
        [Permission.DELETE_TODO_CATEGORY, Permission.CREATE_COMMENT],
    )
    assert response.status_code == 400

    response = attach_project_to_user_request(
        test_users[0],
        test_users[1],
        project.id,
        [Permission.ALL],
    )
    assert response.status_code == 400

    # Verify the project data is correct after the reattach attempts
    project = search_project(test_users[0], project.id)
    assert len(project.users) == 2, "project should still be associated with two users"


def test_user_permissions_per_project(
    create_and_attach_project: Callable[
        [TestUserType, TestUserType, list[Permission]], Project
    ],
    test_users: list[TestUserType],
    verify_user_permissions: Callable[
        [TestUserType, Project, dict[int, list[Permission]]], None
    ],
):
    user_a = test_users[0]
    user_b = test_users[1]

    # Project One: Created by user A and shared with user B
    project_one = create_and_attach_project(
        user_a, user_b, [Permission.UPDATE_TODO_CATEGORY]
    )

    # Project Two: Created by user B and shared with user A
    project_two = create_and_attach_project(
        user_b, user_a, [Permission.CREATE_TODO_CATEGORY]
    )

    # Verify user permissions in Project One
    verify_user_permissions(
        user_a,
        project_one,
        {
            user_a["id"]: [Permission.ALL],
            user_b["id"]: [Permission.UPDATE_TODO_CATEGORY],
        },
    )

    # Verify user permissions in Project Two
    verify_user_permissions(
        user_b,
        project_two,
        {
            user_b["id"]: [Permission.ALL],
            user_a["id"]: [Permission.CREATE_TODO_CATEGORY],
        },
    )


@pytest.mark.parametrize("values", [[], "", None])
def test_cannot_pass_empty_permissions_to_attach_association(
    create_project: Callable[[TestUserType], Project],
    test_users: list[TestUserType],
    attach_project_to_user_request: Callable[
        [TestUserType, TestUserType, int, list[Permission]], Response
    ],
    values: str | list | None,
):
    project = create_project(test_users[0])
    response = attach_project_to_user_request(
        test_users[0], test_users[1], project.id, cast(list[Permission], values)
    )
    assert (
        response.status_code == 422
    ), "we shouldn't be able to pass empty permissions lists to this service"


def test_attach_with_all_and_other_permissions(
    create_project: Callable[[TestUserType], Project],
    attach_project_to_user_request: Callable[
        [TestUserType, TestUserType, int, list[Permission]], Response
    ],
    test_users: list[TestUserType],
):
    project = create_project(test_users[0])

    attach_response = attach_project_to_user_request(
        test_users[0],
        test_users[1],
        project.id,
        [Permission.ALL, Permission.CREATE_COMMENT],
    )

    assert (
        attach_response.status_code == 422
    ), "shouldn't be able to set ALL permission alongside other permissions"
