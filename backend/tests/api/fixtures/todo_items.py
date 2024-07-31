from fastapi.testclient import TestClient
import pytest


from db.schemas.todo_item import TodoItem
from tests.api.conftest import TestUserType


@pytest.fixture(scope="function")
def test_todo_item_factory(auth_header_factory, test_client: TestClient):
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
        return TodoItem.model_validate(response.json(), strict=True)

    return _create_todo_item
