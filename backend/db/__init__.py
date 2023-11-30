import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from config import settings


SQLALCHEMY_DATABASE_URL = "sqlite:///./todos.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=settings.IS_LOG_SQLALCHEMY_ENABLED,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

if settings.IS_LOG_SQLALCHEMY_ENABLED:
    logging.getLogger("sqlalchemy.engine").setLevel(logging.DEBUG)


def init_db():
    from .models.base import Base

    Base.metadata.create_all(bind=engine)
