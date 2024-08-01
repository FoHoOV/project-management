from typing import Callable, Dict
import pytest
from fastapi.testclient import TestClient

from tests.api.conftest import TestUserType
from db.models.user_project_permission import Permission
from db.schemas.project import Project
from db.schemas.todo_category import TodoCategory


def test_todo_category_create(
    create_project: Callable[[TestUserType], Project],
    create_todo_category: Callable[[TestUserType, int], TodoCategory],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    test_users: list[TestUserType],
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Shared user with permission

    # Create a project
    project_one = create_project(user_a)

    # Share project_one with user_b with UPDATE_TODO_CATEGORY permission
    attach_project_to_user(
        user_a, user_b, project_one.id, [Permission.CREATE_TODO_CATEGORY]
    )

    create_todo_category(user_b, project_one.id)


def test_todo_category_permissions(
    auth_header_factory: Callable[[TestUserType], Dict[str, str]],
    create_project: Callable[[TestUserType], Project],
    create_todo_category: Callable[[TestUserType, int], TodoCategory],
    attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    test_users: list[TestUserType],
    test_client: TestClient,
):
    user_a = test_users[0]  # Owner
    user_b = test_users[1]  # Shared user with permission
    user_c = test_users[2]  # User without access

    # Create two projects and add a category to the first one
    project_one = create_project(user_a)
    project_two = create_project(user_a)
    category = create_todo_category(user_a, project_one.id)

    # Share project_one with user_b with UPDATE_TODO_CATEGORY permission
    attach_project_to_user(
        user_a, user_b, project_one.id, [Permission.UPDATE_TODO_CATEGORY]
    )

    # Share project_two with user_b with ALL permissions
    attach_project_to_user(
        user_a,
        user_b,
        project_two.id,
        [Permission.ALL],
    )

    # Try updating a category by user_c (should fail)
    response = test_client.patch(
        f"/todo-categories/{category.id}",
        headers=auth_header_factory(user_c),
        json={"item": {"title": "new title"}},
    )
    assert (
        response.status_code == 400
    ), "User C (without access) should not be able to update the category"

    # Update the category by user_b (should succeed)
    response = test_client.patch(
        f"/todo-categories/{category.id}",
        headers=auth_header_factory(user_b),
        json={"item": {"title": "new title"}},
    )
    assert (
        response.status_code == 200
    ), "User B (with permission) should be able to update the category"

    # Try removing the category by user_c (should fail)
    response = test_client.request(
        "delete",
        f"/todo-categories/{category.id}/projects/{project_one.id}",
        headers=auth_header_factory(user_c),
    )
    assert (
        response.status_code == 400
    ), "User C (without access) should not be able to remove the category"

    # Remove the category by user_a (owner) (should succeed)
    response = test_client.request(
        "delete",
        f"/todo-categories/{category.id}/projects/{project_one.id}",
        headers=auth_header_factory(user_a),
    )
    assert (
        response.status_code == 200
    ), "User A (owner) should be able to remove the category"
