from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, String, func, null, select
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import BasesWithCreatedDate
from db.models.todo_item_comments import TodoItemComment
from db.models.todo_item_dependency import TodoItemDependency
from db.models.todo_item_order import TodoItemOrder
from sqlalchemy.ext.hybrid import hybrid_property
from typing import List, Optional


class TodoItem(BasesWithCreatedDate):
    __tablename__ = "todo_item"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String())
    description: Mapped[str] = mapped_column(String())
    is_done: Mapped[bool] = mapped_column(Boolean(), default=False)
    category_id: Mapped[int] = mapped_column(
        ForeignKey("todo_category.id", ondelete="CASCADE")
    )
    due_date: Mapped[datetime | None] = mapped_column(DateTime(), nullable=True)
    category: Mapped["TodoCategory"] = relationship(  # type: ignore
        "TodoCategory",
        back_populates="items",
        single_parent=True,
        cascade="all, delete-orphan",
    )
    marked_as_done_by_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("user.id"), nullable=True
    )
    comments: Mapped[List[TodoItemComment]] = relationship(
        "TodoItemComment",
        foreign_keys=[TodoItemComment.todo_id],
        back_populates="todo",
        cascade="all, delete-orphan",
    )
    tags: Mapped[List["Tag"]] = relationship(  # type: ignore
        secondary="todo_item_tag_association", back_populates="todos"
    )
    dependencies: Mapped[List["TodoItemDependency"]] = relationship(  # type: ignore
        foreign_keys=[TodoItemDependency.todo_id],
        back_populates="todo",
        cascade="all, delete-orphan",
    )
    order: Mapped[TodoItemOrder | None] = relationship(
        "TodoItemOrder",
        foreign_keys=[TodoItemOrder.todo_id],
        uselist=False,
        back_populates="todo",
        cascade="all, delete-orphan",
    )

    marked_as_done_by: Mapped[Optional["User"]] = relationship(  # type: ignore
        "User",
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
