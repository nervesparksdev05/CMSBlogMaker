from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
from core.config import settings

client = AsyncIOMotorClient(settings.MONGODB_URI)
db = client[settings.MONGODB_DB]
users_col = db["users"]
blogs_col = db["blogs"]

async def init_indexes():
    # users
    await users_col.create_index([("email", ASCENDING)], unique=True)

    # blogs
    await blogs_col.create_index([("owner_id", ASCENDING), ("created_at", DESCENDING)])
    await blogs_col.create_index([("status", ASCENDING), ("created_at", DESCENDING)])
    
