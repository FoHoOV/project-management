from email import header
import json
from operator import le
from fastapi.testclient import TestClient
from api.test import TEST_USERS, get_access_token, app
from db.models.user_project_permission import Permission
from db.schemas.project import Project, ProjectRead
from db.schemas.todo_category import TodoCategory
from db.schemas.todo_item import TodoItem
from error.exceptions import ErrorCode


client = TestClient(app)


def test_todo_comment_permissions():
    # create a project
    project = Project.model_validate(
        client.post(
            "/project/create",
            headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
            json={"title": "reorder_test_p", "description": "-"},
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
                "project_id": project.id,
            },
        ).json(),
        strict=True,
    )

    # share it with user b with only edit todo permission
    response = client.post(
        "/project/attach-to-user",
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
        json={
            "project_id": project.id,
            "username": TEST_USERS[1]["username"],
            "permissions": [Permission.CREATE_COMMENT],
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
        "/todo-item/comment/create",
        json={
            "todo_id": todo_item.id,
            "message": "some message",
        },
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[2])}"},
    )

    assert (
        response.status_code == 400
    ), "user c(not shared) should not be able to create a new comment because they don't have access"

    # try creating from a user who this project is shared with
    response = client.post(
        "/todo-item/comment/create",
        json={"todo_id": todo_item.id, "message": "some message"},
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[1])}"},
    )

    assert (
        response.status_code == 200
    ), "user b(shared) should be able to create the todo comment because they have access"

    # try creating from a owner
    response = client.post(
        "/todo-item/comment/create",
        json={"todo_id": todo_item.id, "message": "some message"},
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[1])}"},
    )

    # try removing a comment from a not shared user
    response = client.request(
        "delete",
        url="/todo-item/comment/delete",
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[2])}"},
        json={
            "id": todo_item.id,
        },
    )

    assert (
        response.status_code == 400
    ), "user c(not shared) shouldn't be able to remove a comment item when it doesn't have the permission to do so"

    # try removing a comment from a user who doesnt even have access
    response = client.request(
        "delete",
        url="/todo-item/comment/delete",
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[2])}"},
        json={
            "id": todo_item.id,
        },
    )

    assert (
        response.status_code == 400
    ), "user b(shared) shouldn't be able to remove a todo comment when it doesn't have the permission to do so"

    # try removing a comment from shared user
    response = client.request(
        "delete",
        url="/todo-item/comment/delete",
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
        json={
            "id": todo_item.id,
        },
    )

    assert response.status_code == 200, "user a(owner) should be be able to remove"
