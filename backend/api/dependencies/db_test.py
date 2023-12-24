from db.test import SessionLocalTest


def get_test_db():
    db = SessionLocalTest()
    try:
        yield db
    finally:
        db.close()
