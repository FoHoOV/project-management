from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient
from httpx import Response

from db.schemas.todo_item import TodoItem
from tests.api.conftest import UserType


@pytest.fixture(scope="function")
def create_todo_item_request(auth_header_factory, test_client: TestClient):
    """Helper function to create a todo item."""

    def _create_todo_item(user: UserType, category_id: int):
        response = test_client.post(
            "/todo-items",
            headers=auth_header_factory(user),
            json={
                "title": "Test todo title",
                "description": "Test todo description",
                "is_done": False,
                "category_id": category_id,
            },
        )
        return response

    return _create_todo_item


@pytest.fixture(scope="function")
def create_todo_item(create_todo_item_request: Callable[[UserType, int], Response]):
    """Helper function to create a todo item."""

    def _create_todo_item(user: UserType, category_id: int):
        response = create_todo_item_request(user, category_id)
        return TodoItem.model_validate(response.json(), strict=True)

    return _create_todo_item


@pytest.fixture(scope="function")
def list_todo_items_request(
    test_client: TestClient,
    auth_header_factory: Callable[[UserType], dict[str, str]],
):
    def _list_todo_items(user: UserType, project_id: int, category_id: int):
        response = test_client.get(
            "/todo-items",
            params={"project_id": project_id, "category_id": category_id},
            headers=auth_header_factory(user),
        )
        return response

    return _list_todo_items


@pytest.fixture(scope="function")
def list_todo_items(list_todo_items_request: Callable[[UserType, int, int], Response]):
    def _list_todo_items(user: UserType, project_id: int, category_id: int):
        response = list_todo_items_request(user, project_id, category_id)
        assert response.status_code == 200
        parsed_todos_before_reorder = [
            TodoItem.model_validate(x, strict=True) for x in response.json()
        ]
        return parsed_todos_before_reorder

    return _list_todo_items


@pytest.fixture(scope="function")
def update_todo_item_done_status_request(
    test_client: TestClient,
    auth_header_factory: Callable[[UserType], dict[str, str]],
):
    def _update_done_status(user: UserType, todo_id: int, is_done: bool):
        response = test_client.patch(
            f"/todo-items/{todo_id}",
            headers=auth_header_factory(user),
            json={
                "item": {
                    "is_done": is_done,
                }
            },
        )
        return response

    return _update_done_status


@pytest.fixture(scope="function")
def update_todo_item_done_status(
    update_todo_item_done_status_request: Callable[[UserType, int, bool], Response]
):  # -> Callable[..., None]:
    def _update_done_status(user: UserType, todo_id: int, is_done: bool):
        response = update_todo_item_done_status_request(user, todo_id, is_done)
        assert response.status_code == 200, "updating todo item failed"
        todo = TodoItem.model_validate(response.json(), strict=True)
        if is_done:
            assert todo.is_done == True, "Todo should be marked as done"
            assert todo.marked_as_done_by is not None
            assert (
                todo.marked_as_done_by.id == user["id"]
            ), "todo should be marked as done by this user"
        else:
            assert todo.is_done == False, "Todo should be marked as undone"
            assert (
                todo.marked_as_done_by is None
            ), "Since its undone this property should be null"

        return todo

    return _update_done_status


@pytest.fixture(scope="function")
def update_todo_item_order_request(
    test_client: TestClient,
    auth_header_factory: Callable[[UserType], dict[str, str]],
):
    def _update_todo_item_order(
        user: UserType,
        todo_id: int,
        left_id: int | None,
        right_id: int | None,
        new_category_id: int | None = None,
    ):
        request = {"right_id": new_category_id, "left_id": left_id}

        if new_category_id is not None:
            request["new_category_id"] = new_category_id

        response = test_client.patch(
            f"/todo-items/{todo_id}",
            headers=auth_header_factory(user),
            json={"order": request},
        )
        return response

    return _update_todo_item_order


@pytest.fixture(scope="function")
def delete_todo_item_request(
    test_client: TestClient,
    auth_header_factory: Callable[[UserType], dict[str, str]],
):
    def _delete_todo_item(user: UserType, todo_id: int):
        response = test_client.delete(
            f"/todo-items/{todo_id}",
            headers=auth_header_factory(user),
        )
        return response

    return _delete_todo_item
