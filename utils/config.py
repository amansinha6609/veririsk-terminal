"""
Configuration management via environment variables.
Copy .env.example to .env and fill in your keys.
"""

from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    # --- Anthropic ---
    ANTHROPIC_API_KEY: str

    # --- NewsAPI ---
    NEWS_API_KEY: str = ""

    # --- SerpAPI (Google Search) ---
    SERP_API_KEY: str = ""

    # --- SEC EDGAR ---
    # No key needed; uses public API. Set a user-agent email for compliance.
    SEC_EDGAR_USER_AGENT: str = "DueDiligenceAI contact@yourcompany.com"

    # --- Server ---
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    API_SECRET_KEY: str = "change-me-in-production"

    # --- Rate limiting ---
    MAX_CONCURRENT_ANALYSES: int = 5

    # --- Timeouts (seconds) ---
    CLAUDE_TIMEOUT: int = 120
    EXTERNAL_API_TIMEOUT: int = 15

    # --- Report storage (set to "" to disable persistence) ---
    REPORTS_DIR: str = "./reports"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
