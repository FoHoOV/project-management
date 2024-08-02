from typing import TYPE_CHECKING, List

from sqlalchemy import CheckConstraint, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.models.base import BasesWithCreatedDate

if TYPE_CHECKING:
    from db.models.project import Project
    from db.models.todo_item import TodoItem


class Tag(BasesWithCreatedDate):
    __tablename__ = "tag"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50))
    project_id: Mapped[int] = mapped_column(
        ForeignKey("project.id", ondelete="CASCADE")
    )
    project: Mapped[List["Project"]] = relationship(
        back_populates="tags", single_parent=True
    )
    todos: Mapped[List["TodoItem"]] = relationship(
        secondary="todo_item_tag_association",
        back_populates="tags",
        order_by="desc(TodoItem.id)",
    )

    __table_args__ = (UniqueConstraint("project_id", "name"),)
