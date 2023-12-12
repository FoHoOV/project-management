from typing import List
from sqlalchemy import CheckConstraint, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import BasesWithCreatedDate


class Tag(BasesWithCreatedDate):
    __tablename__ = "tag"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50))
    project_id: Mapped[int] = mapped_column(
        ForeignKey("project.id", ondelete="CASCADE")
    )
    project: Mapped[List["Project"]] = relationship(  # type: ignore
        "Project", back_populates="tags", single_parent=True
    )
    todos: Mapped[List["TodoItem"]] = relationship(  # type: ignore
        "TodoItem",
        secondary="todo_item_tag_association",
        back_populates="tags",
        order_by="desc(TodoItem.id)",
    )
    __table_args__ = (UniqueConstraint("project_id", "name"),)
