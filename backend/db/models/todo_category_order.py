from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Connection, ForeignKey, UniqueConstraint, event
from sqlalchemy.orm import Mapped, Mapper, Session, mapped_column, relationship

from db.models.base import BaseOrderedItem, BasesWithCreatedDate

if TYPE_CHECKING:
    from db.models.todo_category import TodoCategory


class TodoCategoryOrder(BasesWithCreatedDate, BaseOrderedItem):
    __tablename__ = "todo_category_order"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("project.id", ondelete="CASCADE")
    )
    category_id: Mapped[int] = mapped_column(
        ForeignKey("todo_category.id", ondelete="CASCADE")
    )
    left_id: Mapped[int | None] = mapped_column(
        ForeignKey("todo_category.id", ondelete="CASCADE"), nullable=True
    )
    right_id: Mapped[int | None] = mapped_column(
        ForeignKey("todo_category.id", ondelete="CASCADE"), nullable=True
    )
    category: Mapped["TodoCategory"] = relationship(
        foreign_keys=[category_id], single_parent=True, back_populates="orders"
    )

    __table_args__ = (
        UniqueConstraint("project_id", "category_id"),
        UniqueConstraint("project_id", "left_id"),
        UniqueConstraint("project_id", "right_id"),
        CheckConstraint("category_id != left_id"),
        CheckConstraint("category_id != right_id"),
        CheckConstraint("left_id != null and left_id != right_id"),
    )
