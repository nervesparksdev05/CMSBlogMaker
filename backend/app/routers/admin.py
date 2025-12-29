from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from app.db import blogs_col
from app.deps import require_admin, oid

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
    total = await blogs_col.count_documents(q)

    cursor = blogs_col.find(q).sort("created_at", -1).skip(skip).limit(limit)
    items = []
    async for b in cursor:
        items.append({
            "id": str(b["_id"]),
            "title": (b.get("meta") or {}).get("title","") or (b.get("final_blog") or {}).get("render", {}).get("title",""),
            "created_by": b.get("owner_name", ""),
            "created_at": b.get("created_at"),
            "status": b.get("status", ""),
        })
    return {"items": items, "page": page, "limit": limit, "total": total}

@router.post("/blogs/{blog_id}/approve", response_model=dict)
async def approve_blog(blog_id: str, admin=Depends(require_admin)):
    b = await blogs_col.find_one({"_id": oid(blog_id)})
    if not b:
        raise HTTPException(status_code=404, detail="Blog not found")

    await blogs_col.update_one(
        {"_id": oid(blog_id)},
        {"$set": {
            "status": "published",
            "updated_at": datetime.utcnow(),
            "published_at": datetime.utcnow(),
            "admin_review.reviewed_at": datetime.utcnow(),
            "admin_review.reviewed_by": admin["id"],
            "admin_review.reviewed_by_name": admin["name"],
        }}
    )
    return {"ok": True, "status": "published"}

@router.post("/blogs/{blog_id}/reject", response_model=dict)
async def reject_blog(blog_id: str, feedback: str = "", admin=Depends(require_admin)):
    b = await blogs_col.find_one({"_id": oid(blog_id)})
    if not b:
        raise HTTPException(status_code=404, detail="Blog not found")

    await blogs_col.update_one(
        {"_id": oid(blog_id)},
        {"$set": {
            "status": "rejected",
            "updated_at": datetime.utcnow(),
            "admin_review.reviewed_at": datetime.utcnow(),
            "admin_review.reviewed_by": admin["id"],
            "admin_review.reviewed_by_name": admin["name"],
            "admin_review.feedback": feedback or "",
        }}
    )
    return {"ok": True, "status": "rejected"}
