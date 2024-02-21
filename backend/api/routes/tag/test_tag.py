from email import header
import json
from operator import le
from fastapi.testclient import TestClient
from api.test import TEST_USERS, get_access_token, app
from db.models.user_project_permission import Permission
from db.schemas.tag import Tag
from db.schemas.project import Project, ProjectRead
from db.schemas.todo_category import TodoCategory
from db.schemas.todo_item import TodoItem
from error.exceptions import ErrorCode


client = TestClient(app)


def test_todo_tag_permissions():
    # create a project
    project_one = Project.model_validate(
        client.post(
            "/project/create",
            headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
            json={"title": "project 1", "description": "-"},
        ).json(),
        strict=True,
    )

    project_two = Project.model_validate(
        client.post(
            "/project/create",
            headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
            json={"title": "project 2", "description": "-"},
        ).json(),
        strict=True,
    )

    # add a category to the newly created project
    category = TodoCategory.model_validate(
        client.post(
            "/todo-category/create",
            headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
            json={
                "title": "reorder_test_c",
                "description": "-",
                "project_id": project_one.id,
            },
        ).json(),
        strict=True,
    )

    # share it with user b with only edit todo permission
    response = client.post(
        "/project/attach-to-user",
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
        json={
            "project_id": project_one.id,
            "username": TEST_USERS[1]["username"],
            "permissions": [Permission.CREATE_TAG],
        },
    )

    assert (
        response.status_code == 200
    ), "owner should be able to share the project with others"

    # share it with user b with ALL permissions to make sure this doesn't affect the project 1 permissions
    response = client.post(
        "/project/attach-to-user",
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
        json={
            "project_id": project_two.id,
            "username": TEST_USERS[1]["username"],
            "permissions": [Permission.ALL, Permission.DELETE_TODO_CATEGORY],
        },
    )

    # create a todo item to begin testing modifications to this item
    todo_item = TodoItem.model_validate(
        client.post(
            "/todo-item/create",
            headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
            json={
                "title": "test",
                "description": "test",
                "is_done": False,
                "category_id": category.id,
            },
        ).json(),
        strict=True,
    )

    # try creating from a user doesn't have access
    response = client.post(
        "/tag/attach-to-todo",
        json={
            "project_id": project_one.id,
            "todo_id": todo_item.id,
            "name": "test tag",
            "create_if_doesnt_exist": True,
        },
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[2])}"},
    )

    assert (
        response.status_code == 400
    ), "user c(not shared) should not be able to create a new tag because they don't have access"

    # try creating from a user who this project is shared with
    response = client.post(
        "/tag/attach-to-todo",
        json={
            "project_id": project_one.id,
            "todo_id": todo_item.id,
            "name": "test tag",
            "create_if_doesnt_exist": True,
        },
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[1])}"},
    )

    assert (
        response.status_code == 200
    ), "user b(shared) should be able to create a tag because they have access"

    response = client.post(
        "/tag/attach-to-todo",
        json={
            "project_id": project_one.id,
            "todo_id": todo_item.id,
            "name": "test tag 2",
            "create_if_doesnt_exist": True,
        },
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[1])}"},
    )

    assert (
        response.status_code == 200
    ), "user a(owner) should be able to create a tag because they have access"

    # try creating from a owner
    created_tag_by_owner = Tag.model_validate(
        response.json(),
        strict=True,
    )

    # try removing a tag from a not shared user
    response = client.request(
        "delete",
        url="/tag/detach-from-todo",
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[2])}"},
        json={"tag_id": created_tag_by_owner.id, "todo_id": todo_item.id},
    )

    assert (
        response.status_code == 400
    ), "user c(not shared) shouldn't be able to remove a tag item when it doesn't have the permission to do so"

    # try removing a tag from a user who doesnt even have access
    response = client.request(
        "delete",
        url="/tag/detach-from-todo",
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[1])}"},
        json={"tag_id": created_tag_by_owner.id, "todo_id": todo_item.id},
    )

    assert (
        response.status_code == 400
    ), "user b(shared) shouldn't be able to remove a todo tag when it doesn't have the permission to do so"

    # try removing a tag from shared user
    response = client.request(
        "delete",
        url="/tag/detach-from-todo",
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
        json={"tag_id": created_tag_by_owner.id, "todo_id": todo_item.id},
    )

    assert response.status_code == 200, "user a(owner) should be be able to remove"
