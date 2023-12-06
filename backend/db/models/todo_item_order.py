from sqlalchemy import CheckConstraint, ForeignKey
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import BasesWithCreatedDate


class TodoItemOrder(BasesWithCreatedDate):
    __tablename__ = "todo_item_order"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    todo_id: Mapped[int] = mapped_column(ForeignKey("todo_item.id"), unique=True)
    left_id: Mapped[int | None] = mapped_column(
        ForeignKey("todo_item.id"), nullable=True, unique=True
    )
    right_id: Mapped[int | None] = mapped_column(
        ForeignKey("todo_item.id"), nullable=True, unique=True
    )
    moving_id: Mapped[int] = mapped_column(ForeignKey("todo_item.id"), unique=True)
    todo: Mapped["TodoItem"] = relationship(foreign_keys=[todo_id], single_parent=True, back_populates="order")  # type: ignore

    __table_args__ = (
        CheckConstraint("todo_id != left_id"),
        CheckConstraint("todo_id != right_id"),
        CheckConstraint("left_id != null and left_id != right_id"),
    )
