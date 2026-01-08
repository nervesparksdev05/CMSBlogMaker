import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Application settings for CMS Blog API"""
    
    # Application Settings
    APP_NAME: str = os.getenv("APP_NAME", "CMS Blog API")
    ENV: str = os.getenv("ENV", "dev")
    
    # API Settings
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "")
    PUBLIC_BASE_URL: str = os.getenv("PUBLIC_BASE_URL", "")
    
    # JWT Settings (for backward compatibility with legacy tokens)
    JWT_SECRET: str = os.getenv("JWT_SECRET", "")
    JWT_EXPIRES_MINUTES: int = int(os.getenv("JWT_EXPIRES_MINUTES", "60"))
    
    # Admin Settings
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "")
    
    # AI/ML Settings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_TEXT_MODEL: str = os.getenv("GEMINI_TEXT_MODEL", "gemini-flash-latest")
    GEMINI_IMAGE_MODEL: str = os.getenv("GEMINI_IMAGE_MODEL", "gemini-2.0-flash-exp-image-generation")
    
    # Google Cloud Storage Settings
    GCS_BUCKET: str = os.getenv("GCS_BUCKET", "")
    GCS_FOLDER: str = os.getenv("GCS_FOLDER", "")
    GCS_PUBLIC_BASE: str = os.getenv("GCS_PUBLIC_BASE", "https://storage.googleapis.com")
    
    # Firebase/Firestore Settings
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "dashboard-26031")
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "")  # For Firestore
    FIRESTORE_DATABASE_ID: str = os.getenv("FIRESTORE_DATABASE_ID", "(default)")
    
    # Google Cloud Storage Settings (separate credentials for GCS bucket)
    GOOGLE_APPLICATION_CREDENTIALS: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")  # For GCS bucket

settings = Settings()
