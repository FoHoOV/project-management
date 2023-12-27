from config import settings
from db.db import get_db_params, init_database
from db.models.base import Base


params = get_db_params(settings.SQLALCHEMY_DATABASE_URL, False)

engine = params["engine"]
SessionLocalTest = params["session"]


def init_db():
    Base.metadata.drop_all(bind=engine)
    init_database(engine)
