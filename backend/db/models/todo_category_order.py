from sqlalchemy import CheckConstraint, Connection, ForeignKey, UniqueConstraint, event
from sqlalchemy.orm import Mapped, Session, Mapper
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import BaseOrderedItem, BasesWithCreatedDate
from db.models.validators.ordered_item import cyclic_order_validator


class TodoCategoryOrder(BasesWithCreatedDate, BaseOrderedItem):
    __tablename__ = "todo_category_order"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("project.id", ondelete="CASCADE")
    )
    category_id: Mapped[int] = mapped_column(
        ForeignKey("todo_category.id", ondelete="CASCADE")
    )
    left_id: Mapped[int | None] = mapped_column(
        ForeignKey("todo_category.id"), nullable=True
    )
    right_id: Mapped[int | None] = mapped_column(
        ForeignKey("todo_category.id"), nullable=True
    )
    category: Mapped["TodoCategory"] = relationship(foreign_keys=[category_id], single_parent=True, back_populates="orders")  # type: ignore

    __table_args__ = (
        UniqueConstraint("project_id", "category_id"),
        UniqueConstraint("project_id", "left_id"),
        UniqueConstraint("project_id", "right_id"),
        CheckConstraint("category_id != left_id"),
        CheckConstraint("category_id != right_id"),
        CheckConstraint("left_id != null and left_id != right_id"),
    )


@event.listens_for(TodoCategoryOrder, "before_insert")
def validate_advanced_cyclic_order_before_insert(
    mapper: Mapper, connection: Connection, target: TodoCategoryOrder
):
    with Session(connection.engine) as session:
        cyclic_order_validator(
            TodoCategoryOrder,
            session.query(TodoCategoryOrder.project_id == target.project_id),
            TodoCategoryOrder.category_id,
            target.category_id,
            target.left_id,
            target.right_id,
            lambda item: item.category_id,
        )


@event.listens_for(TodoCategoryOrder, "before_update")
def validate_advanced_cyclic_order_before_update(
    mapper: Mapper, connection: Connection, target: TodoCategoryOrder
):
    with Session(connection.engine) as session:
        cyclic_order_validator(
            TodoCategoryOrder,
            session.query(TodoCategoryOrder.project_id == target.project_id),
            TodoCategoryOrder.category_id,
            target.category_id,
            target.left_id,
            target.right_id,
            lambda item: item.category_id,
        )
