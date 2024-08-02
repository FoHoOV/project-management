from fastapi import logger

from db import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as ex:
        logger.logger.error(ex)
    finally:
        db.close()
