from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.models.base import BaseOrderedItem, BasesWithCreatedDate

if TYPE_CHECKING:
    from db.models.todo_item import TodoItem


class TodoItemOrder(BasesWithCreatedDate, BaseOrderedItem):
    __tablename__ = "todo_item_order"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    todo_id: Mapped[int] = mapped_column(
        ForeignKey("todo_item.id", ondelete="CASCADE"), unique=True
    )
    left_id: Mapped[int | None] = mapped_column(
        ForeignKey("todo_item.id", ondelete="CASCADE"), nullable=True, unique=True
    )
    right_id: Mapped[int | None] = mapped_column(
        ForeignKey("todo_item.id", ondelete="CASCADE"), nullable=True, unique=True
    )
    todo: Mapped["TodoItem"] = relationship(
        foreign_keys=[todo_id], single_parent=True, back_populates="order"
    )

    __table_args__ = (
        CheckConstraint("todo_id != left_id"),
        CheckConstraint("todo_id != right_id"),
        CheckConstraint("left_id != null and left_id != right_id"),
    )
