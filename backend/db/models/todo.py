from typing import List
from typing import Optional
from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import Base


class Todo(Base):
    __tablename__ = "todo"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String())
    description: Mapped[str] = mapped_column(String())
    is_done: Mapped[bool] = mapped_column(Boolean(), default=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    user: Mapped["User"] = relationship(back_populates="todos")

    def __repr__(self) -> str:
        return f"Address(id={self.id!r}, title={self.title!r}, description={self.description!r}, is_done={self.is_done}, user_id={self.user_id!r})"
