from sqlalchemy import CheckConstraint, Connection, ForeignKey, event
from sqlalchemy.orm import Mapped, Session, Mapper
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import BasesWithCreatedDate
from db.models.utils.ordered_item import cyclic_order_validator


class TodoItemOrder(BasesWithCreatedDate):
    __tablename__ = "todo_item_order"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    todo_id: Mapped[int] = mapped_column(ForeignKey("todo_item.id"), unique=True)
    left_id: Mapped[int | None] = mapped_column(
        ForeignKey("todo_item.id"), nullable=True, unique=True
    )
    right_id: Mapped[int | None] = mapped_column(
        ForeignKey("todo_item.id"), nullable=True, unique=True
    )
    moving_id: Mapped[int] = mapped_column(ForeignKey("todo_item.id"), unique=True)
    todo: Mapped["TodoItem"] = relationship(foreign_keys=[todo_id], single_parent=True, back_populates="order")  # type: ignore

    __table_args__ = (
        CheckConstraint("todo_id != left_id"),
        CheckConstraint("todo_id != right_id"),
        CheckConstraint("left_id != null and left_id != right_id"),
    )


@event.listens_for(TodoItemOrder, "before_insert")
def validate_advanced_cyclic_order_before_insert(
    mapper: Mapper, connection: Connection, target: TodoItemOrder
):
    with Session(connection.engine) as session:
        cyclic_order_validator(
            TodoItemOrder,
            session.query(TodoItemOrder),
            TodoItemOrder.todo_id,
            target.todo_id,
            target.left_id,
            target.right_id,
        )


@event.listens_for(TodoItemOrder, "before_update")
def validate_advanced_cyclic_order_before_update(
    mapper: Mapper, connection: Connection, target: TodoItemOrder
):
    with Session(connection.engine) as session:
        cyclic_order_validator(
            TodoItemOrder,
            session.query(TodoItemOrder),
            TodoItemOrder.todo_id,
            target.todo_id,
            target.left_id,
            target.right_id,
        )
