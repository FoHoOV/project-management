from secrets import choice
from fastapi.testclient import TestClient

from api.test import TEST_USER, app


client = TestClient(app)


def test_login():
    for _ in range(10):
        response = client.post(
            "/oauth/token",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data={
                "username": "".join(
                    choice((str.upper, str.lower))(c) for c in TEST_USER["username"]
                ),
                "password": TEST_USER["password"],
            },
        )

        assert response.status_code == 200
        assert (
            "access_token" in response.json()
        ), "after a successful login we should get an access_token"
