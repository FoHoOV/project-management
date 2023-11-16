from typing import List
from sqlalchemy import String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from db.models.base import BasesWithCreatedDate


class User(BasesWithCreatedDate):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(30))
    password: Mapped[str] = mapped_column(String())
    projects: Mapped[List["Project"]] = relationship(  # type: ignore
        secondary="project_user_association", back_populates="users"
    )

    def __repr__(self) -> str:
        return f"User(id={self.id!r}, username={self.username!r}, password={self.password!r})"
