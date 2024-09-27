from collections.abc import Callable
from typing import TypedDict

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from db.schemas.user import User

TestUserType = TypedDict("TestUserType", {"id": int, "username": str, "password": str})

_TEST_USERS: list[TestUserType] = [
    {"id": -1, "username": "test_username1", "password": "test_password1"},
    {"id": -1, "username": "test_username2", "password": "test_password2"},
    {"id": -1, "username": "test_username3", "password": "test_password3"},
]


@pytest.fixture(scope="session", autouse=True)
def test_users(test_client: TestClient, test_app: FastAPI):
    """Create test users in the database, ensuring each user is created only once."""
    for user in _TEST_USERS:
        response = test_client.post(
            "/users/signup",
            json={
                "username": user["username"],
                "password": user["password"],
                "confirm_password": user["password"],
            },
        )

        assert response.status_code == 200

        parsed_user = User.model_validate(response.json(), strict=True)
        user["id"] = parsed_user.id

    return _TEST_USERS


@pytest.fixture(scope="function")
def access_token_factory(test_client: TestClient):

    def _get_access_token(
        user: TestUserType,
    ) -> str:
        response = test_client.post(
            "/oauth/token",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data={
                "username": user["username"],
                "password": user["password"],
            },
        )

        assert (
            response.status_code == 200
        ), "already registered test user should successfully get an access token exist"

        return response.json()["access_token"]

    return _get_access_token


@pytest.fixture(scope="function")
def auth_header_factory(
    access_token_factory: Callable[[TestUserType], str],
):
    def _get_auth_header(user: TestUserType):
        """Fixture to generate authorization header for a test user."""
        return {"Authorization": f"Bearer {access_token_factory(user)}"}

    return _get_auth_header
