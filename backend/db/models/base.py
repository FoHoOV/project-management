from sqlalchemy.orm import DeclarativeBase
import datetime
from typing import Optional
from sqlalchemy import DateTime
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column


class Base(DeclarativeBase):
    pass


class BasesWithCreatedDate(Base):
    __abstract__ = True

    created_date: Mapped[DateTime] = mapped_column(
        DateTime(), default=datetime.datetime.utcnow()
    )
