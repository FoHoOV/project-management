import pytest
from api import create_app
from api.dependencies.db import get_db

from tests.db.test import init_db, SessionLocalTest


@pytest.fixture(scope="session")
def test_app():
    """Create and return a test FastAPI application."""
    init_db()  # Ensure the database is initialized
    app = create_app()

    def get_test_db():
        db = SessionLocalTest()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = get_test_db
    return app
