import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Content Agent System"
    API_V1_STR: str = "/api/v1"
    
    # LLM Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "your-key-here")
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "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")
    DEFAULT_MODEL: str = "llama-3.3-70b-versatile"
    NVIDIA_MODEL: str = os.getenv("NVIDIA_MODEL", "meta/llama-3.1-70b-instruct")
    
    # Database
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "content_agent_db")
    SQLALCHEMY_DATABASE_URL: str = ""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        from urllib.parse import quote_plus
        encoded_password = quote_plus(self.POSTGRES_PASSWORD)
        self.SQLALCHEMY_DATABASE_URL = f"postgresql://{self.POSTGRES_USER}:{encoded_password}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"
    
    # Redis
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", 6379))
    CELERY_BROKER_URL: str = f"redis://{REDIS_HOST}:{REDIS_PORT}/0"
    CELERY_RESULT_BACKEND: str = f"redis://{REDIS_HOST}:{REDIS_PORT}/0"

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
