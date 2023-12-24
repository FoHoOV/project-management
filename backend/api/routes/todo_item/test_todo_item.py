from email import header
import json
from operator import le
from fastapi.testclient import TestClient
from api.test import TEST_USER, get_access_token, app
from db.schemas.project import Project, ProjectRead
from db.schemas.todo_category import TodoCategory
from db.schemas.todo_item import TodoItem
from error.exceptions import ErrorCode


client = TestClient(app)


def test_create_todo_item_not_belonging_to_user():
    response = client.post(
        "/todo-item/create",
        headers={"Authorization": f"Bearer {get_access_token()}"},
        json={
            "title": "test",
            "description": "test",
            "is_done": False,
            "category_id": -1,
        },
    )

    assert response.status_code == 400
    assert "code" in response.json()
    assert response.json()["code"] == ErrorCode.TODO_CATEGORY_NOT_FOUND


def test_list_all_todos():
    project = Project.model_validate(
        client.post(
            "project/create",
            headers={"Authorization": f"Bearer {get_access_token()}"},
            json={"title": "list_test_p", "description": "-"},
        ).json(),
        strict=True,
    )
    category = TodoCategory.model_validate(
        client.post(
            "todo-category/create",
            headers={"Authorization": f"Bearer {get_access_token()}"},
            json={"title": "list_test_c", "description": "-", "project_id": project.id},
        ).json(),
        strict=True,
    )

    number_of_todos_to_create = 10
    for i in range(number_of_todos_to_create):
        response = client.post(
            "/todo-item/create",
            headers={"Authorization": f"Bearer {get_access_token()}"},
            json={
                "title": "test{i}",
                "description": "test{i}",
                "is_done": False,
                "category_id": category.id,
            },
        )

        assert response.status_code == 200

    todos_response = client.get(
        "/todo-item/list",
        params={"project_id": project.id, "category_id": category.id},
        headers={"Authorization": f"Bearer {get_access_token()}"},
    )

    assert todos_response.status_code == 200
    assert len(list(todos_response.json())) == number_of_todos_to_create

    todos = [
        TodoItem.model_validate(x, strict=True)
        for x in client.get(
            "/todo-item/list",
            params={"project_id": project.id, "category_id": category.id},
            headers={"Authorization": f"Bearer {get_access_token()}"},
        ).json()
    ]

    # testing default sort
    for i, todo in enumerate(todos):
        if i == len(todos) - 1:
            assert todo.order.left_id is None
        else:
            assert todo.order.left_id == todos[i + 1].id

        if i > 0:
            assert todo.order.right_id == todos[i - 1].id


def test_reorder_todos():
    project = Project.model_validate(
        client.post(
            "project/create",
            headers={"Authorization": f"Bearer {get_access_token()}"},
            json={"title": "reorder_test_p", "description": "-"},
        ).json(),
        strict=True,
    )
    category = TodoCategory.model_validate(
        client.post(
            "todo-category/create",
            headers={"Authorization": f"Bearer {get_access_token()}"},
            json={
                "title": "reorder_test_c",
                "description": "-",
                "project_id": project.id,
            },
        ).json(),
        strict=True,
    )

    number_of_todos_to_create = 10
    for i in range(number_of_todos_to_create):
        response = client.post(
            "/todo-item/create",
            headers={"Authorization": f"Bearer {get_access_token()}"},
            json={
                "title": "test{i}",
                "description": "test{i}",
                "is_done": False,
                "category_id": category.id,
            },
        )

        assert response.status_code == 200

    todos = [
        TodoItem.model_validate(x, strict=True)
        for x in client.get(
            "/todo-item/list",
            params={"project_id": project.id, "category_id": category.id},
            headers={"Authorization": f"Bearer {get_access_token()}"},
        ).json()
    ]

    reorder_response = client.patch(
        "/todo-item/update-order",
        json={
            "id": todos[0].id,
            "left_id": None,
            "right_id": todos[-1].id,
            "new_category_id": category.id,
        },
        headers={"Authorization": f"Bearer {get_access_token()}"},
    )

    assert reorder_response.status_code == 200

    todos = [
        TodoItem.model_validate(x, strict=True)
        for x in client.get(
            "/todo-item/list",
            params={"project_id": project.id, "category_id": category.id},
            headers={"Authorization": f"Bearer {get_access_token()}"},
        ).json()
    ]

    assert todos[-1].order.right_id == todos[-2].id
    assert todos[-1].order.left_id == todos[0].id
    assert todos[0].order.right_id == todos[-1].id
    assert todos[0].order.left_id == None
