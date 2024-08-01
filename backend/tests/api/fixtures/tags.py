from typing import Callable, Dict
from fastapi.testclient import TestClient
import pytest
from tests.api.conftest import TestUserType


@pytest.fixture(scope="function")
def create_tag_request(
    test_client: TestClient,
    auth_header_factory: Callable[[TestUserType], Dict[str, str]],
):
    def _create_tag(user: TestUserType, project_id: int, todo_id: int, tag_name: str):
        response = test_client.post(
            f"/tags/{tag_name}/todo-items",
            headers=auth_header_factory(user),
            json={
                "project_id": project_id,
                "todo_id": todo_id,
                "create_if_doesnt_exist": True,
            },
        )
        return response

    return _create_tag


@pytest.fixture(scope="function")
def remove_tag_request(
    test_client: TestClient,
    auth_header_factory: Callable[[TestUserType], Dict[str, str]],
):
    def _remove_tag(user: TestUserType, tag_name: str, todo_id: int):
        response = test_client.delete(
            f"/tags/{tag_name}/todo-items/{todo_id}",
            headers=auth_header_factory(user),
        )
        return response

    return _remove_tag
