from typing import List
from sqlalchemy import String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import BasesWithCreatedDate
from db.models.todo_category_order import TodoCategoryOrder


class TodoCategory(BasesWithCreatedDate):
    __tablename__ = "todo_category"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String())
    description: Mapped[str] = mapped_column(String())
    items: Mapped[List["TodoItem"]] = relationship(  # type: ignore
        "TodoItem",
        back_populates="category",
        cascade="all, delete-orphan",
        order_by="desc(TodoItem.id), desc(TodoItem.is_done)",
    )
    projects: Mapped[List["Project"]] = relationship(  # type: ignore
        "Project",
        secondary="todo_category_project_association",
        back_populates="todo_categories",
        order_by="desc(Project.id)",
    )
    orders: Mapped[List[TodoCategoryOrder]] = relationship(  # type: ignore
        "TodoCategoryOrder",
        foreign_keys=[TodoCategoryOrder.category_id],
        cascade="all, delete-orphan",
        back_populates="category",
    )
