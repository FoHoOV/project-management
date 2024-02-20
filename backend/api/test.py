from typing import TypedDict

from fastapi.testclient import TestClient
from api import create_app
from api.dependencies.db import get_db
from api.dependencies.db_test import get_test_db
from db.test import SessionLocalTest, init_db
from sqlalchemy.orm import Session

from db.utils.user_crud import create_user


TestUserType = TypedDict("TestUserType", {"username": str, "password": str})
TEST_USERS: list[TestUserType] = [
    {"username": "test_username1", "password": "test_password1"},
    {"username": "test_username2", "password": "test_password2"},
    {"username": "test_username3", "password": "test_password3"},
]


def create_test_app():
    app = create_app()
    init_db()
    app.dependency_overrides[get_db] = get_test_db

    create_test_user()

    return app


def create_test_user():
    from db.schemas.user import UserCreate

    db: Session = SessionLocalTest()
    for user in TEST_USERS:
        create_user(
            db,
            UserCreate.model_validate(
                {
                    "username": user["username"],
                    "password": user["password"],
                    "confirm_password": user["password"],
                }
            ),
        )


def get_access_token(user: TestUserType):
    response = TestClient(app).post(
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


app = create_test_app()
