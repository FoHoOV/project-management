from fastapi.testclient import TestClient
from api.test import TEST_USERS, app

client = TestClient(app, base_url="http://testserver/user")


def test_new_user_signup():
    response = client.post(
        "signup",
        json={
            "username": "test1ASVascascasc",
            "password": "password1",
            "confirm_password": "password1",
        },
    )
    assert response.status_code == 200
    assert "username" in response.json()


def test_existing_user_signup():
    response = client.post(
        "signup",
        json={
            "username": TEST_USERS[0]["username"],
            "password": TEST_USERS[0]["password"],
            "confirm_password": TEST_USERS[0]["password"],
        },
    )
    assert response.status_code == 400
