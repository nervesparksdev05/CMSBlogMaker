from fastapi import Header, HTTPException, Depends
import os
import logging

from core.config import settings
from core.verify import decode_token
from utils.firebase_auth import verify_firebase_token, initialize_firebase
from core.firestore_db import get_db

logger = logging.getLogger(__name__)

# Initialize Firebase
try:
    initialize_firebase()
    FIREBASE_AVAILABLE = True
except Exception as e:
    logger.warning(f"Firebase initialization failed: {e}")
    FIREBASE_AVAILABLE = False


async def get_current_user(authorization: str = Header(default="")):
    """
    Get current user from Firebase token and Firestore.
    Uses the same Firestore users collection as main dashboard.
    """
    if not authorization.startswith("Bearer "):
        logger.warning("Missing Bearer token in authorization header")
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.replace("Bearer ", "").strip()
    
    if not token:
        logger.warning("Empty token in authorization header")
        raise HTTPException(status_code=401, detail="Empty token")
    
    # First, try to decode as CMS JWT token (for backward compatibility)
    payload = decode_token(token, settings.JWT_SECRET)
    firebase_uid = None
    
    # If that fails, try to verify as Firebase token
    if not payload:
        if not FIREBASE_AVAILABLE:
            logger.error("Firebase Admin SDK not available")
            raise HTTPException(
                status_code=401, 
                detail="Firebase Admin SDK not available. Please install firebase-admin and configure Firebase credentials."
            )
        
        firebase_payload = verify_firebase_token(token)
        if firebase_payload:
            firebase_uid = firebase_payload.get("uid")
            email = firebase_payload.get("email")
            name = firebase_payload.get("name") or (email.split("@")[0] if email else "")
            
            # Convert Firebase token to payload format
            payload = {
                "sub": firebase_uid,  # Firebase UID
                "email": email,
                "name": name,
            }
            logger.debug(f"Firebase token verified for user: {firebase_uid}")
        else:
            logger.warning("Firebase token verification failed")
    
    if not payload:
        error_detail = "Invalid or expired token"
        if not FIREBASE_AVAILABLE:
            error_detail += " (Firebase Admin SDK not available - check Firebase credentials configuration)"
        logger.warning(f"Token verification failed: {error_detail}")
        raise HTTPException(status_code=401, detail=error_detail)

    firebase_uid = payload.get("sub")  # This is the Firebase UID
    email = payload.get("email")
    
    if not firebase_uid:
        logger.warning("Token missing user ID (firebase_uid)")
        raise HTTPException(status_code=401, detail="Invalid token: missing user ID")
    
    # Get user from Firestore (same database as main dashboard)
    try:
        db = get_db()
        users_collection = db.collection('users')
        
        # Query Firestore for user by firebase_uid
        from google.cloud.firestore_v1.base_query import FieldFilter
        user_docs = list(users_collection.where(filter=FieldFilter('firebase_uid', '==', firebase_uid)).limit(1).stream())
        user_doc = user_docs[0] if user_docs else None
        
        if not user_doc:
            logger.warning(f"User with firebase_uid {firebase_uid} not found in Firestore")
            raise HTTPException(status_code=401, detail="User not found in database")
        
        user_data = user_doc.to_dict()
        
        # Check if user is active
        if not user_data.get('is_active', True):
            logger.warning(f"User {firebase_uid} account is disabled")
            raise HTTPException(status_code=403, detail="User account is disabled")
        
        # Determine role: admin if is_superuser is True, otherwise user
        is_superuser = user_data.get('is_superuser', False)
        role = "admin" if is_superuser else "user"
        
        logger.info(f"User authenticated: {firebase_uid}, email: {email}, is_superuser: {is_superuser}, role: {role}")
        
        return {
            "id": user_doc.id,  # Firestore document ID
            "name": user_data.get('username') or user_data.get('display_name') or payload.get("name", ""),
            "email": user_data.get('email') or email,
            "role": role,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying Firestore for user {firebase_uid}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Database error")


async def require_admin(user=Depends(get_current_user)):
    """
    Require admin role - checks is_superuser from Firestore.
    Main dashboard admins (is_superuser=True) are CMS admins.
    """
    if user["role"] != "admin":
        logger.warning(f"Admin access denied for user {user.get('email')} (id: {user.get('id')}, role: {user.get('role')})")
        raise HTTPException(
            status_code=403, 
            detail=f"Admin only. Current role: {user.get('role')}. User must have is_superuser=True in Firestore."
        )
    logger.info(f"Admin access granted for user {user.get('email')} (id: {user.get('id')})")
    return user
