import enum
from sqlalchemy import (
    Enum,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import BasesWithCreatedDate


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
    category: Mapped["TodoCategory"] = relationship(  # type: ignore
        "TodoCategory",
        back_populates="actions",
        single_parent=True,
    )

    __table_args__ = (UniqueConstraint("category_id", "action"),)
