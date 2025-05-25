from pydantic_settings import BaseSettings
from pydantic import PostgresDsn, validator
from urllib.parse import urlparse

class Settings(BaseSettings):
    DATABASE_URL: PostgresDsn
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    SUPABASE_URL: str
    SUPABASE_KEY: str
    OPENAI_API_KEY: str
    BUCKET_NAME: str = "default-bucket"
    PROJECT_EMAIL: str = "admin@example.com"
    PROJECT_ID: str = "default_project_id"

    @validator("SUPABASE_URL")
    def validate_supabase_url(cls, v):
        if not urlparse(v).scheme in ['http', 'https']:
            raise ValueError("URL Supabase invalide")
        return v

    model_config = {
        "env_file": ".env",
        "case_sensitive": True
    }

settings = Settings()
