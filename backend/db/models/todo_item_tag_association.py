from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.models.base import BasesWithCreatedDate


class TodoItemTagAssociation(BasesWithCreatedDate):
    __tablename__ = "todo_item_tag_association"

    todo_id: Mapped[int] = mapped_column(
        ForeignKey("todo_item.id", ondelete="CASCADE"), primary_key=True
    )
    tag_id: Mapped[int] = mapped_column(
        ForeignKey("tag.id", ondelete="CASCADE"), primary_key=True
    )

    __table_args__ = (UniqueConstraint("todo_id", "tag_id"),)
