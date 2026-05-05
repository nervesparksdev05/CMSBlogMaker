import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, func

from core.deps import get_current_user, require_admin
from core.database import get_db
from core.models import BlogPost, ImageAsset
from app.models.schemas import BlogCreateIn, BlogOut, BlogCommentIn
from app.services.image_service import upload_bytes_to_gcs

router = APIRouter()

def _parse_id(item_id: str) -> int:
    try:
        return int(item_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format.")


def _map_blog_for_list(b: BlogPost) -> dict:
    content = b.content_blocks or {}
    meta = content.get("meta", {})
    admin_review = content.get("admin_review", {})
    
    return {
        "id": str(b.id),
        "title": b.title,
        "language": meta.get("language", "English"),
        "tone": meta.get("tone", ""),
        "creativity": meta.get("creativity", ""),
        "created_by": b.author_name,
        "owner_id": b.author_id,
        "created_at": b.created_at,
        "requested_at": admin_review.get("requested_at"),
        "published_at": admin_review.get("reviewed_at") if b.status == "published" else None,
        "reviewed_at": admin_review.get("reviewed_at"),
        "reviewed_by": admin_review.get("reviewed_by_name"),
        "status": b.status,
    }

def _map_blog_detail(b: BlogPost) -> dict:
    content = b.content_blocks or {}
    return {
        "id": str(b.id),
        "owner_id": b.author_id,
        "owner_name": b.author_name,
        "status": b.status,
        "meta": content.get("meta", {}),
        "final_blog": content.get("final_blog", {}),
        "admin_review": content.get("admin_review", {}),
        "created_at": b.created_at,
        "updated_at": b.updated_at,
        "published_at": content.get("admin_review", {}).get("reviewed_at") if b.status == "published" else None
    }


@router.post("/blog", response_model=dict)
async def save_blog(payload: BlogCreateIn, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    meta_dict = payload.meta.model_dump()
    final_blog_dict = payload.final_blog.model_dump()
    
    title = meta_dict.get("title") or final_blog_dict.get("render", {}).get("title", "Untitled")
    
    content_blocks = {
        "meta": meta_dict,
        "final_blog": final_blog_dict,
        "admin_review": {
            "requested_at": None,
            "reviewed_at": None,
            "reviewed_by": None,
            "reviewed_by_name": None,
            "feedback": "",
        }
    }

    db_blog = BlogPost(
        tenant_id=user.get("tenant_id", "default"),
        author_id=user.get("id"),
        author_name=user.get("name", ""),
        title=title,
        content_blocks=content_blocks,
        status="saved"
    )
    
    db.add(db_blog)
    db.commit()
    db.refresh(db_blog)
    
    return {"blog_id": str(db_blog.id), "status": "saved"}


@router.get("/blog", response_model=dict)
async def list_my_blogs(
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=5, le=50),
    search: str = Query("", description="Search query filter"),
):
    skip = (page - 1) * limit
    query = db.query(BlogPost).filter(BlogPost.author_id == user["id"])
    
    if search.strip():
        search_term = f"%{search.strip().lower()}%"
        query = query.filter(func.lower(BlogPost.title).ilike(search_term))
        
    total = query.count()
    blogs = query.order_by(desc(BlogPost.created_at)).offset(skip).limit(limit).all()
    
    items = [_map_blog_for_list(b) for b in blogs]
    return {"items": items, "page": page, "limit": limit, "total": total}


@router.get("/blogs/stats", response_model=dict)
async def blog_stats(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    base_query = db.query(BlogPost).filter(BlogPost.author_id == user["id"])
    
    total = base_query.count()
    saved = base_query.filter(BlogPost.status == "saved").count()
    pending = base_query.filter(BlogPost.status == "pending").count()
    published = base_query.filter(BlogPost.status == "published").count()
    
    images_count = db.query(ImageAsset).filter(
        ImageAsset.owner_id == user["id"],
        or_(
            ImageAsset.source.in_(["nano", "blog"]),
            ImageAsset.source.is_(None)
        )
    ).count()

    return {
        "total_blogs": total,
        "saved_blogs": saved,
        "pending_blogs": pending,
        "published_blogs": published,
        "generated_images": images_count,
    }


@router.post("/blogs/uploads/images", response_model=dict)
async def upload_image(file: UploadFile = File(...), user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    data = await file.read()
    ext = os.path.splitext(file.filename or "")[-1].lower()
    if not ext:
        ext = ".png"

    filename = f"{uuid.uuid4().hex}{ext}"
    image_url = upload_bytes_to_gcs(data, filename, file.content_type or None)
    
    db_image = ImageAsset(
        owner_id=user["id"],
        owner_name=user.get("name", ""),
        image_url=image_url,
        source="upload",
        meta_data={
            "filename": file.filename or filename,
            "content_type": file.content_type or "",
            "size": len(data),
        }
    )
    db.add(db_image)
    db.commit()
    
    return {"image_url": image_url}


@router.get("/blogs/{blog_id}")
async def get_blog(blog_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    b_id = _parse_id(blog_id)
    b = db.query(BlogPost).filter(BlogPost.id == b_id).first()
    
    if not b:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    if b.author_id != user["id"]:
        if user.get("role") != "admin" or b.tenant_id != user.get("tenant_id"):
            raise HTTPException(status_code=403, detail="Not allowed")

    return _map_blog_detail(b)


@router.delete("/blogs/{blog_id}", response_model=dict)
async def delete_blog_route(blog_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    b_id = _parse_id(blog_id)
    b = db.query(BlogPost).filter(BlogPost.id == b_id).first()
    
    if not b:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    if b.author_id != user["id"]:
        if user.get("role") != "admin" or b.tenant_id != user.get("tenant_id"):
            raise HTTPException(status_code=403, detail="Not allowed")

    db.delete(b)
    db.commit()
    return {"ok": True}


@router.put("/blogs/{blog_id}", response_model=dict)
async def update_blog_route(blog_id: str, payload: BlogCreateIn, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    b_id = _parse_id(blog_id)
    b = db.query(BlogPost).filter(BlogPost.id == b_id).first()
    
    if not b:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    if b.author_id != user["id"]:
        if user.get("role") != "admin" or b.tenant_id != user.get("tenant_id"):
            raise HTTPException(status_code=403, detail="Not allowed")

    content = b.content_blocks or {}
    content["meta"] = payload.meta.model_dump()
    content["final_blog"] = payload.final_blog.model_dump()
    
    b.content_blocks = content
    b.title = content["meta"].get("title") or content["final_blog"].get("render", {}).get("title", "Untitled")
    
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(b, "content_blocks")
    
    db.commit()
    return {"ok": True, "blog_id": blog_id}


@router.post("/blogs/{blog_id}/publish-request", response_model=dict)
async def request_publish(blog_id: str, payload: BlogCreateIn, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    b_id = _parse_id(blog_id)
    b = db.query(BlogPost).filter(BlogPost.id == b_id).first()
    
    if not b:
        raise HTTPException(status_code=404, detail="Blog not found")
    if b.author_id != user["id"]:
        raise HTTPException(status_code=403, detail="Not allowed")
    if b.status == "published":
        raise HTTPException(status_code=400, detail="Already published")

    content = b.content_blocks or {}
    content["meta"] = payload.meta.model_dump()
    content["final_blog"] = payload.final_blog.model_dump()
    
    admin_review = content.get("admin_review", {})
    admin_review["requested_at"] = datetime.now(timezone.utc).isoformat()
    admin_review["feedback"] = ""
    content["admin_review"] = admin_review

    b.content_blocks = content
    b.status = "pending"
    b.title = content["meta"].get("title") or content["final_blog"].get("render", {}).get("title", "Untitled")
    
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(b, "content_blocks")
    
    db.commit()
    return {"ok": True, "status": "pending", "blog_id": blog_id}

# ==========================================
#  ADMIN ROUTES (FIXED)
# ==========================================

@router.get("/admin/blogs/pending", response_model=dict)
async def list_pending_blogs(admin: dict = Depends(require_admin), db: Session = Depends(get_db), page: int = Query(1, ge=1), limit: int = Query(10, ge=5, le=50)):
    skip = (page - 1) * limit
    
    #  FIX: Now captures 'saved', 'draft', AND 'pending' blogs 
    query = db.query(BlogPost).filter(
        BlogPost.status.in_(["saved", "draft", "pending"]),
        BlogPost.tenant_id == admin.get("tenant_id")
    )
    
    total = query.count()
    blogs = query.order_by(desc(BlogPost.updated_at)).offset(skip).limit(limit).all()
    
    items = [_map_blog_for_list(b) for b in blogs]
    return {"items": items, "page": page, "limit": limit, "total": total}


@router.get("/admin/blogs/published", response_model=dict)
async def list_published_blogs(admin: dict = Depends(require_admin), db: Session = Depends(get_db), page: int = Query(1, ge=1), limit: int = Query(10, ge=5, le=50)):
    skip = (page - 1) * limit
    
    query = db.query(BlogPost).filter(
        BlogPost.status.in_(["published", "approved"]),
        BlogPost.tenant_id == admin.get("tenant_id")
    )
    
    total = query.count()
    blogs = query.order_by(desc(BlogPost.updated_at)).offset(skip).limit(limit).all()
    
    items = [_map_blog_for_list(b) for b in blogs]
    return {"items": items, "page": page, "limit": limit, "total": total}


@router.post("/admin/blogs/{blog_id}/approve", response_model=dict)
async def approve_blog(blog_id: str, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    b_id = _parse_id(blog_id)
    b = db.query(BlogPost).filter(BlogPost.id == b_id).first()
    
    if not b:
        raise HTTPException(status_code=404, detail="Blog not found")
    if b.tenant_id != admin.get("tenant_id"):
        raise HTTPException(status_code=403, detail="Cross-tenant access forbidden")
        
    # Allow approving 'saved' blogs directly from the dashboard without erroring
    if b.status not in ["pending", "saved", "draft"]:
        raise HTTPException(status_code=400, detail="Blog is not in a pending or saved state")

    content = b.content_blocks or {}
    admin_review = content.get("admin_review", {})
    
    now_iso = datetime.now(timezone.utc).isoformat()
    admin_review["reviewed_at"] = now_iso
    admin_review["reviewed_by"] = admin["id"]
    admin_review["reviewed_by_name"] = admin["name"]
    admin_review["feedback"] = ""
    
    content["admin_review"] = admin_review
    b.content_blocks = content
    b.status = "published"
    
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(b, "content_blocks")
    
    db.commit()
    return {"ok": True, "status": "published"}


@router.post("/admin/blogs/{blog_id}/reject", response_model=dict)
async def reject_blog(blog_id: str, feedback: str = Query("", description="Rejection feedback"), admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    b_id = _parse_id(blog_id)
    b = db.query(BlogPost).filter(BlogPost.id == b_id).first()
    
    if not b:
        raise HTTPException(status_code=404, detail="Blog not found")
    if b.tenant_id != admin.get("tenant_id"):
        raise HTTPException(status_code=403, detail="Cross-tenant access forbidden")
        
    # 🚨 FIX: Allow rejecting 'saved' blogs directly
    if b.status not in ["pending", "saved", "draft"]:
        raise HTTPException(status_code=400, detail="Blog is not in a pending or saved state")

    content = b.content_blocks or {}
    admin_review = content.get("admin_review", {})
    
    admin_review["reviewed_at"] = datetime.now(timezone.utc).isoformat()
    admin_review["reviewed_by"] = admin["id"]
    admin_review["reviewed_by_name"] = admin["name"]
    admin_review["feedback"] = feedback or "Blog rejected. Please review and resubmit."
    
    content["admin_review"] = admin_review
    b.content_blocks = content
    b.status = "saved"
    
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(b, "content_blocks")
    
    db.commit()
    return {"ok": True, "status": "saved", "feedback": feedback}


@router.post("/admin/blogs/{blog_id}/comment", response_model=dict)
async def add_blog_comment(blog_id: str, payload: BlogCommentIn, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    b_id = _parse_id(blog_id)
    b = db.query(BlogPost).filter(BlogPost.id == b_id).first()
    
    if not b:
        raise HTTPException(status_code=404, detail="Blog not found")
    if b.tenant_id != admin.get("tenant_id"):
        raise HTTPException(status_code=403, detail="Cross-tenant access forbidden")

    content = b.content_blocks or {}
    admin_review = content.get("admin_review", {})
    
    existing_feedback = admin_review.get("feedback", "")
    new_feedback = payload.comment.strip()
    
    if existing_feedback and new_feedback:
        timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
        updated_feedback = f"{existing_feedback}\n\n--- {admin.get('name', 'Admin')} ({timestamp}) ---\n{new_feedback}"
    else:
        updated_feedback = new_feedback

    admin_review["feedback"] = updated_feedback
    
    if not admin_review.get("reviewed_by"):
        admin_review["reviewed_by"] = admin["id"]
        admin_review["reviewed_by_name"] = admin["name"]

    content["admin_review"] = admin_review
    b.content_blocks = content
    
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(b, "content_blocks")
    
    db.commit()
    return {"ok": True, "comment": new_feedback}


@router.post("/blogs/{blog_id}/draft", response_model=dict)
async def change_to_draft(blog_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    b_id = _parse_id(blog_id)
    b = db.query(BlogPost).filter(BlogPost.id == b_id).first()
    
    if not b:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    if b.author_id != user["id"]:
        if user.get("role") != "admin" or b.tenant_id != user.get("tenant_id"):
            raise HTTPException(status_code=403, detail="Not allowed")
            
    if b.status != "published":
        raise HTTPException(status_code=400, detail="Blog is not published")

    b.status = "saved"
    db.commit()
    return {"ok": True, "status": "saved"}


@router.get("/public/blogs", response_model=dict)
async def list_public_blogs(page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    skip = (page - 1) * limit
    query = db.query(BlogPost).filter(BlogPost.status == "published")
    
    total = query.count()
    blogs = query.order_by(desc(BlogPost.updated_at)).offset(skip).limit(limit).all()
    
    items = []
    for b in blogs:
        content = b.content_blocks or {}
        meta = content.get("meta", {})
        render = content.get("final_blog", {}).get("render", {})
        
        items.append({
            "id": str(b.id),
            "title": render.get("title", "") or meta.get("title", ""),
            "cover_image_url": render.get("cover_image_url", ""),
            "intro": render.get("intro_md", ""),
            "author": b.author_name,
            "category": meta.get("focus_or_niche", "Technology"),
            "published_at": content.get("admin_review", {}).get("reviewed_at"),
        })

    return {"items": items, "page": page, "limit": limit, "total": total}