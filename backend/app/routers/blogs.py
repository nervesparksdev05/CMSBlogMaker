import os
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query

from app.models.firestore_db import (
    create_blog, get_blog_by_id, update_blog, delete_blog,
    query_blogs, count_blogs, create_image
)
from core.deps import get_current_user, require_admin
from app.models.schemas import BlogCreateIn, BlogOut
from app.services.image_service import upload_bytes_to_gcs

router = APIRouter()


# ---------------- save ----------------
@router.post("/blog", response_model=dict)  # POST /blog
async def save_blog(payload: BlogCreateIn, user=Depends(get_current_user)):
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

    blog_id = create_blog(doc)
    return {"blog_id": blog_id, "status": "saved"}

# ---------------- LIST (MY BLOGS) ----------------
@router.get("/blog", response_model=dict)  # GET /blogs?page=1&limit=10
async def list_my_blogs(
    user=Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=5, le=50),
):
    skip = (page - 1) * limit
    q = {"owner_id": user["id"]}
    total = count_blogs(q)

    blogs = query_blogs(q, order_by="created_at", order_direction="DESCENDING", skip=skip, limit=limit)
    items = []
    for b in blogs:
        items.append(
            {
                "id": b.get("id", ""),
                "title": (b.get("meta") or {}).get("title", "")
                or (b.get("final_blog") or {}).get("render", {}).get("title", ""),
                "language": (b.get("meta") or {}).get("language", "English"),
                "tone": (b.get("meta") or {}).get("tone", ""),
                "creativity": (b.get("meta") or {}).get("creativity", ""),
                "created_by": b.get("owner_name", ""),
                "created_at": b.get("created_at"),
                "status": b.get("status", "saved"),
            }
        )

    return {"items": items, "page": page, "limit": limit, "total": total}


# ---------------- STATS ----------------
@router.get("/blogs/stats", response_model=dict)  # GET /blogs/stats
async def blog_stats(user=Depends(get_current_user)):
    from app.models.firestore_db import count_images, query_images
    
    q_owner = {"owner_id": user["id"]}

    total = count_blogs(q_owner)
    saved = count_blogs({**q_owner, "status": "saved"})
    pending = count_blogs({**q_owner, "status": "pending"})
    published = count_blogs({**q_owner, "status": "published"})
    
    # Count images with $or condition
    images = count_images(
        {
            "owner_id": user["id"],
            "$or": [
                {"source": {"$in": ["nano", "blog"]}},
                {"source": {"$exists": False}},
                {"source": None},
            ],
        }
    )

    return {
        "total_blogs": total,
        "saved_blogs": saved,
        "pending_blogs": pending,
        "published_blogs": published,
        "generated_images": images,
    }


# ---------------- UPLOADS ----------------
@router.post("/blogs/uploads/images", response_model=dict)  # POST /blogs/uploads/images
async def upload_image(file: UploadFile = File(...), user=Depends(get_current_user)):
    data = await file.read()
    ext = os.path.splitext(file.filename or "")[-1].lower()
    if not ext:
        ct = (file.content_type or "").lower()
        if "png" in ct:
            ext = ".png"
        elif "jpeg" in ct or "jpg" in ct:
            ext = ".jpg"
        elif "webp" in ct:
            ext = ".webp"
        elif "gif" in ct:
            ext = ".gif"
        elif "bmp" in ct:
            ext = ".bmp"
        else:
            ext = ".png"

    filename = f"{uuid.uuid4().hex}{ext}"
    image_url = upload_bytes_to_gcs(data, filename, file.content_type or None)
    create_image(
        {
            "owner_id": user["id"],
            "owner_name": user.get("name", ""),
            "image_url": image_url,
            "meta": {
                "filename": file.filename or filename,
                "content_type": file.content_type or "",
                "size": len(data),
            },
            "source": "upload",
            "created_at": datetime.utcnow(),
        }
    )
    return {"image_url": image_url}


# ---------------- BLOG BY ID ---------------- 
@router.get("/blogs/{blog_id}", response_model=BlogOut)  # GET /blogs/{blog_id}
async def get_blog(blog_id: str, user=Depends(get_current_user)):
    b = get_blog_by_id(blog_id)
    if not b:
        raise HTTPException(status_code=404, detail="Blog not found")
    if b.get("owner_id") != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not allowed")

    # Ensure 'id' field is present (BlogOut schema requires it)
    if "id" not in b:
        b["id"] = blog_id
    
    return b


# ---------------- DELETE BLOG ----------------
@router.delete("/blogs/{blog_id}", response_model=dict)
async def delete_blog_route(blog_id: str, user=Depends(get_current_user)):
    b = get_blog_by_id(blog_id)
    if not b:
        raise HTTPException(status_code=404, detail="Blog not found")
    if b.get("owner_id") != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not allowed")

    delete_blog(blog_id)
    return {"ok": True}


# ---------------- UPDATE BLOG ----------------
@router.put("/blogs/{blog_id}", response_model=dict)
async def update_blog_route(blog_id: str, payload: BlogCreateIn, user=Depends(get_current_user)):
    b = get_blog_by_id(blog_id)
    if not b:
        raise HTTPException(status_code=404, detail="Blog not found")
    if b.get("owner_id") != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not allowed")

    updates = {
        "meta": payload.meta.model_dump(),
        "final_blog": payload.final_blog.model_dump(),
        "updated_at": datetime.utcnow(),
    }
    update_blog(blog_id, updates)
    return {"ok": True, "blog_id": blog_id}


# ---------------- PUBLISH REQUEST ---------------- 
@router.post("/blogs/{blog_id}/publish-request", response_model=dict)  # POST /blogs/{blog_id}/publish-request
async def request_publish(
    blog_id: str, 
    payload: BlogCreateIn,  # Accept blog content to save when clicking publish
    user=Depends(get_current_user)
):
    """
    Save blog content and request publish approval.
    This endpoint saves the blog content (if provided) and changes status to 'pending' for admin review.
    The blog content is saved when user clicks publish to ensure latest content is submitted.
    """
    b = get_blog_by_id(blog_id)
    if not b:
        raise HTTPException(status_code=404, detail="Blog not found")
    if b.get("owner_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Not allowed")

    if b.get("status") == "published":
        raise HTTPException(status_code=400, detail="Already published")

    # Save/update the blog content and request publish
    # This ensures the latest content is saved when user clicks publish
    updates = {
        "meta": payload.meta.model_dump(),
        "final_blog": payload.final_blog.model_dump(),
        "status": "pending",
        "updated_at": datetime.utcnow(),
        "admin_review.requested_at": datetime.utcnow(),
        "admin_review.feedback": "",
    }
    update_blog(blog_id, updates)
    return {"ok": True, "status": "pending", "blog_id": blog_id}


# ---------------- ADMIN: LIST PENDING BLOGS ---------------- 
@router.get("/admin/blogs/pending", response_model=dict)  # GET /admin/blogs/pending?page=1&limit=10
async def list_pending_blogs(
    admin=Depends(require_admin),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=5, le=50),
):
    """List all blogs pending admin approval"""
    skip = (page - 1) * limit
    q = {"status": "pending"}
    total = count_blogs(q)

    blogs = query_blogs(q, order_by="admin_review.requested_at", order_direction="DESCENDING", skip=skip, limit=limit)
    items = []
    for b in blogs:
        items.append(
            {
                "id": b.get("id", ""),
                "title": (b.get("meta") or {}).get("title", "")
                or (b.get("final_blog") or {}).get("render", {}).get("title", ""),
                "language": (b.get("meta") or {}).get("language", "English"),
                "tone": (b.get("meta") or {}).get("tone", ""),
                "creativity": (b.get("meta") or {}).get("creativity", ""),
                "created_by": b.get("owner_name", ""),
                "owner_id": b.get("owner_id", ""),
                "created_at": b.get("created_at"),
                "requested_at": (b.get("admin_review") or {}).get("requested_at"),
                "status": b.get("status", "pending"),
            }
        )

    return {"items": items, "page": page, "limit": limit, "total": total}


# ---------------- ADMIN: APPROVE BLOG ---------------- 
@router.post("/admin/blogs/{blog_id}/approve", response_model=dict)  # POST /admin/blogs/{blog_id}/approve
async def approve_blog(blog_id: str, admin=Depends(require_admin)):
    """Approve a blog for publishing"""
    b = get_blog_by_id(blog_id)
    if not b:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    if b.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Blog is not pending approval")

    now = datetime.utcnow()
    updates = {
        "status": "published",
        "updated_at": now,
        "published_at": now,
        "admin_review.reviewed_at": now,
        "admin_review.reviewed_by": admin["id"],
        "admin_review.reviewed_by_name": admin["name"],
        "admin_review.feedback": "",
    }
    update_blog(blog_id, updates)
    return {"ok": True, "status": "published"}


# ---------------- ADMIN: REJECT BLOG ---------------- 
@router.post("/admin/blogs/{blog_id}/reject", response_model=dict)  # POST /admin/blogs/{blog_id}/reject
async def reject_blog(
    blog_id: str,
    feedback: str = Query("", description="Rejection feedback for the author"),
    admin=Depends(require_admin),
):
    """Reject a blog and return it to saved status with feedback"""
    b = get_blog_by_id(blog_id)
    if not b:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    if b.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Blog is not pending approval")

    now = datetime.utcnow()
    updates = {
        "status": "saved",
        "updated_at": now,
        "admin_review.reviewed_at": now,
        "admin_review.reviewed_by": admin["id"],
        "admin_review.reviewed_by_name": admin["name"],
        "admin_review.feedback": feedback or "Blog rejected. Please review and resubmit.",
    }
    update_blog(blog_id, updates)
    return {"ok": True, "status": "saved", "feedback": feedback}
