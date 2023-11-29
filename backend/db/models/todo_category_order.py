from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import BasesWithCreatedDate, BaseCustomOrder


class TodoCategoryOrder(BasesWithCreatedDate, BaseCustomOrder):
    __tablename__ = "todo_category_order"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("project.id"))
    category_id: Mapped[int] = mapped_column(ForeignKey("todo_category.id"))
    category: Mapped["TodoCategory"] = relationship(back_populates="orders")  # type: ignore
