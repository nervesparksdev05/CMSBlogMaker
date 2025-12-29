from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "CMS Blog API"
    ENV: str = "dev"

    MONGODB_URI: str
    MONGODB_DB: str

    JWT_SECRET: str
    JWT_EXPIRES_MINUTES: int = 60 * 24 * 7

    ADMIN_EMAIL: str = "admin@company.com"

    CORS_ORIGINS: str = "http://localhost:5173"
    PUBLIC_BASE_URL: str = "http://127.0.0.1:8000"

    GEMINI_API_KEY: str
    GEMINI_TEXT_MODEL: str = "gemini-2.5-flash"
    GEMINI_IMAGE_MODEL: str = "gemini-2.5-flash-image"

    class Config:
        env_file = ".env"

settings = Settings()
