from typing import Callable
from fastapi.testclient import TestClient
from httpx import Response, ResponseNotRead
import pytest


from db.schemas.todo_item import TodoItem
from tests.api.conftest import TestUserType


@pytest.fixture(scope="function")
def create_todo_item_request(auth_header_factory, test_client: TestClient):
    """Helper function to create a todo item."""

    def _create_todo_item(user: TestUserType, category_id: int):
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
def create_todo_item(create_todo_item_request: Callable[[TestUserType, int], Response]):
    """Helper function to create a todo item."""

    def _create_todo_item(user: TestUserType, category_id: int):
        response = create_todo_item_request(user, category_id)
        return TodoItem.model_validate(response.json(), strict=True)

    return _create_todo_item


@pytest.fixture(scope="function")
def list_todo_items_request(
    test_client: TestClient,
    auth_header_factory: Callable[[TestUserType], dict[str, str]],
):
    def _list_todo_items(user: TestUserType, project_id: int, category_id: int):
        response = test_client.get(
            "/todo-items",
            params={"project_id": project_id, "category_id": category_id},
            headers=auth_header_factory(user),
        )
        return response

    return _list_todo_items


@pytest.fixture(scope="function")
def list_todo_items(
    list_todo_items_request: Callable[[TestUserType, int, int], Response]
):
    def _list_todo_items(user: TestUserType, project_id: int, category_id: int):
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
    auth_header_factory: Callable[[TestUserType], dict[str, str]],
):
    def _update_done_status(user: TestUserType, todo_id: int, is_done: bool):
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
def update_todo_item_order_request(
    test_client: TestClient,
    auth_header_factory: Callable[[TestUserType], dict[str, str]],
):
    def _update_todo_item_order(
        user: TestUserType,
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
    auth_header_factory: Callable[[TestUserType], dict[str, str]],
):
    def _delete_todo_item(user: TestUserType, todo_id: int):
        response = test_client.delete(
            f"/todo-items/{todo_id}",
            headers=auth_header_factory(user),
        )
        return response

    return _delete_todo_item
