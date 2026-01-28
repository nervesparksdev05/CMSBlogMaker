from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException

from app.models.firestore_db import create_image, get_image_by_url, query_images, count_images
from app.models.schemas import ImageSaveIn
from core.deps import get_current_user

router = APIRouter()

@router.post("/images/save", response_model=dict)
async def save_image(payload: ImageSaveIn, user=Depends(get_current_user)):
    doc = {
        "owner_id": user["id"],
        "owner_name": user.get("name", ""),
        "image_url": payload.image_url,
        "meta": payload.meta or {},
        "source": payload.source,
        "created_at": datetime.utcnow(),
    }

    existing = get_image_by_url(user["id"], payload.image_url)
    if not existing:
        create_image(doc)

    return {"image_url": payload.image_url, "meta": payload.meta or {}}

@router.delete("/images/{image_id}", response_model=dict)
async def delete_image(image_id: str, user=Depends(get_current_user)):
    """Delete an image by ID (only if owned by the user)"""
    from app.models.firestore_db import get_images_collection
    
    images_col = get_images_collection()
    doc_ref = images_col.document(image_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Image not found")
    
    image_data = doc.to_dict()
    if image_data.get("owner_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Not allowed to delete this image")
    
    doc_ref.delete()
    return {"ok": True, "image_id": image_id}

@router.get("/images", response_model=dict)
async def list_images(
    user=Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=100),
    source: str | None = Query(None),
):
    skip = (page - 1) * limit
    q = {"owner_id": user["id"]}
    if source:
        if source == "ai":
            q["$or"] = [
                {"source": {"$in": ["nano", "blog"]}},
                {"source": {"$exists": False}},
                {"source": None},
            ]
        elif source == "nano":
            q["$or"] = [
                {"source": "nano"},
                {"source": {"$exists": False}},
                {"source": None},
            ]
        else:
            q["source"] = source
    
    total = count_images(q)
    images = query_images(q, order_by="created_at", order_direction="DESCENDING", skip=skip, limit=limit)
    
    items = []
    for img in images:
        items.append(
            {
                "id": img.get("id", ""),
                "image_url": img.get("image_url", ""),
                "meta": img.get("meta", {}),
                "source": img.get("source", None),
                "created_at": img.get("created_at"),
            }
        )

    return {"items": items, "page": page, "limit": limit, "total": total}
