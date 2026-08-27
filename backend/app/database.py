import os
from motor.motor_asyncio import AsyncIOMotorClient

# Read environment variables (supports MongoDB Atlas and local development)
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "seat_booking")

# Initialize Motor Async Client
client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

# FastAPI Dependency
def get_database():
    return db