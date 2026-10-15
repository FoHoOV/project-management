from functools import lru_cache

from config import get_settings
from db.db import DbPrams, get_db_params, init_database


@lru_cache
def _get_db_params() -> DbPrams:
    settings = get_settings()
    return get_db_params(
        settings.SQLALCHEMY_DATABASE_URL, settings.IS_SQLALCHEMY_LOG_ENABLED
    )


def get_engine():
    return _get_db_params()["engine"]


def get_session_factory():
    return _get_db_params()["session"]


def init_db():
    init_database(get_engine())
