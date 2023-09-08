from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import Base


class TodoItem(Base):
    __tablename__ = "todo_item"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String())
    description: Mapped[str] = mapped_column(String())
    is_done: Mapped[bool] = mapped_column(Boolean(), default=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    category_id: Mapped[int] = mapped_column(ForeignKey("todo_category.id"))
    user: Mapped["User"] = relationship()
    category: Mapped["TodoCategory"] = relationship()

    def __repr__(self) -> str:
        return f"TodoItem(id={self.id!r}, title={self.title!r}, description={self.description!r}, is_done={self.is_done}, user_id={self.user_id!r})"
