"""
Authentication routes for CMS.

Note: These routes are deprecated. User authentication is now handled
by the main dashboard using Firebase Auth. These endpoints are kept
for backward compatibility only.
"""
from fastapi import APIRouter, HTTPException

from app.models.schemas import SignupIn, LoginIn, TokenOut

router = APIRouter()


@router.post("/signup", response_model=TokenOut)
async def signup(payload: SignupIn):
    """
    DEPRECATED: User management now uses Firestore via main dashboard.
    Users should register/login through the main dashboard Firebase Auth.
    This endpoint is kept for backward compatibility only.
    """
    raise HTTPException(status_code=410, detail="Signup is no longer available. Please use the main dashboard for user registration.")


@router.post("/login", response_model=TokenOut)
async def login(payload: LoginIn):
    """
    DEPRECATED: User management now uses Firestore via main dashboard.
    Users should login through the main dashboard Firebase Auth.
    This endpoint is kept for backward compatibility only.
    """
    raise HTTPException(status_code=410, detail="Login is no longer available. Please use the main dashboard for authentication.")
