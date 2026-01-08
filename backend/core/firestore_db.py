"""
Firestore database configuration and connection management for CMS.

Uses the same Firestore database as main dashboard for user management.
This ensures consistency across both applications.
"""
import logging
import os
from typing import Optional

import firebase_admin
from google.cloud import firestore
from google.oauth2 import service_account

from .config import settings
from utils.firebase_auth import initialize_firebase

logger = logging.getLogger(__name__)

# Firestore client (singleton pattern)
db: Optional[firestore.Client] = None


def init_db() -> firestore.Client:
    """
    Initialize Firestore connection.
    
    Uses the same credentials as Firebase Admin SDK to ensure consistency.
    Supports multiple credential sources:
    1. GOOGLE_APPLICATION_CREDENTIALS environment variable
    2. FIREBASE_CREDENTIALS_PATH from settings
    3. firebase-credentials.json in backend directory
    4. Default credentials (for Google Cloud environments)
    
    Returns:
        firestore.Client: Initialized Firestore client
    """
    global db
    
    try:
        # Ensure Firebase Admin SDK is initialized first
        if not firebase_admin._apps:
            initialize_firebase()
        
        # Get credentials file path for Firestore (use FIREBASE_CREDENTIALS_PATH)
        creds_path = None
        
        # Priority: FIREBASE_CREDENTIALS_PATH (for Firestore)
        if settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
            creds_path = settings.FIREBASE_CREDENTIALS_PATH
        else:
            # Try to find firebase-credentials.json in the backend directory
            import pathlib
            backend_dir = pathlib.Path(__file__).parent.parent
            default_creds = backend_dir / "firebase-credentials.json"
            if default_creds.exists():
                creds_path = str(default_creds)
        
        if creds_path and os.path.exists(creds_path):
            # Load credentials from file for Firestore
            credentials = service_account.Credentials.from_service_account_file(creds_path)
            db = firestore.Client(
                project=settings.FIREBASE_PROJECT_ID,
                credentials=credentials,
                database=settings.FIRESTORE_DATABASE_ID
            )
            logger.info(f"Firestore initialized with credentials from: {creds_path}")
        else:
            # Fallback: Use default credentials (for Google Cloud environments)
            # This will use the same credentials as Firebase Admin SDK
            db = firestore.Client(
                project=settings.FIREBASE_PROJECT_ID,
                database=settings.FIRESTORE_DATABASE_ID
            )
            logger.info("Firestore initialized with default credentials")
        
        return db
    except Exception as e:
        logger.error(f"Error initializing Firestore: {e}")
        raise


def get_db() -> firestore.Client:
    """
    Get Firestore database instance (singleton pattern).
    
    Returns:
        firestore.Client: Firestore client instance
    """
    global db
    if db is None:
        db = init_db()
    return db

