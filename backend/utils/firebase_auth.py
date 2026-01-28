"""
Firebase Authentication utilities for CMS
Uses the same Firebase project as main dashboard
"""
import firebase_admin
from firebase_admin import credentials, auth
from typing import Optional, Dict, Any
import os
from core.config import settings


# Initialize Firebase Admin SDK
def initialize_firebase():
    """
    Initialize Firebase Admin SDK.
    Uses FIREBASE_CREDENTIALS_PATH for Firebase/Firestore authentication.
    This is separate from GOOGLE_APPLICATION_CREDENTIALS used for GCS bucket.
    """
    if not firebase_admin._apps:
        # Priority: FIREBASE_CREDENTIALS_PATH (for Firestore/Firebase Auth)
        if settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
        else:
            # Try to find firebase-credentials.json in the backend directory
            import pathlib
            backend_dir = pathlib.Path(__file__).parent.parent
            default_creds = backend_dir / "firebase-credentials.json"
            if default_creds.exists():
                cred = credentials.Certificate(str(default_creds))
                firebase_admin.initialize_app(cred)
            else:
                # Try to initialize with default credentials (for Google Cloud environments)
                # Note: This will use GOOGLE_APPLICATION_CREDENTIALS if set, but we prefer FIREBASE_CREDENTIALS_PATH
                try:
                    firebase_admin.initialize_app()
                except Exception as e:
                    raise ValueError(
                        "Firebase credentials not found. Please provide FIREBASE_CREDENTIALS_PATH "
                        "in .env file or place firebase-credentials.json in the backend directory"
                    ) from e


def verify_firebase_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a Firebase ID token and return decoded token
    
    Args:
        token: Firebase ID token string
        
    Returns:
        Decoded token dictionary with user information, or None if invalid
    """
    if not token or not isinstance(token, str) or len(token.strip()) == 0:
        return None
    
    try:
        # Initialize Firebase if not already initialized
        initialize_firebase()
        
        # Verify the token (this will raise an exception if invalid)
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except ValueError:
        # Invalid token format
        return None
    except Exception:
        # Token is invalid, expired, or revoked
        return None


def get_user_by_uid(uid: str) -> Optional[Dict[str, Any]]:
    """
    Get user information from Firebase by UID
    
    Args:
        uid: Firebase user UID
        
    Returns:
        User record dictionary, or None if not found
    """
    try:
        initialize_firebase()
        user_record = auth.get_user(uid)
        return {
            "uid": user_record.uid,
            "email": user_record.email,
            "email_verified": user_record.email_verified,
            "display_name": user_record.display_name,
            "photo_url": user_record.photo_url,
            "disabled": user_record.disabled,
        }
    except Exception:
        return None

