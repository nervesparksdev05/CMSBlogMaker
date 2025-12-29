import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from app.db import blogs_col
from app.deps import get_current_user, oid
from app.schemas import BlogCreateIn, BlogOut, BlogListItem
from app.config import settings

router = APIRouter()

@router.post("", response_model=dict)
async def create_blog(payload: BlogCreateIn, user=Depends(get_current_user)):
    now = datetime.utcnow()
    doc = {
        "owner_id": user["id"],
        "owner_name": user["name"],
        "status": "saved",
        "meta": payload.meta.model_dump(),
        "final_blog": payload.final_blog.model_dump(),
        "admin_review": {
            "requested_at": None,
            "reviewed_at": None,
            "reviewed_by": None,
            "reviewed_by_name": None,
            "feedback": "",
        },
        "created_at": now,
        "updated_at": now,
        "published_at": None,
    }
    res = await blogs_col.insert_one(doc)
    return {"blog_id": str(res.inserted_id), "status": "saved"}

@router.get("/mine", response_model=dict)
async def my_blogs(
    user=Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=5, le=50),
):
    skip = (page - 1) * limit
    q = {"owner_id": user["id"]}
    total = await blogs_col.count_documents(q)

    cursor = blogs_col.find(q).sort("created_at", -1).skip(skip).limit(limit)
    items = []
    async for b in cursor:
        items.append({
            "id": str(b["_id"]),
            "title": (b.get("meta") or {}).get("title", "") or (b.get("final_blog") or {}).get("render", {}).get("title",""),
            "created_by": b.get("owner_name", ""),
            "created_at": b.get("created_at"),
            "status": b.get("status", "saved"),
        })

    return {"items": items, "page": page, "limit": limit, "total": total}

@router.get("/{blog_id}", response_model=BlogOut)
async def get_blog(blog_id: str, user=Depends(get_current_user)):
    b = await blogs_col.find_one({"_id": oid(blog_id)})
    if not b:
        raise HTTPException(status_code=404, detail="Blog not found")
    if b["owner_id"] != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not allowed")

    b["id"] = str(b["_id"])
    b.pop("_id", None)
    return b

@router.post("/{blog_id}/request-publish", response_model=dict)
async def request_publish(blog_id: str, user=Depends(get_current_user)):
    b = await blogs_col.find_one({"_id": oid(blog_id)})
    if not b:
        raise HTTPException(status_code=404, detail="Blog not found")
    if b["owner_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not allowed")

    if b.get("status") == "published":
        raise HTTPException(status_code=400, detail="Already published")

    await blogs_col.update_one(
        {"_id": oid(blog_id)},
        {"$set": {
            "status": "pending",
            "updated_at": datetime.utcnow(),
            "admin_review.requested_at": datetime.utcnow(),
            "admin_review.feedback": "",
        }}
    )
    return {"ok": True, "status": "pending"}

@router.get("/dashboard/stats", response_model=dict)
async def dashboard_stats(user=Depends(get_current_user)):
    q_owner = {"owner_id": user["id"]}

    total = await blogs_col.count_documents(q_owner)
    saved = await blogs_col.count_documents({**q_owner, "status": "saved"})
    pending = await blogs_col.count_documents({**q_owner, "status": "pending"})
    published = await blogs_col.count_documents({**q_owner, "status": "published"})
    images = await blogs_col.count_documents({**q_owner, "meta.cover_image_url": {"$ne": ""}})

    return {
        "total_blogs": total,
        "saved_blogs": saved,
        "pending_blogs": pending,
        "published_blogs": published,
        "generated_images": images,
    }

@router.post("/upload/image", response_model=dict)
async def upload_image(file: UploadFile = File(...), user=Depends(get_current_user)):
    os.makedirs("uploads", exist_ok=True)
    ext = os.path.splitext(file.filename or "")[-1].lower() or ".png"
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join("uploads", filename)
    data = await file.read()
    with open(path, "wb") as f:
        f.write(data)
    return {"image_url": f"{settings.PUBLIC_BASE_URL}/uploads/{filename}"}
