from typing import TypedDict

from fastapi.testclient import TestClient
from api import create_app
from api.dependencies.db import get_db
from api.dependencies.db_test import get_test_db
from db.test import SessionLocalTest, init_db
from sqlalchemy.orm import Session

from db.utils.user_crud import create_user

TEST_USER = {"username": "test_username", "password": "test_password"}


def create_test_app():
    app = create_app()
    init_db()
    app.dependency_overrides[get_db] = get_test_db

    create_test_user()

    return app


def create_test_user():
    from db.schemas.user import UserCreate

    db: Session = SessionLocalTest()
    create_user(
        db,
        UserCreate.model_validate(
            {
                "username": TEST_USER["username"],
                "password": TEST_USER["password"],
                "confirm_password": TEST_USER["password"],
            }
        ),
    )


def get_access_token():
    access_token = (
        TestClient(app)
        .post(
            "/oauth/token",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data={"username": TEST_USER["username"], "password": TEST_USER["password"]},
        )
        .json()["access_token"]
    )
    return access_token


app = create_test_app()
