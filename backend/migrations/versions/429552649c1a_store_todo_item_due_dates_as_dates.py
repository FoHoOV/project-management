"""store todo item due dates as dates

Revision ID: 429552649c1a
Revises: 96a8ab072cce
Create Date: 2026-10-15 20:29:21.134692

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '429552649c1a'
down_revision: Union[str, Sequence[str], None] = '96a8ab072cce'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _convert_due_date(new_type: sa.types.TypeEngine, expression: dict[str, str]) -> None:
    # Not alter_column: SQLite's batch copy would CAST the values, and CAST(... AS DATE) has
    # numeric affinity in SQLite, turning '2026-10-20 00:00:00' into 2026.
    dialect = op.get_bind().dialect.name
    op.add_column("todo_item", sa.Column("due_date_converted", new_type, nullable=True))
    op.execute(f"UPDATE todo_item SET due_date_converted = {expression[dialect]}")
    with op.batch_alter_table("todo_item") as batch_op:
        batch_op.drop_column("due_date")
        batch_op.alter_column("due_date_converted", new_column_name="due_date")


def upgrade() -> None:
    """Upgrade schema."""
    _convert_due_date(
        sa.Date(), {"sqlite": "date(due_date)", "postgresql": "due_date::date"}
    )


def downgrade() -> None:
    """Downgrade schema."""
    _convert_due_date(
        sa.DateTime(),
        {"sqlite": "datetime(due_date)", "postgresql": "due_date::timestamp"},
    )
