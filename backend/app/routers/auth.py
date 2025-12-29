from datetime import datetime

from fastapi import APIRouter, HTTPException
from pymongo.errors import DuplicateKeyError

from core.config import settings
from app.models.db import users_col
from app.models.schemas import SignupIn, LoginIn, TokenOut

from core.verify import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenOut)
async def signup(payload: SignupIn):
    email = payload.email.lower().strip()
    role = "admin" if email == settings.ADMIN_EMAIL.lower().strip() else "user"

    doc = {
        "name": payload.name.strip(),
        "email": email,
        "password_hash": hash_password(payload.password),
        "role": role,
        "created_at": datetime.utcnow(),
        "last_login_at": None,
    }

    try:
        res = await users_col.insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Email already exists")

    user_id = str(res.inserted_id)
    token = create_access_token(
        user_id=user_id,
        role=role,
        secret=settings.JWT_SECRET,
        expires_minutes=settings.JWT_EXPIRES_MINUTES,
    )

    await users_col.update_one(
        {"_id": res.inserted_id},
        {"$set": {"last_login_at": datetime.utcnow()}},
    )

    return {
        "access_token": token,
        "user": {"id": user_id, "name": doc["name"], "email": doc["email"], "role": role},
    }


@router.post("/login", response_model=TokenOut)
async def login(payload: LoginIn):
    email = payload.email.lower().strip()

    user = await users_col.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email/password")

    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email/password")

    user_id = str(user["_id"])
    role = user.get("role", "user")

    token = create_access_token(
        user_id=user_id,
        role=role,
        secret=settings.JWT_SECRET,
        expires_minutes=settings.JWT_EXPIRES_MINUTES,
    )

    await users_col.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login_at": datetime.utcnow()}},
    )

    return {
        "access_token": token,
        "user": {"id": user_id, "name": user["name"], "email": user["email"], "role": role},
    }
