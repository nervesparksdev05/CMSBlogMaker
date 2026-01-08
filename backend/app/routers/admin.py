from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from app.models.firestore_db import query_blogs, count_blogs, get_blog_by_id, update_blog
from core.deps import require_admin

router = APIRouter()

@router.get("/blogs", response_model=dict)
async def list_blogs_for_admin(
    admin=Depends(require_admin),
    status: str = Query(default="pending"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=5, le=50),
):
    skip = (page - 1) * limit
    q = {"status": status}
    total = count_blogs(q)

    blogs = query_blogs(q, order_by="created_at", order_direction="DESCENDING", skip=skip, limit=limit)
    items = []
    for b in blogs:
        items.append({
            "id": b.get("id", ""),
            "title": (b.get("meta") or {}).get("title","") or (b.get("final_blog") or {}).get("render", {}).get("title",""),
            "created_by": b.get("owner_name", ""),
            "created_at": b.get("created_at"),
            "status": b.get("status", ""),
        })
    return {"items": items, "page": page, "limit": limit, "total": total}

@router.post("/blogs/{blog_id}/approve", response_model=dict)
async def approve_blog(blog_id: str, admin=Depends(require_admin)):
    b = get_blog_by_id(blog_id)
    if not b:
        raise HTTPException(status_code=404, detail="Blog not found")

    updates = {
        "status": "published",
        "updated_at": datetime.utcnow(),
        "published_at": datetime.utcnow(),
        "admin_review.reviewed_at": datetime.utcnow(),
        "admin_review.reviewed_by": admin["id"],
        "admin_review.reviewed_by_name": admin["name"],
    }
    update_blog(blog_id, updates)
    return {"ok": True, "status": "published"}

@router.post("/blogs/{blog_id}/reject", response_model=dict)
async def reject_blog(blog_id: str, feedback: str = "", admin=Depends(require_admin)):
    b = get_blog_by_id(blog_id)
    if not b:
        raise HTTPException(status_code=404, detail="Blog not found")

    updates = {
        "status": "rejected",
        "updated_at": datetime.utcnow(),
        "admin_review.reviewed_at": datetime.utcnow(),
        "admin_review.reviewed_by": admin["id"],
        "admin_review.reviewed_by_name": admin["name"],
        "admin_review.feedback": feedback or "",
    }
    update_blog(blog_id, updates)
    return {"ok": True, "status": "rejected"}
