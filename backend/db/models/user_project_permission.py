from __future__ import annotations

import enum
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.models.base import Base

if TYPE_CHECKING:
    from db.models.project_user_association import ProjectUserAssociation


class Permission(enum.StrEnum):
    CREATE_TODO_CATEGORY = enum.auto()
    UPDATE_TODO_CATEGORY = enum.auto()
    DELETE_TODO_CATEGORY = enum.auto()

    CREATE_TODO_ITEM = enum.auto()
    UPDATE_TODO_ITEM = enum.auto()
    DELETE_TODO_ITEM = enum.auto()

    CREATE_TODO_ITEM_DEPENDENCY = enum.auto()
    UPDATE_TODO_ITEM_DEPENDENCY = enum.auto()
    DELETE_TODO_ITEM_DEPENDENCY = enum.auto()

    CREATE_COMMENT = enum.auto()
    UPDATE_COMMENT = enum.auto()
    DELETE_COMMENT = enum.auto()

    CREATE_TAG = enum.auto()
    UPDATE_TAG = enum.auto()
    DELETE_TAG = enum.auto()

    UPDATE_PROJECT = enum.auto()

    ALL = enum.auto()


class UserProjectPermission(Base):
    __tablename__ = "user_project_permission"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_user_association_id: Mapped[int] = mapped_column(
        ForeignKey("project_user_association.id", ondelete="CASCADE"), nullable=False
    )
    permission: Mapped[Permission] = mapped_column(
        Enum(Permission, validate_strings=True)
    )
    project_user_association: Mapped["ProjectUserAssociation"] = relationship(
        back_populates="permissions",
        single_parent=True,
        cascade="all, delete-orphan",
    )

    __table_args__ = (UniqueConstraint("project_user_association_id", "permission"),)
