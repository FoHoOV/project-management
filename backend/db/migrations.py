from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import text

from db import get_engine

_ALEMBIC_INI_PATH = Path(__file__).resolve().parent.parent / "alembic.ini"
_MIGRATION_LOCK_ID = 7_294_015_331


def get_alembic_config() -> Config:
    return Config(_ALEMBIC_INI_PATH)


def run_migrations():
    with get_engine().begin() as connection:
        if connection.dialect.name == "postgresql":
            # Serverless instances can cold-start concurrently; only one may migrate.
            connection.execute(
                text("SELECT pg_advisory_xact_lock(:lock_id)"),
                {"lock_id": _MIGRATION_LOCK_ID},
            )
        alembic_config = get_alembic_config()
        alembic_config.attributes["connection"] = connection
        command.upgrade(alembic_config, "head")
