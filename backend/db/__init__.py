import logging
from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import sessionmaker

from config import settings


engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URL,
    echo=settings.IS_LOG_SQLALCHEMY_ENABLED,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

if settings.IS_LOG_SQLALCHEMY_ENABLED:
    logging.getLogger("sqlalchemy.engine").setLevel(logging.DEBUG)

if settings.SQLALCHEMY_DATABASE_URL.startswith("sqlite:///"):
    # https://docs.sqlalchemy.org/en/20/dialects/sqlite.html#foreign-key-support

    @event.listens_for(Engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


def init_db():
    from .models.base import Base

    Base.metadata.create_all(bind=engine)
