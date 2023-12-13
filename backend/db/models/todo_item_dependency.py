from typing import List
from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import BasesWithCreatedDate


class TodoItemDependency(BasesWithCreatedDate):
    __tablename__ = "todo_item_dependency"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    todo_id: Mapped[int] = mapped_column(ForeignKey("todo_item.id", ondelete="CASCADE"))
    dependant_todo_id: Mapped[int] = mapped_column(
        ForeignKey("todo_item.id", ondelete="CASCADE")
    )

    todo: Mapped["TodoItem"] = relationship(  # type: ignore
        "TodoItem",
        back_populates="dependencies",
        foreign_keys=[todo_id],
        single_parent=True,
    )

    dependant_todo: Mapped["TodoItem"] = relationship(  # type: ignore
        "TodoItem", foreign_keys=[dependant_todo_id], single_parent=True
    )

    __table_args__ = (UniqueConstraint("todo_id", "dependant_todo_id"),)
