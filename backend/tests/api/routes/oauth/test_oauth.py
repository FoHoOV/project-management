from secrets import choice
from fastapi.testclient import TestClient
import pytest

from tests.api.conftest import TestUserType


@pytest.mark.parametrize("username_case", ["lower", "upper"])
@pytest.mark.parametrize("iteration", range(3))
def test_login(
    test_client: TestClient,
    test_users: list[TestUserType],
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
