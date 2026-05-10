from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "local"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    frontend_origin: str = "http://localhost:3000"
    database_url: str = (
        "postgresql+psycopg://trueplot_user:trueplot_pass@localhost:5432/trueplot"
    )
    openai_api_key: str | None = None
    openai_model: str = "gpt-4.1-mini"
    jwt_secret_key: str = "change-me-local-dev-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
