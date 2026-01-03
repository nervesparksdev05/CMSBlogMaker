from fastapi import APIRouter, Depends, Query

from app.models.db import images_col
from core.deps import get_current_user

router = APIRouter()


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
    total = await images_col.count_documents(q)

    cursor = images_col.find(q).sort("created_at", -1).skip(skip).limit(limit)
    items = []
    async for img in cursor:
        items.append(
            {
                "id": str(img["_id"]),
                "image_url": img.get("image_url", ""),
                "meta": img.get("meta", {}),
                "source": img.get("source", None),
                "created_at": img.get("created_at"),
            }
        )

    return {"items": items, "page": page, "limit": limit, "total": total}
