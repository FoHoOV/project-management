from typing import Callable, Dict
from fastapi.testclient import TestClient

from api.conftest import (
    TestUserType,
)
from db.models.user_project_permission import Permission
from db.schemas.project import Project
from db.schemas.tag import Tag
from db.schemas.todo_category import TodoCategory
from db.schemas.todo_item import TodoItem


def test_todo_tag_permissions(
    auth_header_factory: Callable[[TestUserType], Dict[str, str]],
    test_project_factory: Callable[[TestUserType], Project],
    test_category_factory: Callable[[TestUserType, int], TodoCategory],
    test_todo_item_factory: Callable[[TestUserType, int], TodoCategory],
    test_attach_project_to_user: Callable[
        [TestUserType, TestUserType, int, list[Permission]], None
    ],
    test_users: list[TestUserType],
    test_client: TestClient,
):
    user_a = test_users[0]
    user_b = test_users[1]
    user_c = test_users[2]

    # Create projects and a category under project_one
    project_one = test_project_factory(user_a)
    project_two = test_project_factory(user_a)
    category = test_category_factory(user_a, project_one.id)

    # Share project_one with user_b with CREATE_TAG permission
    test_attach_project_to_user(user_a, user_b, project_one.id, [Permission.CREATE_TAG])

    # Share project_two with user_b with all permissions to ensure isolation
    test_attach_project_to_user(
        user_a,
        user_b,
        project_two.id,
        [Permission.ALL, Permission.DELETE_TODO_CATEGORY],
    )

    # Create a todo item under project_one
    todo_item = test_todo_item_factory(user_a, category.id)

    # Try creating a tag attached to the todo item by user_c (who doesn't have access)
    response = test_client.post(
        "/tag/attach-to-todo",
        headers=auth_header_factory(user_c),
        json={
            "project_id": project_one.id,
            "todo_id": todo_item.id,
            "name": "test tag",
            "create_if_doesnt_exist": True,
        },
    )
    assert (
        response.status_code == 400
    ), "User C (not shared) should not be able to create a new tag because they don't have access"

    # Try creating a tag attached to the todo item by user_b (who has access)
    response = test_client.post(
        "/tag/attach-to-todo",
        headers=auth_header_factory(user_b),
        json={
            "project_id": project_one.id,
            "todo_id": todo_item.id,
            "name": "test tag",
            "create_if_doesnt_exist": True,
        },
    )
    assert (
        response.status_code == 200
    ), "User B (shared) should be able to create a tag because they have access"

    # Validate tag creation and then try to remove it
    created_tag = Tag.model_validate(response.json(), strict=True)

    # Try removing the tag by user_c (should fail)
    response = test_client.request(
        "delete",
        "/tag/detach-from-todo",
        headers=auth_header_factory(user_c),
        json={"tag_id": created_tag.id, "todo_id": todo_item.id},
    )
    assert (
        response.status_code == 400
    ), "User C (not shared) shouldn't be able to remove a tag when they don't have the permission"

    # Try removing the tag by user_b (should also fail due to insufficient permissions)
    response = test_client.request(
        "delete",
        "/tag/detach-from-todo",
        headers=auth_header_factory(user_b),
        json={"tag_id": created_tag.id, "todo_id": todo_item.id},
    )
    assert (
        response.status_code == 400
    ), "User B (shared) shouldn't be able to remove a todo tag when they don't have the specific permission"

    # Remove the tag by user_a (owner), which should succeed
    response = test_client.request(
        "delete",
        "/tag/detach-from-todo",
        headers=auth_header_factory(user_a),
        json={"tag_id": created_tag.id, "todo_id": todo_item.id},
    )
    assert (
        response.status_code == 200
    ), "User A (owner) should be able to remove the tag"
