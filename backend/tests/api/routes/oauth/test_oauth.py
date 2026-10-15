from secrets import choice

import pytest
from fastapi.testclient import TestClient

from tests.api.conftest import UserType


@pytest.mark.parametrize("username_case", ["lower", "upper"])
@pytest.mark.parametrize("iteration", range(3))
def test_login(
    test_client: TestClient,
    test_users: list[UserType],
    username_case: str,
    iteration: int,  # Added iteration, it's just for repeating the test.
):
    user = test_users[0]  # Using the first user for simplicity; adjust as needed.
    username = (
        user["username"].lower()
        if username_case == "lower"
        else user["username"].upper()
    )

    response = test_client.post(
        "/oauth/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "username": username,
            "password": user["password"],
        },
    )

    assert (
        response.status_code == 200
    ), "login should work and it should be case-insensitive"
    assert (
        "access_token" in response.json()
    ), "after a successful login (case-insensitive) we should get an access_token"


def test_login_with_password_longer_than_72_bytes_is_unauthorized(
    test_client: TestClient, test_users: list[UserType]
):
    response = test_client.post(
        "/oauth/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={"username": test_users[0]["username"], "password": "a" * 73},
    )

    assert response.status_code == 401
