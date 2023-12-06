from sqlalchemy import CheckConstraint, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import BasesWithCreatedDate


class TodoCategoryOrder(BasesWithCreatedDate):
    __tablename__ = "todo_category_order"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("project.id"))
    category_id: Mapped[int] = mapped_column(ForeignKey("todo_category.id"))
    left_id: Mapped[int | None] = mapped_column(
        ForeignKey("todo_category.id"), nullable=True
    )
    right_id: Mapped[int | None] = mapped_column(
        ForeignKey("todo_category.id"), nullable=True
    )
    category: Mapped["TodoCategory"] = relationship(foreign_keys=[category_id], cascade="all, delete-orphan", single_parent=True, back_populates="orders")  # type: ignore

    __table_args__ = (
        UniqueConstraint("project_id", "category_id"),
        UniqueConstraint("project_id", "left_id"),
        UniqueConstraint("project_id", "right_id"),
        CheckConstraint("category_id != left_id"),
        CheckConstraint("category_id != right_id"),
        CheckConstraint("left_id != null and left_id != right_id"),
    )
