from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, UniqueConstraint, func, select
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.models.base import BasesWithCreatedDate

if TYPE_CHECKING:
    from db.models.todo_item import TodoItem


class TodoItemDependency(BasesWithCreatedDate):
    __tablename__ = "todo_item_dependency"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    todo_id: Mapped[int] = mapped_column(ForeignKey("todo_item.id", ondelete="CASCADE"))
    dependant_todo_id: Mapped[int] = mapped_column(
        ForeignKey("todo_item.id", ondelete="CASCADE")
    )

    todo: Mapped["TodoItem"] = relationship(
        back_populates="dependencies",
        foreign_keys=[todo_id],
        single_parent=True,
    )

    dependant_todo: Mapped["TodoItem"] = relationship(
        foreign_keys=[dependant_todo_id], single_parent=True
    )

    __table_args__ = (UniqueConstraint("todo_id", "dependant_todo_id"),)

    @hybrid_property
    def dependant_todo_title(self):  # type: ignore
        return self.dependant_todo.title

    @dependant_todo_title.expression
    def dependant_todo_title(cls):
        return (
            select(TodoItemDependency.dependant_todo.title).where(
                TodoItemDependency.id == cls.id
            )
        ).label("dependant_todo_title")
