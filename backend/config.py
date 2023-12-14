from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # to get a string like this run:
    # openssl rand -hex 32
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    SQLALCHEMY_DATABASE_URL: str
    ALLOWED_ORIGINS: list[str]
    IS_SQLALCHEMY_LOG_ENABLED: bool

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()  # type: ignore
