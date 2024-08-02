import enum
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.models.base import BasesWithCreatedDate

if TYPE_CHECKING:
    from db.models.todo_category import TodoCategory


class Action(enum.StrEnum):
    AUTO_MARK_AS_DONE = enum.auto()
    AUTO_MARK_AS_UNDONE = enum.auto()


class TodoCategoryAction(BasesWithCreatedDate):
    __tablename__ = "todo_category_action"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    category_id: Mapped[int] = mapped_column(
        ForeignKey("todo_category.id", ondelete="CASCADE")
    )
    action: Mapped[Action] = mapped_column(Enum(Action, validate_strings=True))
    category: Mapped["TodoCategory"] = relationship(
        back_populates="actions",
        single_parent=True,
    )

    __table_args__ = (UniqueConstraint("category_id", "action"),)
