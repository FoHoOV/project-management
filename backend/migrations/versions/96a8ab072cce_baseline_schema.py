"""baseline schema

Revision ID: 96a8ab072cce
Revises: 
Create Date: 2026-10-15 16:26:31.316610

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '96a8ab072cce'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('project',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('description', sa.String(), nullable=False),
    sa.Column('created_date', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sqlite_autoincrement=True
    )
    op.create_table('todo_category',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('description', sa.String(), nullable=False),
    sa.Column('created_date', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sqlite_autoincrement=True
    )
    op.create_table('user',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('username', sa.String(length=30), nullable=False),
    sa.Column('password', sa.String(), nullable=False),
    sa.Column('created_date', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('username'),
    sqlite_autoincrement=True
    )
    op.create_table('project_user_association',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('project_id', sa.Integer(), nullable=False),
    sa.Column('created_date', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['project_id'], ['project.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id', 'project_id')
    )
    op.create_table('tag',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('name', sa.String(length=50), nullable=False),
    sa.Column('project_id', sa.Integer(), nullable=False),
    sa.Column('created_date', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['project_id'], ['project.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('project_id', 'name')
    )
    op.create_table('todo_category_action',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('category_id', sa.Integer(), nullable=False),
    sa.Column('action', sa.Enum('AUTO_MARK_AS_DONE', 'AUTO_MARK_AS_UNDONE', name='action'), nullable=False),
    sa.Column('created_date', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['category_id'], ['todo_category.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('category_id', 'action')
    )
    op.create_table('todo_category_order',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('project_id', sa.Integer(), nullable=False),
    sa.Column('category_id', sa.Integer(), nullable=False),
    sa.Column('left_id', sa.Integer(), nullable=True),
    sa.Column('right_id', sa.Integer(), nullable=True),
    sa.Column('created_date', sa.DateTime(), nullable=False),
    sa.CheckConstraint('category_id != left_id'),
    sa.CheckConstraint('category_id != right_id'),
    sa.CheckConstraint('left_id != null and left_id != right_id'),
    sa.ForeignKeyConstraint(['category_id'], ['todo_category.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['left_id'], ['todo_category.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['project_id'], ['project.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['right_id'], ['todo_category.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('project_id', 'category_id'),
    sa.UniqueConstraint('project_id', 'left_id'),
    sa.UniqueConstraint('project_id', 'right_id')
    )
    op.create_table('todo_category_project_association',
    sa.Column('category_id', sa.Integer(), nullable=False),
    sa.Column('project_id', sa.Integer(), nullable=False),
    sa.Column('created_date', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['category_id'], ['todo_category.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['project_id'], ['project.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('category_id', 'project_id'),
    sa.UniqueConstraint('project_id', 'category_id')
    )
    op.create_table('todo_item',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('description', sa.String(), nullable=False),
    sa.Column('category_id', sa.Integer(), nullable=False),
    sa.Column('due_date', sa.DateTime(), nullable=True),
    sa.Column('marked_as_done_by_user_id', sa.Integer(), nullable=True),
    sa.Column('created_date', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['category_id'], ['todo_category.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['marked_as_done_by_user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sqlite_autoincrement=True
    )
    op.create_table('todo_item_comment',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('todo_id', sa.Integer(), nullable=False),
    sa.Column('message', sa.Text(), nullable=False),
    sa.Column('created_date', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['todo_id'], ['todo_item.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sqlite_autoincrement=True
    )
    op.create_table('todo_item_dependency',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('todo_id', sa.Integer(), nullable=False),
    sa.Column('dependant_todo_id', sa.Integer(), nullable=False),
    sa.Column('created_date', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['dependant_todo_id'], ['todo_item.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['todo_id'], ['todo_item.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('todo_id', 'dependant_todo_id')
    )
    op.create_table('todo_item_order',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('todo_id', sa.Integer(), nullable=False),
    sa.Column('left_id', sa.Integer(), nullable=True),
    sa.Column('right_id', sa.Integer(), nullable=True),
    sa.Column('created_date', sa.DateTime(), nullable=False),
    sa.CheckConstraint('left_id != null and left_id != right_id'),
    sa.CheckConstraint('todo_id != left_id'),
    sa.CheckConstraint('todo_id != right_id'),
    sa.ForeignKeyConstraint(['left_id'], ['todo_item.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['right_id'], ['todo_item.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['todo_id'], ['todo_item.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('left_id'),
    sa.UniqueConstraint('right_id'),
    sa.UniqueConstraint('todo_id')
    )
    op.create_table('todo_item_tag_association',
    sa.Column('todo_id', sa.Integer(), nullable=False),
    sa.Column('tag_id', sa.Integer(), nullable=False),
    sa.Column('created_date', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['tag_id'], ['tag.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['todo_id'], ['todo_item.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('todo_id', 'tag_id')
    )
    op.create_table('user_project_permission',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('project_user_association_id', sa.Integer(), nullable=False),
    sa.Column('permission', sa.Enum('CREATE_TODO_CATEGORY', 'UPDATE_TODO_CATEGORY', 'DELETE_TODO_CATEGORY', 'CREATE_TODO_ITEM', 'UPDATE_TODO_ITEM', 'DELETE_TODO_ITEM', 'CREATE_TODO_ITEM_DEPENDENCY', 'UPDATE_TODO_ITEM_DEPENDENCY', 'DELETE_TODO_ITEM_DEPENDENCY', 'CREATE_COMMENT', 'UPDATE_COMMENT', 'DELETE_COMMENT', 'CREATE_TAG', 'UPDATE_TAG', 'DELETE_TAG', 'UPDATE_PROJECT', 'ALL', name='permission'), nullable=False),
    sa.ForeignKeyConstraint(['project_user_association_id'], ['project_user_association.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('project_user_association_id', 'permission')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('user_project_permission')
    op.drop_table('todo_item_tag_association')
    op.drop_table('todo_item_order')
    op.drop_table('todo_item_dependency')
    op.drop_table('todo_item_comment')
    op.drop_table('todo_item')
    op.drop_table('todo_category_project_association')
    op.drop_table('todo_category_order')
    op.drop_table('todo_category_action')
    op.drop_table('tag')
    op.drop_table('project_user_association')
    op.drop_table('user')
    op.drop_table('todo_category')
    op.drop_table('project')
    sa.Enum(name='permission').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='action').drop(op.get_bind(), checkfirst=True)
