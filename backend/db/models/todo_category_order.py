from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import BasesWithCreatedDate


class TodoCategoryOrder(BasesWithCreatedDate):
    __tablename__ = "todo_category_order"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("project.id"))
    category_id: Mapped[int] = mapped_column(ForeignKey("todo_category.id"))
    next_id: Mapped[int | None] = mapped_column(
        ForeignKey("todo_category.id"), nullable=True
    )
    category: Mapped["TodoCategory"] = relationship(foreign_keys=[category_id], back_populates="orders")  # type: ignore
    project_id_and_category_id_ux = UniqueConstraint(
        "project_id", "category_id", name="project_id_and_category_id_ux"
    )
