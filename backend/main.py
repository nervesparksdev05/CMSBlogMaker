from contextlib import asynccontextmanager
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from core.config import settings
from app.routers import auth, ai, blogs, admin, images


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Firestore connection is initialized on first use via get_db().
    """
    yield


# Create the main API application
api_app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan,
)

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
api_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
api_app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@api_app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "cms-backend"}


api_app.include_router(auth.router, prefix="/auth", tags=["auth"])
api_app.include_router(ai.router, prefix="/ai", tags=["ai"])
api_app.include_router(blogs.router, tags=["blogs"])
api_app.include_router(images.router, tags=["images"])
api_app.include_router(admin.router, prefix="/admin", tags=["admin"])

# Create root app and mount API at /cms-backend
app = FastAPI()
app.mount("/cms-backend", api_app)
