from typing import TYPE_CHECKING, List
from sqlalchemy import String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import BasesWithCreatedDate
from db.models.todo_category_order import TodoCategoryOrder

if TYPE_CHECKING:
    from db.models.todo_item import TodoItem
    from db.models.project import Project
    from db.models.todo_category_action import TodoCategoryAction


class TodoCategory(BasesWithCreatedDate):
    __tablename__ = "todo_category"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String())
    description: Mapped[str] = mapped_column(String())
    items: Mapped[List["TodoItem"]] = relationship(
        back_populates="category",
        cascade="all, delete-orphan",
        order_by="desc(TodoItem.id), desc(TodoItem.is_done)",
    )
    actions: Mapped[List["TodoCategoryAction"]] = relationship(
        back_populates="category",
        cascade="all, delete-orphan",
    )
    projects: Mapped[List["Project"]] = relationship(
        secondary="todo_category_project_association",
        back_populates="todo_categories",
        order_by="desc(Project.id)",
    )
    orders: Mapped[List[TodoCategoryOrder]] = relationship(
        foreign_keys=[TodoCategoryOrder.category_id],
        cascade="all, delete-orphan",
        back_populates="category",
    )
