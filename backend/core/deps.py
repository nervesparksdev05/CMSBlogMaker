from fastapi import Header, HTTPException, Depends
from bson import ObjectId

from core.config import settings
from app.models.db import users_col
from core.verify import decode_token

def oid(s: str) -> ObjectId:
    try:
        return ObjectId(s)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")

async def get_current_user(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.replace("Bearer ", "").strip()
    payload = decode_token(token, settings.JWT_SECRET)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    u = await users_col.find_one({"_id": oid(payload["sub"])})
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
