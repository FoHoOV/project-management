from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import BasesWithCreatedDate
from db.models.todo_item_order import TodoItemOrder


class TodoItem(BasesWithCreatedDate):
    __tablename__ = "todo_item"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String())
    description: Mapped[str] = mapped_column(String())
    is_done: Mapped[bool] = mapped_column(Boolean(), default=False)
    category_id: Mapped[int] = mapped_column(ForeignKey("todo_category.id"))
    category: Mapped["TodoCategory"] = relationship(back_populates="items")  # type: ignore
    order: Mapped[TodoItemOrder] = relationship(foreign_keys=[TodoItemOrder.todo_id], uselist=False, back_populates="todo")  # type: ignore
