from datetime import UTC, datetime, timedelta
from secrets import choice

import pytest
from fastapi.testclient import TestClient
from joserfc import jwt

from config import get_settings
from db.utils.oatuh import create_access_token, get_signing_key

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


def _get_projects_with_token(test_client: TestClient, token: str):
    return test_client.get("/projects/", headers={"Authorization": f"Bearer {token}"})


def test_valid_token_is_accepted(test_client: TestClient, test_users: list[UserType]):
    token = create_access_token({"sub": test_users[0]["username"]})

    assert _get_projects_with_token(test_client, token).status_code == 200


def test_expired_token_is_rejected(
    test_client: TestClient, test_users: list[UserType]
):
    token = create_access_token(
        {"sub": test_users[0]["username"]}, expires_delta=timedelta(minutes=-1)
    )

    assert _get_projects_with_token(test_client, token).status_code == 401


@pytest.mark.parametrize("missing_claim", ["exp", "sub"])
def test_token_without_required_claim_is_rejected(
    test_client: TestClient, test_users: list[UserType], missing_claim: str
):
    claims = {
        "sub": test_users[0]["username"],
        "exp": int((datetime.now(UTC) + timedelta(minutes=5)).timestamp()),
    }
    del claims[missing_claim]
    token = jwt.encode({"alg": get_settings().ALGORITHM}, claims, get_signing_key())

    assert _get_projects_with_token(test_client, token).status_code == 401
