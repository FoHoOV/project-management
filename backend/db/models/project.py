from typing import TYPE_CHECKING, List

from sqlalchemy import String, func, select
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.models.base import BasesWithCreatedDate

if TYPE_CHECKING:
    from db.models.project_user_association import ProjectUserAssociation
    from db.models.tag import Tag
    from db.models.todo_category import TodoCategory
    from db.models.user import User


class Project(BasesWithCreatedDate):
    __tablename__ = "project"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String())
    description: Mapped[str] = mapped_column(String())
    users: Mapped[List["User"]] = relationship(
        secondary="project_user_association", back_populates="projects"
    )
    todo_categories: Mapped[List["TodoCategory"]] = relationship(
        secondary="todo_category_project_association",
        back_populates="projects",
        order_by="desc(TodoCategory.id)",
    )
    tags: Mapped[List["Tag"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="desc(Tag.id)",
    )
    associations: Mapped[List["ProjectUserAssociation"]] = relationship(
        back_populates="project", viewonly=True
    )

    # TODO: i dont know about the performance implications of these hybrid queries... like does sqlalchemy remove the need to query the db again if the object is already there?
    @hybrid_property
    def done_todos_count(self):  # type: ignore
        done_todos = 0
        for todo_category in self.todo_categories:
            done_todos += len(
                list(filter(lambda todo_item: todo_item.is_done, todo_category.items))
            )
        return done_todos

    @done_todos_count.expression
    def done_todos_count(cls):
        from db.models.todo_category import TodoCategory
        from db.models.todo_item import TodoItem

        return func.count(
            select(Project)
            .join(Project.todo_categories)
            .join(TodoCategory.items)
            .where(TodoItem.is_done == True, Project.id == cls.id)
        ).label("done_todos")

    @hybrid_property
    def pending_todos_count(self):  # type: ignore
        pending_todos = 0
        for todo_category in self.todo_categories:
            pending_todos += len(
                list(
                    filter(
                        lambda todo_item: todo_item.is_done == False,
                        todo_category.items,
                    )
                )
            )
        return pending_todos

    @pending_todos_count.expression
    def pending_todos_count(cls):
        from db.models.todo_category import TodoCategory
        from db.models.todo_item import TodoItem

        return func.count(
            select(Project)
            .join(Project.todo_categories)
            .join(TodoCategory.items)
            .where(TodoItem.is_done == False, Project.id == cls.id)
        ).label("pending_todos")
