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
