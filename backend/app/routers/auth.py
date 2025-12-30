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

    # ✅ admin only if email is allowed
    admin_emails = {
        e.strip().lower()
        for e in (getattr(settings, "ADMIN_EMAIL", "") or "").split(",")
        if e.strip()
    }
    # fallback to single ADMIN_EMAIL
    if getattr(settings, "ADMIN_EMAIL", None):
        admin_emails.add(settings.ADMIN_EMAIL.lower().strip())

    role = "admin" if email in admin_emails else "user"

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
        "admin_data": None,
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

    # Prepare base response
    response = {
        "access_token": token,
        "user": {"id": user_id, "name": user["name"], "email": user["email"], "role": role},
        "admin_data": None,
    }

    # If admin, fetch all users and their blogs
    if role == "admin":
        from app.models.db import blogs_col
        
        # Fetch all users
        all_users = await users_col.find({}, {"password_hash": 0}).to_list(length=None)
        
        users_with_blogs = []
        
        for u in all_users:
            uid = str(u["_id"])
            
            # Fetch all blogs for this user
            user_blogs = await blogs_col.find({"owner_id": uid}).to_list(length=None)
            
            # Count blogs by status
            blog_counts = {
                "saved": 0,
                "pending": 0,
                "published": 0,
                "rejected": 0,
            }
            
            blogs_list = []
            
            for blog in user_blogs:
                status = blog.get("status", "saved")
                blog_counts[status] = blog_counts.get(status, 0) + 1
                
                blogs_list.append({
                    "id": str(blog["_id"]),
                    "title": blog.get("meta", {}).get("title", ""),
                    "status": status,
                    "created_at": blog.get("created_at"),
                    "published_at": blog.get("published_at"),
                })
            
            users_with_blogs.append({
                "id": uid,
                "name": u.get("name"),
                "email": u.get("email"),
                "role": u.get("role", "user"),
                "created_at": u.get("created_at"),
                "last_login_at": u.get("last_login_at"),
                "blog_counts": blog_counts,
                "blogs": blogs_list,
            })
        
        response["admin_data"] = {"users": users_with_blogs}

    return response