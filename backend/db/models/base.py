import datetime

from sqlalchemy import DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    __abstract__ = True
    __table_args__ = {"sqlite_autoincrement": True}


class BasesWithCreatedDate(Base):
    __abstract__ = True

    created_date: Mapped[DateTime] = mapped_column(
        DateTime(), default=datetime.datetime.now(datetime.UTC)
    )


class BaseOrderedItem(DeclarativeBase):
    __abstract__ = True

    left_id: Mapped[int | None]
    right_id: Mapped[int | None]
