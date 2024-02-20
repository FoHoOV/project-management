from typing import List
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy.orm import mapped_column
from db.models.base import BasesWithCreatedDate


class ProjectUserAssociation(BasesWithCreatedDate):
    __tablename__ = "project_user_association"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"))
    project_id: Mapped[int] = mapped_column(
        ForeignKey("project.id", ondelete="CASCADE")
    )
    permissions: Mapped[List["UserProjectPermission"]] = relationship(  # type: ignore
        "UserProjectPermission",
        back_populates="project_user_association",
        cascade="all, delete-orphan",
    )

    __table_args__ = (UniqueConstraint("user_id", "project_id"),)
