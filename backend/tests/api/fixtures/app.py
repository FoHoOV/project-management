import pytest
from sqlalchemy import MetaData

from api import create_app
from db import get_engine


@pytest.fixture(scope="session")
def test_app():
    existing_schema = MetaData()
    existing_schema.reflect(bind=get_engine())
    existing_schema.drop_all(bind=get_engine())
    return create_app()
