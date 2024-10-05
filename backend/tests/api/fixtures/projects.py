from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient
from httpx import Response

from db.models.user_project_permission import Permission
from db.schemas.project import Project, ProjectAttachAssociationResponse
from tests.api.conftest import UserType


@pytest.fixture(scope="function")
def create_project_request(auth_header_factory, test_client: TestClient):
    """Fixture to create a project for testing."""

    def _create_project(user: UserType, create_from_default_template: bool = False):
        response = test_client.post(
            "/projects",
            headers=auth_header_factory(user),
            json={
                "title": "Project for Testing",
                "description": "Test Project Description",
                "create_from_default_template": create_from_default_template,
            },
        )
        return response

    return _create_project


@pytest.fixture(scope="function")
def create_project(create_project_request: Callable[[UserType, bool], Response]):
    """Fixture to create a project for testing."""

    def _create_project(user: UserType, create_from_default_template: bool = False):
        project = Project.model_validate(
            create_project_request(user, create_from_default_template).json(),
            strict=True,
        )
        return project

    return _create_project


@pytest.fixture(scope="function")
def attach_project_to_user_request(
    auth_header_factory: Callable[[UserType], dict[str, str]],
    test_client: TestClient,
):

    def _attach(
        owner: UserType,
        new_user: UserType,
        project_id: int,
        permissions: list[Permission],
    ):
        response = test_client.post(
            f"/projects/{project_id}/users",
            headers=auth_header_factory(owner),
            json={"username": new_user["username"], "permissions": permissions},
        )
        return response

    return _attach


@pytest.fixture(scope="function")
def attach_project_to_user(
    attach_project_to_user_request: Callable[
        [UserType, UserType, int, list[Permission]], Response
    ]
):
    def _attach_to_user(
        owner: UserType,
        new_user: UserType,
        project_id: int,
        permissions: list[Permission],
    ):
        response = attach_project_to_user_request(
            owner, new_user, project_id, permissions
        )
        assert response.status_code == 200, "Sharing project with permissions failed"

        return ProjectAttachAssociationResponse.model_validate(
            response.json(), strict=True
        )

    return _attach_to_user


@pytest.fixture(scope="function")
def detach_project_from_user_request(
    auth_header_factory: Callable[[UserType], dict[str, str]],
    test_client: TestClient,
):

    def _detach(
        owner: UserType,
        other_user: UserType,
        project_id: int,
    ):
        response = test_client.delete(
            f"/projects/{project_id}/users/{other_user['id']}",
            headers=auth_header_factory(owner),
        )
        return response

    return _detach


@pytest.fixture(scope="function")
def detach_project_from_user(
    detach_project_from_user_request: Callable[[UserType, UserType, int], Response]
):

    def _detach(
        owner: UserType,
        other_user: UserType,
        project_id: int,
    ):
        response = detach_project_from_user_request(owner, other_user, project_id)
        assert response.status_code == 200, "detaching project from user failed"

    return _detach


@pytest.fixture(scope="function")
def search_project_request(
    test_client: TestClient,
    auth_header_factory: Callable[[UserType], dict[str, str]],
):
    def _get_project(user: UserType, project_id: int):
        response = test_client.get(
            f"/projects/{project_id}",
            headers=auth_header_factory(user),
        )
        return response

    return _get_project


@pytest.fixture(scope="function")
def search_project(
    search_project_request: Callable[[UserType, int], Response],
):
    def _get_project(user: UserType, project_id: int):
        return Project.model_validate(search_project_request(user, project_id).json())

    return _get_project


@pytest.fixture(scope="function")
def create_and_attach_project(
    create_project: Callable[[UserType, bool], Project],
    search_project: Callable[[UserType, int], Project],
    attach_project_to_user: Callable[[UserType, UserType, int, list[Permission]], None],
):
    def _create_and_attach(
        owner: UserType,
        shared_user: UserType,
        shared_user_permissions: list[Permission],
        create_from_default_template: bool = False,
    ):
        project = create_project(owner, create_from_default_template)
        attach_project_to_user(owner, shared_user, project.id, shared_user_permissions)
        return search_project(owner, project.id)

    return _create_and_attach
