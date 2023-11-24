from sqlalchemy.orm import DeclarativeBase
import datetime
from sqlalchemy import DateTime
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column


class Base(DeclarativeBase):
    __abstract__ = True
    __table_args__ = {"sqlite_autoincrement": True}
    pass


class BasesWithCreatedDate(Base):
    __abstract__ = True

    created_date: Mapped[DateTime] = mapped_column(
        DateTime(), default=datetime.datetime.utcnow()
    )
