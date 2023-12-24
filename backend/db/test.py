from config import settings
from db.db import get_db_params, init_database

params = get_db_params(settings.SQLALCHEMY_TEST_DATABASE_URL, True)

engine = params["engine"]
SessionLocalTest = params["session"]


def init_db():
    init_database(engine)
