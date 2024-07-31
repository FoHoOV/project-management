from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest


@pytest.fixture(scope="session")
def test_client(test_app: FastAPI):
    """Create a TestClient using the test FastAPI application."""
    with TestClient(test_app) as client:
        yield client
