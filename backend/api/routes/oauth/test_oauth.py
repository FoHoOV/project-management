from secrets import choice
from fastapi.testclient import TestClient

from api.conftest import _TEST_USERS, app


client = TestClient(app)


def test_login():
    username_lower_case = _TEST_USERS[0]["username"].lower()
    username_upper_case = _TEST_USERS[0]["username"].upper()

    for username in [username_lower_case, username_upper_case]:
        response = client.post(
            "/oauth/token",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data={
                "username": username,
                "password": _TEST_USERS[0]["password"],
            },
        )

        assert (
            response.status_code == 200
        ), "login should work and it should be case-insensitive"

        assert (
            "access_token" in response.json()
        ), "after a successful login (case-insensitive) we should get an access_token"
