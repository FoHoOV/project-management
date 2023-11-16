from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from db.models.base import BasesWithCreatedDate


class ProjectUserAssociation(BasesWithCreatedDate):
    __tablename__ = "project_user_association"

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("project.id"), primary_key=True)

    def __repr__(self) -> str:
        return f"ProjectUserAssociation(user_id={self.user_id!r}, project_id={self.project_id!r})"
