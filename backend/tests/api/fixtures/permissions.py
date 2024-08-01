from typing import Callable
from fastapi.testclient import TestClient
import pytest

from db.models.user_project_permission import Permission

from db.schemas.project import Project
from tests.api.conftest import TestUserType


@pytest.fixture(scope="function")
def update_user_permissions_request(
    test_client: TestClient,
    auth_header_factory: Callable[[TestUserType], dict[str, str]],
):

    def _update_permissions(
        owner: TestUserType,
        target: TestUserType,
        project_id: int,
        permissions: list[Permission],
    ):
        response = test_client.put(
            f"/permissions/{project_id}",
            headers=auth_header_factory(owner),
            json={
                "user_id": target["id"],
                "permissions": permissions,
            },
        )
        return response

    return _update_permissions


@pytest.fixture(scope="function")
def verify_user_permissions(search_project: Callable[[TestUserType, int], Project]):
    def _verify_permissions(
        user: TestUserType,
        project: Project,
        expected_permissions: dict[int, list[Permission]],
    ):
        project_details = search_project(user, project.id)
        for id, permissions in expected_permissions.items():
            user_permissions = next(
                user_data for user_data in project_details.users if user_data.id == id
            ).permissions
            assert sorted(user_permissions) == sorted(
                permissions
            ), f"Permissions for user_id {id} do not match"

    return _verify_permissions
