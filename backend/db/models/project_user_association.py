from __future__ import annotations


from typing import TYPE_CHECKING, List
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy.orm import mapped_column
from db.models.base import BasesWithCreatedDate


if TYPE_CHECKING:
    from db.models.project import Project
    from db.models.user import User
    from db.models.user_project_permission import UserProjectPermission


class ProjectUserAssociation(BasesWithCreatedDate):
    __tablename__ = "project_user_association"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"))
    project_id: Mapped[int] = mapped_column(
        ForeignKey("project.id", ondelete="CASCADE")
    )
    permissions: Mapped[List["UserProjectPermission"]] = relationship(
        back_populates="project_user_association",
        cascade="all, delete-orphan",
    )

    project: Mapped["Project"] = relationship(
        foreign_keys=[project_id], back_populates="associations", viewonly=True
    )
    user: Mapped["User"] = relationship(
        foreign_keys=[user_id], back_populates="associations", viewonly=True
    )

    __table_args__ = (UniqueConstraint("user_id", "project_id"),)
