from fastapi.testclient import TestClient

from api.conftest import TestUserType


def test_new_user_signup(test_client: TestClient):
    response = test_client.post(
        "/user/signup",
        json={
            "username": "test1ASVascascasc",
            "password": "password1",
            "confirm_password": "password1",
        },
    )
    assert response.status_code == 200
    assert "username" in response.json()


def test_existing_user_signup(test_client: TestClient, test_users: list[TestUserType]):
    response = test_client.post(
        "/user/signup",
        json={
            "username": test_users[0]["username"],
            "password": test_users[0]["password"],
            "confirm_password": test_users[0]["password"],
        },
    )
    assert response.status_code == 400
