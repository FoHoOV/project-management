from fastapi.testclient import TestClient
from api.test import TEST_USER, app


client = TestClient(app)


def test_login():
    response = client.post(
        "/oauth/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={"username": TEST_USER["username"], "password": TEST_USER["password"]},
    )

    assert response.status_code == 200
    assert "access_token" in response.json()
