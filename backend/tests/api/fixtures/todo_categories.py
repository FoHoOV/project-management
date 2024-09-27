from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient
from httpx import Response

from db.schemas.todo_category import TodoCategory
from tests.api.conftest import TestUserType


@pytest.fixture(scope="function")
def create_todo_category_request(
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
        return response

    return _create_category


@pytest.fixture(scope="function")
def create_todo_category(
    create_todo_category_request: Callable[[TestUserType, int], Response]
):
    """Fixture to create a todo category within a project for testing."""

    def _create_category(user: TestUserType, project_id: int):
        response = create_todo_category_request(user, project_id)
        assert (
            response.status_code == 200
        ), "category should be created with status = 200"

        category = TodoCategory.model_validate(response.json(), strict=True)
        return category

    return _create_category


@pytest.fixture(scope="function")
def update_todo_category_request(
    test_client: TestClient,
    auth_header_factory: Callable[[TestUserType], dict[str, str]],
):
    def _update_category(user: TestUserType, category_id: int, new_title: str):
        response = test_client.patch(
            f"/todo-categories/{category_id}",
            headers=auth_header_factory(user),
            json={"item": {"title": new_title}},
        )
        return response

    return _update_category


@pytest.fixture(scope="function")
def delete_todo_category_request(
    test_client: TestClient,
    auth_header_factory: Callable[[TestUserType], dict[str, str]],
):
    def _delete_category(user: TestUserType, category_id: int, project_id: int):
        response = test_client.delete(
            f"/todo-categories/{category_id}/projects/{project_id}",
            headers=auth_header_factory(user),
        )
        return response

    return _delete_category
