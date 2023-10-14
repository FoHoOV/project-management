from typing import List, Optional
from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import Base


class TodoCategory(Base):
    __tablename__ = "todo_category"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String())
    description: Mapped[str] = mapped_column(String())
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    user: Mapped["User"] = relationship(back_populates="todo_categories")
    items: Mapped[List["TodoItem"]] = relationship(
        back_populates="category", cascade="all, delete-orphan", order_by="desc(TodoItem.id)"
    )

    def __repr__(self) -> str:
        return f"TodoCategory(id={self.id!r}, title={self.title!r}, description={self.description!r}, user_id={self.user_id!r})"
