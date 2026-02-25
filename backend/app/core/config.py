"""Application configuration via pydantic-settings.

All settings are driven by environment variables defined in .env.
No secrets should be hardcoded here.
"""

from __future__ import annotations

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ──────────────────────────────────────────────────────────────────
    APP_NAME: str = "DocMind"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    # ── CORS ─────────────────────────────────────────────────────────────────
    FRONTEND_ORIGIN: AnyHttpUrl = "http://localhost:3000"  # type: ignore[assignment]

    # ── Supabase ─────────────────────────────────────────────────────────────
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_KEY: str  # Never expose to frontend

    # ── Redis ─────────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── Celery ───────────────────────────────────────────────────────────────
    CELERY_BROKER_URL: str = ""  # Defaults to REDIS_URL if empty

    @field_validator("CELERY_BROKER_URL", mode="before")
    @classmethod
    def default_celery_broker(cls, v: str, info: object) -> str:  # noqa: ARG003
        return v or ""  # resolved at runtime using REDIS_URL

    # ── AI Provider ───────────────────────────────────────────────────────────
    LLM_PROVIDER: str = "gemini"  # gemini | openai | qwen
    LLM_MODEL: str = "gemini-2.5-flash"
    EMBEDDING_PROVIDER: str = "gemini"  # gemini | openai | qwen
    EMBEDDING_MODEL: str = "gemini-embedding-001"

    GOOGLE_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    QWEN_API_KEY: str = ""

    # ── Document Processing ───────────────────────────────────────────────────
    MAX_FILE_SIZE_MB: int = 50
    CHUNK_SIZE_TOKENS: int = 512
    CHUNK_OVERLAP_TOKENS: int = 64
    TOP_K_RETRIEVAL: int = 10

    # ── Celery Task Retry ─────────────────────────────────────────────────────
    CELERY_TASK_MAX_RETRIES: int = 3
    CELERY_TASK_RETRY_DELAY_SECONDS: int = 60


settings = Settings()  # type: ignore[call-arg]
