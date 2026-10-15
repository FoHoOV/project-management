import pytest

from api import create_app
from db import get_engine
from db.models.base import Base


@pytest.fixture(scope="session")
def test_app():
    Base.metadata.drop_all(bind=get_engine())
    return create_app()
