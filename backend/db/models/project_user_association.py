from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from db.models.base import BasesWithCreatedDate


class ProjectUserAssociation(BasesWithCreatedDate):
    __tablename__ = "project_user_association"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"), primary_key=True
    )
    project_id: Mapped[int] = mapped_column(
        ForeignKey("project.id", ondelete="CASCADE"), primary_key=True
    )

    __table_args__ = (UniqueConstraint("user_id", "project_id"),)
