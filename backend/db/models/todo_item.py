from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func, null, select
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped, column_property, mapped_column, relationship

from db.models.base import BasesWithCreatedDate
from db.models.todo_item_comments import TodoItemComment
from db.models.todo_item_dependency import TodoItemDependency
from db.models.todo_item_order import TodoItemOrder

if TYPE_CHECKING:
    from db.models.tag import Tag
    from db.models.todo_category import TodoCategory
    from db.models.user import User


class TodoItem(BasesWithCreatedDate):
    __tablename__ = "todo_item"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String())
    description: Mapped[str] = mapped_column(String())
    category_id: Mapped[int] = mapped_column(
        ForeignKey("todo_category.id", ondelete="CASCADE")
    )
    due_date: Mapped[datetime | None] = mapped_column(DateTime(), nullable=True)
    category: Mapped["TodoCategory"] = relationship(
        back_populates="items",
        single_parent=True,
        cascade="all, delete-orphan",
    )
    marked_as_done_by_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("user.id"), nullable=True
    )
    is_done = column_property(marked_as_done_by_user_id.isnot(None))
    comments: Mapped[List[TodoItemComment]] = relationship(
        foreign_keys=[TodoItemComment.todo_id],
        back_populates="todo",
        cascade="all, delete-orphan",
    )
    tags: Mapped[List["Tag"]] = relationship(
        secondary="todo_item_tag_association", back_populates="todos"
    )
    dependencies: Mapped[List["TodoItemDependency"]] = relationship(
        foreign_keys=[TodoItemDependency.todo_id],
        back_populates="todo",
        cascade="all, delete-orphan",
    )
    order: Mapped[TodoItemOrder | None] = relationship(
        foreign_keys=[TodoItemOrder.todo_id],
        uselist=False,
        back_populates="todo",
        cascade="all, delete-orphan",
    )

    marked_as_done_by: Mapped[Optional["User"]] = relationship(
        uselist=False,
        back_populates="done_todos",
    )

    @hybrid_property
    def comments_count(self):  # type: ignore
        return len(self.comments)

    @comments_count.expression
    def comments_count(cls):
        return func.count(
            select(TodoItem)
            .join(TodoItem.comments)
            .where(TodoItemComment.todo_id == cls.id)
        ).label("done_todos")
