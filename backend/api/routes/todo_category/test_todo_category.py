from email import header
import json
from operator import le
from fastapi.testclient import TestClient
from api.conftest import _TEST_USERS, access_token_factory, app
from db.models.user_project_permission import Permission
from db.schemas.tag import Tag
from db.schemas.project import Project, ProjectRead
from db.schemas.todo_category import TodoCategory
from db.schemas.todo_item import TodoItem
from error.exceptions import ErrorCode


client = TestClient(app)


def test_todo_category_permissions():
    # create a project
    project_one = Project.model_validate(
        client.post(
            "/project/create",
            headers={"Authorization": f"Bearer {access_token_factory(_TEST_USERS[0])}"},
            json={"title": "project 1", "description": "-"},
        ).json(),
        strict=True,
    )

    project_two = Project.model_validate(
        client.post(
            "/project/create",
            headers={"Authorization": f"Bearer {access_token_factory(_TEST_USERS[0])}"},
            json={"title": "project 2", "description": "-"},
        ).json(),
        strict=True,
    )

    # add a category to the newly created project
    category = TodoCategory.model_validate(
        client.post(
            "/todo-category/create",
            headers={"Authorization": f"Bearer {access_token_factory(_TEST_USERS[0])}"},
            json={
                "title": "cat test 1",
                "description": "-",
                "project_id": project_one.id,
            },
        ).json(),
        strict=True,
    )

    # share it with user b with only update category permission
    response = client.post(
        "/project/attach-to-user",
        headers={"Authorization": f"Bearer {access_token_factory(_TEST_USERS[0])}"},
        json={
            "project_id": project_one.id,
            "username": _TEST_USERS[1]["username"],
            "permissions": [Permission.UPDATE_TODO_CATEGORY],
        },
    )

    assert (
        response.status_code == 200
    ), "owner should be able to share the project with others"

    # share it with user b with ALL permissions to make sure this doesn't affect the project 1 permissions
    response = client.post(
        "/project/attach-to-user",
        headers={"Authorization": f"Bearer {access_token_factory(_TEST_USERS[0])}"},
        json={
            "project_id": project_two.id,
            "username": _TEST_USERS[1]["username"],
            "permissions": [Permission.ALL, Permission.DELETE_TODO_CATEGORY],
        },
    )

    assert (
        response.status_code == 200
    ), "owner should be able to share the project with others"

    # try updating from a user doesn't have access
    response = client.patch(
        "/todo-category/update-item",
        json={"id": category.id, "title": "new title"},
        headers={"Authorization": f"Bearer {access_token_factory(_TEST_USERS[2])}"},
    )

    assert (
        response.status_code == 400
    ), "user c(not shared) should not be able to update a todo category because they don't have access"

    # try updating from a user who this project is shared with
    response = client.patch(
        "/todo-category/update-item",
        json={"id": category.id, "title": "new title"},
        headers={"Authorization": f"Bearer {access_token_factory(_TEST_USERS[1])}"},
    )

    assert (
        response.status_code == 200
    ), "user b(shared) should be able to update a todo category because they have access"

    # try creating from a owner
    response = client.patch(
        "/todo-category/update-item",
        json={"id": category.id, "title": "new title"},
        headers={"Authorization": f"Bearer {access_token_factory(_TEST_USERS[1])}"},
    )

    assert (
        response.status_code == 200
    ), "user a(owner) should be able to update a todo category because they have access"

    # try removing a tag from a not shared user
    response = client.request(
        "delete",
        url="/todo-category/detach-from-project",
        headers={"Authorization": f"Bearer {access_token_factory(_TEST_USERS[2])}"},
        json={"category_id": category.id, "project_id": project_one.id},
    )

    assert (
        response.status_code == 400
    ), "user c(not shared) shouldn't be able to remove a todo category item when it doesn't have the permission to do so"

    # try removing a tag from a user who doesnt even have access
    response = client.request(
        "delete",
        url="/todo-category/detach-from-project",
        headers={"Authorization": f"Bearer {access_token_factory(_TEST_USERS[1])}"},
        json={"category_id": category.id, "project_id": project_one.id},
    )

    assert (
        response.status_code == 400
    ), "user b(shared) shouldn't be able to remove a todo category when it doesn't have the permission to do so"

    # try removing a tag from shared user
    response = client.request(
        "delete",
        url="/todo-category/detach-from-project",
        headers={"Authorization": f"Bearer {access_token_factory(_TEST_USERS[0])}"},
        json={"category_id": category.id, "project_id": project_one.id},
    )

    assert (
        response.status_code == 200
    ), "user a(owner) should be be able to remove todo categories"