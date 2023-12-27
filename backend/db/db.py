import logging
from typing import Any, TypedDict
from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import sessionmaker, Session

DbPrams = TypedDict("Result", {"session": sessionmaker[Session], "engine": Engine})


def get_db_params(connection_string: str, enable_logging: bool) -> DbPrams:
    is_sqlite = connection_string.startswith("sqlite:///")

    engine_kwargs = {
        "url": connection_string,
        "echo": enable_logging,
    }

    if is_sqlite:
        engine_kwargs["connect_args"] = {"check_same_thread": False}

    engine = create_engine(**engine_kwargs)
    session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    if enable_logging:
        logging.getLogger("sqlalchemy.engine").setLevel(logging.DEBUG)

    if is_sqlite:
        # https://docs.sqlalchemy.org/en/20/dialects/sqlite.html#foreign-key-support

        @event.listens_for(Engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

    return {"session": session, "engine": engine}


def init_database(engine: Engine):
    from db.models.base import Base

    Base.metadata.create_all(bind=engine)
