from secrets import choice
from fastapi.testclient import TestClient

from api.test import TEST_USER, app


client = TestClient(app)


def test_login():
    username_lower_case = TEST_USER["username"].lower()
    username_upper_case = TEST_USER["username"].upper()

    for username in [username_lower_case, username_upper_case]:
        response = client.post(
            "/oauth/token",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data={
                "username": username,
                "password": TEST_USER["password"],
            },
        )

        assert (
            response.status_code == 200
        ), "login should work and it should be case-insensitive"

        assert (
            "access_token" in response.json()
        ), "after a successful login (case-insensitive) we should get an access_token"
