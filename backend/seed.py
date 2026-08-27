import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://localhost:27017"

async def seed():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.seat_booking_db

    # Clear existing data
    await db.events.delete_many({})
    await db.bookings.delete_many({})

    # Seed events
    events = [
        {
            "title": "Sci-Fi Blockbuster 2026",
            "date_time": "2026-09-10T19:00:00",
            "venue": "IMAX Cinema 1",
            "rows": 5,
            "seats_per_row": 8,
            "seats": [
                {"seat_id": f"{chr(65+r)}{s+1}", "status": "available"}
                for r in range(5) for s in range(8)
            ]
        },
        {
            "title": "Live Tech Conference",
            "date_time": "2026-10-05T09:00:00",
            "venue": "Grand Hall A",
            "rows": 4,
            "seats_per_row": 10,
            "seats": [
                {"seat_id": f"{chr(65+r)}{s+1}", "status": "available"}
                for r in range(4) for s in range(10)
            ]
        }
    ]

    await db.events.insert_many(events)
    print("Database successfully seeded!")

if __name__ == "__main__":
    asyncio.run(seed())