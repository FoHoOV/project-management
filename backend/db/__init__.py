from config import settings
from db.db import get_db_params, init_database

params = get_db_params(
    settings.SQLALCHEMY_DATABASE_URL, settings.IS_SQLALCHEMY_LOG_ENABLED
)

engine = params["engine"]
SessionLocal = params["session"]


def init_db():
    init_database(engine)
