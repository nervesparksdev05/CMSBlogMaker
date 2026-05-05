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
    
    # --- NEW: Auth Gateway Settings ---
    AUTH_JWKS_URL: str = os.getenv("AUTH_JWKS_URL", "https://auth.nervesparks.com/api/v1/auth/.well-known/jwks.json")
    JWT_ISSUER: str = os.getenv("JWT_ISSUER", "auth-gateway")
    JWT_AUDIENCE: str = os.getenv("JWT_AUDIENCE", "auth-gateway-access")

    # ---  NEW: PostgreSQL Database Settings ---
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
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
    
    # Firebase/Firestore Settings (We will delete this later when Postgres is fully running!)
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "dashboard-26031")
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "")  
    FIRESTORE_DATABASE_ID: str = os.getenv("FIRESTORE_DATABASE_ID", "(default)")
    
    # Google Cloud Storage Settings (separate credentials for GCS bucket)
    GOOGLE_APPLICATION_CREDENTIALS: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")  

    # OpenAI fallback configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_TEXT_MODEL: str = os.getenv("OPENAI_TEXT_MODEL", "gpt-4o")
    OPENAI_IMAGE_MODEL: str = os.getenv("OPENAI_IMAGE_MODEL", "dall-e-3")

settings = Settings()