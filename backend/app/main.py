from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.database import get_database
from app.schemas import EventCreate, BookingCreate
from app.services import (
    create_event_with_seats, 
    book_seats_atomically, 
    cancel_booking_atomically
)

# 1. Initialize FastAPI app
app = FastAPI(title="Mini-BookMyShow API")

# 2. Add CORS Middleware to allow React frontend (Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Define Endpoints
@app.post("/api/seed", status_code=status.HTTP_201_CREATED)
async def seed_events(db: AsyncIOMotorDatabase = Depends(get_database)):
    await db.events.delete_many({})
    await db.bookings.delete_many({})

    samples = [
        {"title": "Sci-Fi Blockbuster 2026", "date_time": "2026-09-10T19:00:00", "venue": "IMAX Cinema 1", "rows": 5, "seats_per_row": 8},
        {"title": "Live Tech Conference", "date_time": "2026-10-05T09:00:00", "venue": "Grand Hall A", "rows": 4, "seats_per_row": 10},
        {"title": "Stand-up Comedy Night", "date_time": "2026-09-15T21:00:00", "venue": "Club Laughs", "rows": 6, "seats_per_row": 6}
    ]

    for sample in samples:
        await create_event_with_seats(db, sample)
        
    return {"message": "Database successfully seeded with 3 events."}


@app.get("/api/events")
async def list_events(db: AsyncIOMotorDatabase = Depends(get_database)):
    cursor = db.events.find({})
    events = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        events.append(doc)
    return events


@app.post("/api/events", status_code=status.HTTP_201_CREATED)
async def create_event(payload: EventCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    doc = await create_event_with_seats(db, payload.model_dump())
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc


@app.get("/api/events/{event_id}")
async def get_event(event_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    if not ObjectId.is_valid(event_id):
        raise HTTPException(status_code=400, detail="Invalid Event ID format")
    doc = await db.events.find_one({"_id": ObjectId(event_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Event not found")
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc


@app.delete("/api/events/{event_id}")
async def delete_event(event_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    if not ObjectId.is_valid(event_id):
        raise HTTPException(status_code=400, detail="Invalid Event ID format")
    res = await db.events.delete_one({"_id": ObjectId(event_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted successfully"}


@app.post("/api/bookings", status_code=status.HTTP_201_CREATED)
async def create_booking(payload: BookingCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    return await book_seats_atomically(
        db, payload.event_id, payload.seat_ids, payload.user_email, payload.user_name
    )


@app.get("/api/bookings")
async def get_user_bookings(email: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    cursor = db.bookings.find({"user_email": email})
    bookings = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        bookings.append(doc)
    return bookings


@app.post("/api/bookings/{booking_id}/cancel")
async def cancel_booking(booking_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid Booking ID format")
    return await cancel_booking_atomically(db, booking_id)


@app.get("/api/admin/stats")
async def get_admin_stats(db: AsyncIOMotorDatabase = Depends(get_database)):
    cursor = db.events.find({})
    stats = []
    async for doc in cursor:
        total = len(doc.get("seats", []))
        booked = sum(1 for s in doc.get("seats", []) if s.get("status") == "booked")
        stats.append({
            "event_id": str(doc["_id"]),
            "title": doc.get("title", "Untitled"),
            "total_seats": total,
            "booked_seats": booked,
            "available_seats": total - booked,
            "occupancy": f"{(booked / total) * 100:.1f}%" if total > 0 else "0.0%"
        })
    return stats