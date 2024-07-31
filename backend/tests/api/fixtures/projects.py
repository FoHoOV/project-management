from typing import Callable
from fastapi.testclient import TestClient
import pytest

from db.models.user_project_permission import Permission
from db.schemas.project import (
    Project,
    ProjectAttachAssociationResponse,
)

from tests.api.conftest import TestUserType


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
