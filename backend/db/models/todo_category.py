from typing import List
from sqlalchemy import String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import BaseCustomOrder, BasesWithCreatedDate


class TodoCategory(BasesWithCreatedDate, BaseCustomOrder):
    __tablename__ = "todo_category"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String())
    description: Mapped[str] = mapped_column(String())
    items: Mapped[List["TodoItem"]] = relationship(  # type: ignore
        back_populates="category",
        cascade="all, delete-orphan",
        order_by="desc(TodoItem.id)",
    )
    projects: Mapped[List["Project"]] = relationship(  # type: ignore
        secondary="todo_category_project_association", back_populates="todo_categories"
    )

    def __repr__(self) -> str:
        return f"TodoCategory(id={self.id!r}, order={self.order}, title={self.title!r}, description={self.description!r})"
