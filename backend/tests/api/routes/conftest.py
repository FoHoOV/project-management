from typing import Callable, Dict
from fastapi.testclient import TestClient
import pytest

from db.models.user_project_permission import Permission
from db.schemas.project import (
    Project,
    ProjectAttachAssociationResponse,
)
from db.schemas.todo_category import TodoCategory
from db.schemas.todo_item import TodoItem
from tests.api.conftest import TestUserType


@pytest.fixture(scope="function")
def auth_header_factory(
    access_token_factory: Callable[[TestUserType], str],
):
    def _get_auth_header(user: TestUserType):
        """Fixture to generate authorization header for a test user."""
        return {"Authorization": f"Bearer {access_token_factory(user)}"}

    return _get_auth_header


@pytest.fixture(scope="function")
def test_project_factory(auth_header_factory, test_client: TestClient):
    """Fixture to create a project for testing."""

    def _create_project(user: TestUserType):
        response = test_client.post(
            "/projects",
            headers=auth_header_factory(user),
            json={
                "title": "Project for Testing",
                "description": "Test Project Description",
            },
        )
        project = Project.model_validate(response.json(), strict=True)
        return project

    return _create_project


@pytest.fixture(scope="function")
def test_category_factory(
    auth_header_factory: Callable[..., dict[str, str]],
    test_client: TestClient,
):
    """Fixture to create a todo category within a project for testing."""

    def _create_category(user: TestUserType, project_id: int):
        response = test_client.post(
            "/todo-category/create",
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


@pytest.fixture(scope="function")
def test_todo_item_factory(auth_header_factory, test_client: TestClient):
    """Helper function to create a todo item."""

    def _create_todo_item(user: TestUserType, category_id: int):
        response = test_client.post(
            "/todo-item/create",
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


@pytest.fixture(scope="function")
def test_attach_project_to_user(
    auth_header_factory: Callable[..., dict[str, str]], test_client: TestClient
):
    def _attach_to_user(
        owner: TestUserType,
        new_user: TestUserType,
        project_id: int,
        permissions: list[Permission],
    ):
        attach_to_user_response = test_client.post(
            f"/projects/{project_id}/users",
            headers=auth_header_factory(owner),
            json={
                "username": new_user["username"],
                "permissions": permissions,
            },
        )
        assert (
            attach_to_user_response.status_code == 200
        ), "Sharing project with permissions failed"

        return ProjectAttachAssociationResponse.model_validate(
            attach_to_user_response.json(), strict=True
        )

    return _attach_to_user
