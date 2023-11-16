from typing import List
from sqlalchemy import String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import BasesWithCreatedDate


class Project(BasesWithCreatedDate):
    __tablename__ = "project"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String())
    description: Mapped[str] = mapped_column(String())
    users: Mapped[List["User"]] = relationship(
        secondary="project_user_association", back_populates="projects"
    )
    todo_categories: Mapped[List["TodoCategory"]] = relationship(
        secondary="todo_category_project_association", back_populates="projects"
    )

    def __repr__(self) -> str:
        return f"Project(id={self.id!r}, title={self.title!r}, description={self.description!r})"
