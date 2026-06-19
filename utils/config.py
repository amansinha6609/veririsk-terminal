"""
Institutional Configuration Management
Automated via Pydantic-Settings for Veririsk Forensic Terminal.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
from functools import lru_cache
import os


class Settings(BaseSettings):
    # --- Required Terminal Keys (Matches your .env) ---
    GEMINI_API_KEY: str = ""
    VITE_CLERK_PUBLISHABLE_KEY: str = ""
    APP_URL: str = "http://localhost:5173"

    # --- Optional AI Nodes (Set to None to prevent crashes) ---
    ANTHROPIC_API_KEY: Optional[str] = None
    NEWS_API_KEY: str = ""
    SERP_API_KEY: str = ""

    # --- SEC EDGAR Compliance ---
    SEC_EDGAR_USER_AGENT: str = "VeririskForensic contact@yourcompany.com"

    # --- Infrastructure ---
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    API_SECRET_KEY: str = "institutional-handshake-v3"
    PORT: int = 8008
    
    # --- Performance Tuning ---
    MAX_CONCURRENT_ANALYSES: int = 5
    EXTERNAL_API_TIMEOUT: int = 15

    # --- Persistence ---
    REPORTS_DIR: str = "./reports"

    # --- Audit Protocol (The "Safety Valve") ---
    # This tells Pydantic to read your .env and NOT crash on extra fields.
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"  # Crucial: This ignores keys it doesn't recognize
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Handle comma separated ALLOWED_ORIGINS
        if isinstance(self.ALLOWED_ORIGINS, str):
            self.ALLOWED_ORIGINS = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


@lru_cache()
def get_settings() -> Settings:
    """Returns a cached instance of the settings to save system resources."""
    return Settings()


# Initialize the settings object for use across the application
settings = get_settings()
