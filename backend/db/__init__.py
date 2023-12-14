import logging
from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import sessionmaker

from config import settings

is_sqlite = settings.SQLALCHEMY_DATABASE_URL.startswith("sqlite:///")

engine_kwargs = {
    "url": settings.SQLALCHEMY_DATABASE_URL,
    "echo": settings.IS_SQLALCHEMY_LOG_ENABLED,
}

if is_sqlite:
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(**engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

if settings.IS_SQLALCHEMY_LOG_ENABLED:
    logging.getLogger("sqlalchemy.engine").setLevel(logging.DEBUG)

if is_sqlite:
    # https://docs.sqlalchemy.org/en/20/dialects/sqlite.html#foreign-key-support

    @event.listens_for(Engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


def init_db():
    from .models.base import Base

    Base.metadata.create_all(bind=engine)
