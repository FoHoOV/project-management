from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient

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


@pytest.fixture(scope="function")
def get_all_permissions_except():
    def _permissions(except_list: list[Permission], exclude_all_permission=True):

        all_permissions = list(Permission)

        if exclude_all_permission:
            except_list = list(except_list)
            except_list.append(Permission.ALL)

        filtered_permissions = [
            perm for perm in all_permissions if perm not in except_list
        ]

        return filtered_permissions

    return _permissions
