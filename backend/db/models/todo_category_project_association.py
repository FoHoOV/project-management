from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from db.models.base import BasesWithCreatedDate


class TodoCategoryProjectAssociation(BasesWithCreatedDate):
    __tablename__ = "todo_category_project_association"

    todo_category_id: Mapped[int] = mapped_column(
        ForeignKey("todo_category.id"), primary_key=True
    )
    project_id: Mapped[int] = mapped_column(ForeignKey("project.id"), primary_key=True)
