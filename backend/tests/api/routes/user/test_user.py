import pytest
from fastapi.testclient import TestClient

from tests.api.conftest import UserType


def test_new_user_signup(test_client: TestClient):
    response = test_client.post(
        "/users/signup",
        json={
            "username": "test1ASVascascasc",
            "password": "password1",
            "confirm_password": "password1",
        },
    )
    assert response.status_code == 200
    assert "username" in response.json()


def test_existing_user_signup(
    test_users: list[UserType],
    test_client: TestClient,
):
    response = test_client.post(
        "/users/signup",
        json={
            "username": test_users[0]["username"],
            "password": test_users[0]["password"],
            "confirm_password": test_users[0]["password"],
        },
    )
    assert response.status_code == 400


@pytest.mark.parametrize(
    "password",
    ["a" * 73, "é" * 37],
    ids=["73-ascii-bytes", "74-multibyte-bytes"],
)
def test_signup_rejects_password_longer_than_72_bytes(
    test_client: TestClient, password: str
):
    response = test_client.post(
        "/users/signup",
        json={
            "username": "too_long_password_user",
            "password": password,
            "confirm_password": password,
        },
    )
    assert response.status_code == 422


def test_signup_accepts_72_byte_password(test_client: TestClient):
    password = "a" * 72
    response = test_client.post(
        "/users/signup",
        json={
            "username": "max_length_password_user",
            "password": password,
            "confirm_password": password,
        },
    )
    assert response.status_code == 200
