import importlib
import pkgutil
from logging.config import fileConfig

from alembic import context
from sqlalchemy import Connection

import db.models
from config import get_settings
from db import get_engine
from db.models.base import Base

config = context.config


def _import_all_models():
    for module in pkgutil.iter_modules(db.models.__path__):
        importlib.import_module(f"{db.models.__name__}.{module.name}")


def _run_migrations(connection: Connection):
    context.configure(
        connection=connection,
        target_metadata=Base.metadata,
        render_as_batch=connection.dialect.name == "sqlite",
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_offline():
    context.configure(
        url=get_settings().SQLALCHEMY_DATABASE_URL,
        target_metadata=Base.metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    # The app passes its own connection (see db/migrations.py) so the upgrade
    # runs inside the transaction that holds the migration lock.
    shared_connection = config.attributes.get("connection")
    if shared_connection is not None:
        _run_migrations(shared_connection)
        return

    if config.config_file_name is not None:
        fileConfig(config.config_file_name)
    with get_engine().connect() as connection:
        _run_migrations(connection)


_import_all_models()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
