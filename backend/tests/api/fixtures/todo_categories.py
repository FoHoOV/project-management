from typing import Callable
from fastapi.testclient import TestClient
import pytest


from db.schemas.todo_category import TodoCategory

from tests.api.conftest import TestUserType


@pytest.fixture(scope="function")
def create_todo_category(
    auth_header_factory: Callable[..., dict[str, str]],
    test_client: TestClient,
):
    """Fixture to create a todo category within a project for testing."""

    def _create_category(user: TestUserType, project_id: int):
        response = test_client.post(
            "/todo-categories",
            headers=auth_header_factory(user),
            json={
                "title": "Category for Testing",
                "description": "Test Category Description",
                "project_id": project_id,
            },
        )

        assert (
            response.status_code == 200
        ), "category should be created with status = 200"

        category = TodoCategory.model_validate(response.json(), strict=True)
        return category

    return _create_category
