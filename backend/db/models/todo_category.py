from typing import List, Optional
from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import BasesWithCreatedDate


class TodoCategory(BasesWithCreatedDate):
    __tablename__ = "todo_category"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String())
    description: Mapped[str] = mapped_column(String())
    items: Mapped[List["TodoItem"]] = relationship(
        back_populates="category",
        cascade="all, delete-orphan",
        order_by="desc(TodoItem.id)",
    )
    projects: Mapped[List["Project"]] = relationship(
        secondary="todo_category_project_association", back_populates="todo_categories"
    )

    def __repr__(self) -> str:
        return f"TodoCategory(id={self.id!r}, title={self.title!r}, description={self.description!r})"
