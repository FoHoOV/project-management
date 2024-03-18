from typing import TYPE_CHECKING, List
from sqlalchemy import String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from db.models.base import BasesWithCreatedDate


if TYPE_CHECKING:
    from db.models.project import Project
    from db.models.todo_item import TodoItem
    from db.models.project_user_association import ProjectUserAssociation


class User(BasesWithCreatedDate):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(30))
    password: Mapped[str] = mapped_column(String())
    projects: Mapped[List["Project"]] = relationship(
        secondary="project_user_association", back_populates="users"
    )
    done_todos: Mapped[List["TodoItem"]] = relationship(
        back_populates="marked_as_done_by"
    )

    associations: Mapped[List["ProjectUserAssociation"]] = relationship(
        back_populates="user", viewonly=True
    )
