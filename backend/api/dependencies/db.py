from db import get_session_factory


def get_db():
    db = get_session_factory()()
    try:
        yield db
    finally:
        db.close()
