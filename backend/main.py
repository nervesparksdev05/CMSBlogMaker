from contextlib import asynccontextmanager
import os
import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from core.config import settings
from app.models.db import init_indexes
from app.routers import auth, ai, blogs, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_indexes()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan,
)

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists with absolute path
BASE_DIR = Path(__file__).parent.resolve()
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# Log the uploads directory path for debugging
logger = logging.getLogger(__name__)
logger.info(f"Uploads directory: {UPLOADS_DIR}")
logger.info(f"Uploads directory exists: {UPLOADS_DIR.exists()}")

# Mount static files with absolute path
# IMPORTANT: Mounts must be added BEFORE routers to ensure they're checked first
try:
    static_files = StaticFiles(directory=str(UPLOADS_DIR), check_dir=True)
    app.mount("/uploads", static_files, name="uploads")
    logger.info(f"Static files mounted at /uploads from {UPLOADS_DIR}")
except Exception as e:
    logger.error(f"Failed to mount static files: {e}")
    raise

# Add explicit route handler as fallback (routes are checked before mounts in FastAPI)
@app.get("/uploads/{filename:path}")
async def serve_uploaded_file(filename: str):
    """Fallback route handler for uploaded files - ensures files are served correctly"""
    file_path = UPLOADS_DIR / filename
    # Security check: ensure file is within uploads directory (prevent path traversal)
    try:
        file_path.resolve().relative_to(UPLOADS_DIR.resolve())
    except ValueError:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if file_path.exists() and file_path.is_file():
        return FileResponse(
            str(file_path),
            media_type="image/png" if filename.endswith(".png") else None
        )
    raise HTTPException(status_code=404, detail=f"File not found: {filename}")

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])
app.include_router(blogs.router, tags=["blogs"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
