from typing import List, TypedDict


from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest
from api import create_app
from api.dependencies.db import get_db

from db.schemas.user import User
from tests.db.test import init_db, SessionLocalTest


TestUserType = TypedDict("TestUserType", {"id": int, "username": str, "password": str})

_TEST_USERS: List[TestUserType] = [
    {"id": -1, "username": "test_username1", "password": "test_password1"},
    {"id": -1, "username": "test_username2", "password": "test_password2"},
    {"id": -1, "username": "test_username3", "password": "test_password3"},
]


@pytest.fixture(scope="session")
def test_client(test_app: FastAPI):
    """Create a TestClient using the test FastAPI application."""
    with TestClient(test_app) as client:
        yield client


@pytest.fixture(scope="session")
def test_app():
    """Create and return a test FastAPI application."""
    init_db()  # Ensure the database is initialized
    app = create_app()

    def get_test_db():
        db = SessionLocalTest()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = get_test_db
    return app


@pytest.fixture(scope="session", autouse=True)
def test_users(test_client: TestClient, test_app: FastAPI):
    """Create test users in the database, ensuring each user is created only once."""
    for user in _TEST_USERS:
        response = test_client.post(
            "/user/signup",
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
