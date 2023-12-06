from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # to get a string like this run:
    # openssl rand -hex 32
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    IS_LOG_SQLALCHEMY_ENABLED: bool = True
    SQLALCHEMY_DATABASE_URL: str = "sqlite:///./todos.db"


settings = Settings()
