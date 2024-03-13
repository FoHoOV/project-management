from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, UniqueConstraint, func, select
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import BasesWithCreatedDate
from sqlalchemy.ext.hybrid import hybrid_property

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
        "TodoItem",
        back_populates="dependencies",
        foreign_keys=[todo_id],
        single_parent=True,
    )

    dependant_todo: Mapped["TodoItem"] = relationship(
        "TodoItem", foreign_keys=[dependant_todo_id], single_parent=True
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
