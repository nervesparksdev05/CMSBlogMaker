import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "CMS Blog API")
    ENV: str = os.getenv("ENV", "dev")

    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    MONGODB_DB: str = os.getenv("MONGODB_DB", "")

    JWT_SECRET: str = os.getenv("JWT_SECRET", "")
    JWT_EXPIRES_MINUTES: int = int(os.getenv("JWT_EXPIRES_MINUTES", "60"))

    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "")

    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "")
    PUBLIC_BASE_URL: str = os.getenv("PUBLIC_BASE_URL", "")

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_TEXT_MODEL: str = os.getenv("GEMINI_TEXT_MODEL", "gemini-flash-latest")
    GEMINI_IMAGE_MODEL: str = os.getenv("GEMINI_IMAGE_MODEL", "gemini-2.0-flash-exp-image-generation")

settings = Settings()
