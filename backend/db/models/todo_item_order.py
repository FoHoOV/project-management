from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import BasesWithCreatedDate


class TodoItemOrder(BasesWithCreatedDate):
    __tablename__ = "todo_item_order"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    todo_id: Mapped[int] = mapped_column(ForeignKey("todo_item.id"))
    next_id: Mapped[int | None] = mapped_column(
        ForeignKey("todo_item.id"), nullable=True
    )
    todo: Mapped["TodoItem"] = relationship(foreign_keys=[todo_id], single_parent=True, cascade="all, delete-orphan", back_populates="order")  # type: ignore
