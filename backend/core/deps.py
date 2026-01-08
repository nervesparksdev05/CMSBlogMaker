from fastapi import Header, HTTPException, Depends
from bson import ObjectId
import os

from core.config import settings
from app.models.db import users_col
from core.verify import decode_token

# Try to import Firebase Admin SDK for token verification
try:
    import firebase_admin
    from firebase_admin import credentials, auth
    FIREBASE_AVAILABLE = True
    
    # Initialize Firebase if not already initialized
    if not firebase_admin._apps:
        firebase_creds_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
        # Also check for firebase-credentials.json in the backend directory
        if not firebase_creds_path:
            import pathlib
            backend_dir = pathlib.Path(__file__).parent.parent.parent
            default_creds = backend_dir / "firebase-credentials.json"
            if default_creds.exists():
                firebase_creds_path = str(default_creds)
        
        if firebase_creds_path and os.path.exists(firebase_creds_path):
            try:
                cred = credentials.Certificate(firebase_creds_path)
                firebase_admin.initialize_app(cred)
                print(f"Firebase Admin SDK initialized with credentials from: {firebase_creds_path}")
            except Exception as e:
                print(f"Failed to initialize Firebase with credentials file: {e}")
                FIREBASE_AVAILABLE = False
        elif os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
            # Use application default credentials
            try:
                firebase_admin.initialize_app()
                print("Firebase Admin SDK initialized with GOOGLE_APPLICATION_CREDENTIALS")
            except Exception as e:
                print(f"Failed to initialize Firebase with GOOGLE_APPLICATION_CREDENTIALS: {e}")
                FIREBASE_AVAILABLE = False
        else:
            # Try to initialize with default credentials
            try:
                firebase_admin.initialize_app()
                print("Firebase Admin SDK initialized with default credentials")
            except Exception as e:
                print(f"Failed to initialize Firebase with default credentials: {e}")
                FIREBASE_AVAILABLE = False
except ImportError:
    FIREBASE_AVAILABLE = False


def verify_firebase_token(token: str):
    """
    Verify a Firebase ID token and return decoded token
    Returns None if token is invalid or Firebase is not available
    """
    if not FIREBASE_AVAILABLE:
        print("WARNING: Firebase Admin SDK not available. Cannot verify Firebase tokens.")
        return None
    
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"Firebase token verification failed: {str(e)}")
        return None

def oid(s: str) -> ObjectId:
    try:
        return ObjectId(s)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")

async def get_current_user(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.replace("Bearer ", "").strip()
    
    if not token:
        raise HTTPException(status_code=401, detail="Empty token")
    
    # First, try to decode as CMS JWT token
    payload = decode_token(token, settings.JWT_SECRET)
    
    # If that fails, try to verify as Firebase token
    if not payload:
        if not FIREBASE_AVAILABLE:
            raise HTTPException(
                status_code=401, 
                detail="Firebase Admin SDK not available. Please install firebase-admin and configure Firebase credentials."
            )
        
        firebase_payload = verify_firebase_token(token)
        if firebase_payload:
            # Convert Firebase token to CMS token format
            email = firebase_payload.get("email")
            name = firebase_payload.get("name") or (email.split("@")[0] if email else "")
            payload = {
                "sub": firebase_payload.get("uid"),  # Firebase UID
                "email": email,
                "name": name,
                "role": "user",  # Default role, can be overridden
            }
    
    if not payload:
        error_detail = "Invalid or expired token"
        if not FIREBASE_AVAILABLE:
            error_detail += " (Firebase Admin SDK not available - check Firebase credentials configuration)"
        raise HTTPException(status_code=401, detail=error_detail)

    user_id = payload.get("sub")
    email = payload.get("email")
    
    # Try to find user by ID first (ObjectId)
    u = None
    if user_id:
        try:
            # Try to convert to ObjectId - if it fails, it's probably an email
            obj_id = ObjectId(user_id)
            u = await users_col.find_one({"_id": obj_id})
        except (Exception, ValueError):
            # If user_id is not a valid ObjectId (e.g., it's an email), skip ID lookup
            pass
    
    # If not found by ID and email is available, try to find by email
    if not u and email:
        u = await users_col.find_one({"email": email.lower().strip()})
        
        # If user found by email but not by ID, this might be a new user from main dashboard
        # We can optionally create the user here, but for now just return the found user
        if u:
            # User exists, return it
            pass
        else:
            # User doesn't exist - create them
            # This handles users coming from main dashboard
            from datetime import datetime
            from core.verify import hash_password
            import secrets
            
            # Create a random password hash (user won't use password login)
            random_password = secrets.token_urlsafe(32)
            password_hash = hash_password(random_password)
            
            # Determine role from token or default to "user"
            role = payload.get("role", "user")
            
            doc = {
                "name": payload.get("name", email.split("@")[0]),
                "email": email.lower().strip(),
                "password_hash": password_hash,
                "role": role,
                "created_at": datetime.utcnow(),
                "last_login_at": datetime.utcnow(),
            }
            
            result = await users_col.insert_one(doc)
            u = await users_col.find_one({"_id": result.inserted_id})
    
    if not u:
        raise HTTPException(status_code=401, detail="User not found")

    return {
        "id": str(u["_id"]),
        "name": u["name"],
        "email": u["email"],
        "role": u.get("role", "user"),
    }

async def require_admin(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user
