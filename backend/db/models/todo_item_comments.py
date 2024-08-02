from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.models.base import BasesWithCreatedDate

if TYPE_CHECKING:
    from db.models.todo_item import TodoItem


class TodoItemComment(BasesWithCreatedDate):
    __tablename__ = "todo_item_comment"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    todo_id: Mapped[int] = mapped_column(ForeignKey("todo_item.id", ondelete="CASCADE"))
    message: Mapped[str] = mapped_column(Text(), nullable=False)
    todo: Mapped["TodoItem"] = relationship(
        foreign_keys=[todo_id], single_parent=True, back_populates="comments"
    )
