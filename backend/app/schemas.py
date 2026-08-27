from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class SeatSchema(BaseModel):
    seat_id: str
    row: str
    number: int
    category: str = "Standard"
    price: float = 10.0
    status: str = "available"  # available | held | booked
    booked_by: Optional[str] = None
    hold_expires_at: Optional[datetime] = None

class EventCreate(BaseModel):
    title: str
    date_time: str
    venue: str
    rows: int = Field(gt=0, le=26)
    seats_per_row: int = Field(gt=0)

class EventResponse(BaseModel):
    id: str
    title: str
    date_time: str
    venue: str
    rows: int
    seats_per_row: int
    seats: List[SeatSchema]

class BookingCreate(BaseModel):
    event_id: str
    user_name: str
    user_email: EmailStr
    seat_ids: List[str]

class BookingResponse(BaseModel):
    id: str
    event_id: str
    event_title: str
    user_name: str
    user_email: str
    seat_ids: List[str]
    status: str
    created_at: datetime