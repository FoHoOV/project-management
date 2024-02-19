import enum
from db.models.base import Base, BasesWithCreatedDate
from sqlalchemy import (
    CheckConstraint,
    Connection,
    Enum,
    ForeignKey,
    UniqueConstraint,
    event,
)
from sqlalchemy.orm import Mapped, Session, Mapper
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from db.models.base import BaseOrderedItem, BasesWithCreatedDate


class Permission(enum.StrEnum):
    UPDATE = enum.auto()
    DELETE = enum.auto()
    CREATE = enum.auto()
    ALL = enum.auto()


class UserProjectPermission(Base):
    __tablename__ = "user_project_permission"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_user_association_id: Mapped[int] = mapped_column(
        ForeignKey("project_user_association.id", ondelete="CASCADE"), primary_key=True
    )
    permission: Mapped[Permission] = mapped_column(
        Enum(Permission, validate_strings=True)
    )
    project_user_association: Mapped["ProjectUserAssociation"] = relationship(  # type: ignore
        "ProjectUserAssociation",
        back_populates="permissions",
        single_parent=True,
        cascade="all, delete-orphan",
    )

    __table_args__ = (UniqueConstraint("project_user_association_id", "permission"),)
