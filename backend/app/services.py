from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase


async def create_event_with_seats(db: AsyncIOMotorDatabase, data: dict):
    rows = data.get("rows", 5)
    seats_per_row = data.get("seats_per_row", 8)
    total_seats = rows * seats_per_row
    seats = []

    for r in range(rows):
        row_letter = chr(65 + r)
        for s in range(1, seats_per_row + 1):
            category = "Premium" if r < 2 else "Standard"
            price = 200.0 if category == "Premium" else 150.0
            seats.append({
                "seat_id": f"{row_letter}{s}",
                "row": row_letter,
                "number": s,
                "category": category,
                "price": price,
                "status": "available",
                "booked_by": None,
                "hold_expires_at": None,
            })

    doc = {
        "title": data["title"],
        "date_time": data["date_time"],
        "venue": data["venue"],
        "rows": rows,
        "seats_per_row": seats_per_row,
        "total_seats": total_seats,
        "available_seats": total_seats,
        "seats": seats,
    }
    
    res = await db.events.insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    doc["id"] = doc["_id"]
    return doc


async def book_seats_atomically(
    db: AsyncIOMotorDatabase,
    event_id: str,
    seat_ids: list[str],
    email: str,
    name: str,
):
    if not ObjectId.is_valid(event_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid Event ID format"
        )
        
    obj_id = ObjectId(event_id)
    event = await db.events.find_one({"_id": obj_id})
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Event not found"
        )

    # Query matching event ONLY IF all requested seats are currently 'available'
    query = {
        "_id": obj_id,
        "seats": {
            "$all": [
                {"$elemMatch": {"seat_id": sid, "status": "available"}}
                for sid in seat_ids
            ]
        },
    }

    # Atomically mark seats as booked and decrease available seat count
    update = {
        "$set": {
            "seats.$[elem].status": "booked",
            "seats.$[elem].booked_by": email,
        },
        "$inc": {
            "available_seats": -len(seat_ids)
        }
    }
    array_filters = [{"elem.seat_id": {"$in": seat_ids}}]

    result = await db.events.find_one_and_update(
        query, 
        update, 
        array_filters=array_filters, 
        return_document=True
    )

    # If result is None, another request claimed the seat first (Race Condition Prevention)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "One or more selected seats are no longer available. Please"
                " select different seats."
            ),
        )

    booking_doc = {
        "event_id": str(obj_id),
        "event_title": event["title"],
        "user_name": name,
        "user_email": email,
        "seat_ids": seat_ids,
        "status": "confirmed",
        "created_at": datetime.utcnow().isoformat(),
    }
    booking_res = await db.bookings.insert_one(booking_doc)
    booking_doc["_id"] = str(booking_res.inserted_id)
    booking_doc["id"] = booking_doc["_id"]
    return booking_doc


async def cancel_booking_atomically(
    db: AsyncIOMotorDatabase, booking_id: str
):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid Booking ID format"
        )

    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking or booking.get("status") == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Active booking not found"
        )

    # Reset seat statuses back to available and increase available_seats counter
    await db.events.update_one(
        {"_id": ObjectId(booking["event_id"])},
        {
            "$set": {
                "seats.$[elem].status": "available",
                "seats.$[elem].booked_by": None,
            },
            "$inc": {
                "available_seats": len(booking["seat_ids"])
            }
        },
        array_filters=[{"elem.seat_id": {"$in": booking["seat_ids"]}}],
    )

    # Update booking status
    await db.bookings.update_one(
        {"_id": ObjectId(booking_id)}, 
        {"$set": {"status": "cancelled"}}
    )
    return {"message": "Booking cancelled successfully"}