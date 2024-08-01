from typing import Callable
from fastapi.testclient import TestClient
import pytest

from db.models.user_project_permission import Permission

from tests.api.conftest import TestUserType


@pytest.fixture(scope="function")
def update_user_permissions(
    test_client: TestClient,
    auth_header_factory: Callable[[TestUserType], dict[str, str]],
):
    def _update_permissions(
        user: TestUserType,
        project_id: int,
        target_user_id: int,
        permissions: list[Permission],
    ):
        response = test_client.put(
            f"/permissions/{project_id}",
            headers=auth_header_factory(user),
            json={
                "user_id": target_user_id,
                "permissions": permissions,
            },
        )
        return response

    return _update_permissions
