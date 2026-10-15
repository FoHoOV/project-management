from alembic import command

from db.migrations import get_alembic_config, run_migrations


def test_migrations_match_models():
    run_migrations()
    command.check(get_alembic_config())
