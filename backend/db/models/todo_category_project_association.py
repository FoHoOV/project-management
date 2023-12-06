from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from db.models.base import BasesWithCreatedDate


class TodoCategoryProjectAssociation(BasesWithCreatedDate):
    __tablename__ = "todo_category_project_association"

    category_id: Mapped[int] = mapped_column(
        ForeignKey("todo_category.id", ondelete="CASCADE"), primary_key=True
    )
    project_id: Mapped[int] = mapped_column(
        ForeignKey("project.id", ondelete="CASCADE"), primary_key=True
    )

    __table_args__ = (UniqueConstraint("project_id", "category_id"),)
