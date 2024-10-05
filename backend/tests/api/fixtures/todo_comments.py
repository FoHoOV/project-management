from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient
from httpx import Response

from db.schemas.todo_item_comment import TodoComment
from tests.api.conftest import UserType


@pytest.fixture(scope="function")
def create_comment_request(
    test_client: TestClient,
    auth_header_factory: Callable[[UserType], dict[str, str]],
):
    def _create_comment(user: UserType, todo_item_id: int, message: str):
        response = test_client.post(
            f"/todo-items/{todo_item_id}/comments",
            headers=auth_header_factory(user),
            json={"message": message},
        )
        return response

    return _create_comment


@pytest.fixture(scope="function")
def create_comment(
    create_comment_request: Callable[[UserType, int, str], Response],
):
    def _create_comment(user: UserType, todo_item_id: int, message: str):
        response = create_comment_request(user, todo_item_id, message)
        return TodoComment.model_validate(response.json(), strict=True)

    return _create_comment


@pytest.fixture(scope="function")
def delete_comment_request(
    test_client: TestClient,
    auth_header_factory: Callable[[UserType], dict[str, str]],
):
    def _delete_comment(user: UserType, todo_item_id: int, comment_id: int):
        response = test_client.delete(
            f"/todo-items/{todo_item_id}/comments/{comment_id}",
            headers=auth_header_factory(user),
        )
        return response

    return _delete_comment


@pytest.fixture(scope="function")
def delete_comment(
    delete_comment_request: Callable[[UserType, int, int], Response],
):
    def _delete_comment(user: UserType, todo_item_id: int, comment_id: int):
        response = delete_comment_request(user, todo_item_id, comment_id)
        return response.status_code

    return _delete_comment
