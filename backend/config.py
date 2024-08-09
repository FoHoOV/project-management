from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    # these configurations read from the .env file that you have to create
    SECRET_KEY: str
    SQLALCHEMY_DATABASE_URL: str
    ALLOWED_ORIGINS: list[str]
    IS_SQLALCHEMY_LOG_ENABLED: bool
    ALLOW_ORIGIN_REGEX: str | None = None

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()  # type: ignore
