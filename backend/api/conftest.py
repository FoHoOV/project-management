from typing import List, TypedDict

from fastapi.testclient import TestClient
import pytest
from api import create_app
from api.dependencies.db import get_db
from api.dependencies.db_test import get_test_db
from db.schemas.user import UserCreate
from db.test import init_db

from db.utils.user_crud import create_user


TestUserType = TypedDict("TestUserType", {"username": str, "password": str})

_TEST_USERS: List[TestUserType] = [
    {"username": "test_username1", "password": "test_password1"},
    {"username": "test_username2", "password": "test_password2"},
    {"username": "test_username3", "password": "test_password3"},
]


@pytest.fixture(scope="session")
def test_app():
    """Create and return a test FastAPI application."""
    app = create_app()
    app.dependency_overrides[get_db] = get_test_db
    return app


@pytest.fixture(scope="session")
def test_client(test_app):
    """Create a TestClient using the test FastAPI application."""
    with TestClient(test_app) as client:
        yield client


@pytest.fixture(scope="session")
def test_db():
    """Fixture to provide a database session for testing."""
    init_db()  # Ensure the database is initialized
    db = next(
        get_test_db()
    )  # Manually get the first (and only) yield which is the session object
    try:
        yield db
    finally:
        db.close()  # Ensure the session is closed after the test(s)


@pytest.fixture(scope="session", autouse=True)
def test_users(test_db):
    """Create test users in the database, ensuring each user is created only once."""
    for user in _TEST_USERS:
        create_user(
            test_db,
            UserCreate.model_validate(
                {
                    "username": user["username"],
                    "password": user["password"],
                    "confirm_password": user["password"],
                }
            ),
        )
    return _TEST_USERS


@pytest.fixture(scope="function")
def access_token_factory(test_app):

    def _get_access_token(
        user: TestUserType,
    ) -> str:
        response = TestClient(test_app).post(
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
