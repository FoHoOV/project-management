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


def test_create_todo_item_not_belonging_to_user():
    response = client.post(
        "/todo-item/create",
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
        json={
            "title": "test",
            "description": "test",
            "is_done": False,
            "category_id": -1,
        },
    )

    assert response.status_code == 400
    assert "code" in response.json()
    assert (
        response.json()["code"] == ErrorCode.TODO_CATEGORY_NOT_FOUND
    ), "when inserting into a category that does not belong to user, we should encounter an TODO_CATEGORY_NOT_FOUND error"


def test_list_all_todos():
    # create a project
    project = Project.model_validate(
        client.post(
            "/project/create",
            headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
            json={"title": "list_test_p", "description": "-"},
        ).json(),
        strict=True,
    )

    # add a category to the newly created project
    category = TodoCategory.model_validate(
        client.post(
            "todo-category/create",
            headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
            json={"title": "list_test_c", "description": "-", "project_id": project.id},
        ).json(),
        strict=True,
    )

    # add {number_of_todos_to_create} todos to the created category
    number_of_todos_to_create = 10
    for i in range(number_of_todos_to_create):
        response = client.post(
            "/todo-item/create",
            headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
            json={
                "title": f"test{i}",
                "description": f"test{i}",
                "is_done": False,
                "category_id": category.id,
            },
        )

        assert response.status_code == 200

    # query all todos for this category
    todos_response = client.get(
        "/todo-item/list",
        params={"project_id": project.id, "category_id": category.id},
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
    )

    assert todos_response.status_code == 200
    assert (
        len(list(todos_response.json())) == number_of_todos_to_create
    ), "number of todos in a new category should equal to the number of created todos for that category (excluding the dnd scenario)"

    # convert them to TodoItem model
    todos = [
        TodoItem.model_validate(x, strict=True)
        for x in client.get(
            "/todo-item/list",
            params={"project_id": project.id, "category_id": category.id},
            headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
        ).json()
    ]

    # testing default sort
    for i, todo in enumerate(todos):
        if i == len(todos) - 1:
            assert todo.order.left_id is None
        else:
            assert (
                todo.order.left_id == todos[i + 1].id
            ), "todo items should by default be sorted from oldest to newest"

        if i > 0:
            assert (
                todo.order.right_id == todos[i - 1].id
            ), "todo items should by default be sorted from oldest to newest"


def test_reorder_todos():
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

    # add {number_of_todos_to_create} todos to the created category
    number_of_todos_to_create = 10
    for i in range(number_of_todos_to_create):
        response = client.post(
            "/todo-item/create",
            headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
            json={
                "title": f"test{i}",
                "description": f"test{i}",
                "is_done": False,
                "category_id": category.id,
            },
        )

        assert response.status_code == 200

    # query all todos for this category
    todos = [
        TodoItem.model_validate(x, strict=True)
        for x in client.get(
            "/todo-item/list",
            params={"project_id": project.id, "category_id": category.id},
            headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
        ).json()
    ]

    # move last item to the left-side of the first item (which makes it the first item in the list)
    reorder_response = client.patch(
        "/todo-item/update-order",
        json={
            "id": todos[0].id,
            "left_id": None,
            "right_id": todos[-1].id,
            "new_category_id": category.id,
        },
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
    )

    assert reorder_response.status_code == 200

    todos = [
        TodoItem.model_validate(x, strict=True)
        for x in client.get(
            "/todo-item/list",
            params={"project_id": project.id, "category_id": category.id},
            headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
        ).json()
    ]

    # check the order
    assert (
        todos[-1].order.right_id == todos[-2].id
    ), "after reorder, newest todo should still be on the left-side of the second newest todo"
    assert (
        todos[-1].order.left_id == todos[0].id
    ), "after reorder, newest todo must on the right-side of the oldest todo"
    assert (
        todos[0].order.right_id == todos[-1].id
    ), "after reorder, oldest todo must be on left-side of the newest todo"
    assert (
        todos[0].order.left_id == None
    ), "after reorder, oldest todo must be the first one in the list"


def test_todo_item_permissions():
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
            "permissions": [Permission.UPDATE_TODO_ITEM],
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

    # try deleting from a user who doesn't have access
    response = client.request(
        "delete",
        "/todo-item/remove",
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[1])}"},
        json={
            "id": todo_item.id,
        },
    )

    assert (
        response.status_code == 400
    ), "user b(shared) shouldn't be able to remove a todo item when it doesn't have the permission to do so"

    # try updating from a user who has access -- todo-item endpoint
    response = client.patch(
        "/todo-item/update-item",
        json={
            "id": todo_item.id,
            "category_id": todo_item.category_id,
            "is_done": True,
        },
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[1])}"},
    )

    assert (
        response.status_code == 200
    ), "user b(shared) should be able to update the todo item because they have access"

    # try updating from a user who this project isn't even shared with them
    response = client.patch(
        "/todo-item/update-item",
        json={
            "id": todo_item.id,
            "category_id": todo_item.category_id,
            "is_done": True,
        },
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[2])}"},
    )

    assert (
        response.status_code == 400
    ), "user c(not shared) should be not able to update the todo item because they shouldn't even see this project"

    # try deleting the item from the owner
    response = client.request(
        "delete",
        "/todo-item/remove",
        headers={"Authorization": f"Bearer {get_access_token(TEST_USERS[0])}"},
        json={
            "id": todo_item.id,
        },
    )

    assert (
        response.status_code == 200
    ), "user a(owner) should be able to remove a todo item"
