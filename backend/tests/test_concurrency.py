import asyncio
import httpx
import pytest

@pytest.mark.asyncio
async def test_concurrent_booking_same_seat():
    async with httpx.AsyncClient() as client:
        # 1. Fetch first available event
        events_resp = await client.get("http://localhost:8000/api/events")
        events = events_resp.json()
        assert len(events) > 0
        target_event = events[0]
        event_id = target_event["id"]
        seat_to_claim = target_event["seats"][0]["seat_id"]

        req1 = {
            "event_id": event_id,
            "user_name": "User One",
            "user_email": "user1@test.com",
            "seat_ids": [seat_to_claim]
        }
        req2 = {
            "event_id": event_id,
            "user_name": "User Two",
            "user_email": "user2@test.com",
            "seat_ids": [seat_to_claim]
        }

        # 2. Fire simultaneous asynchronous booking requests at exact same seat
        res1, res2 = await asyncio.gather(
            client.post("http://localhost:8000/api/bookings", json=req1),
            client.post("http://localhost:8000/api/bookings", json=req2),
            return_exceptions=True
        )

    status_codes = [res1.status_code, res2.status_code]
    
    # Assert exactly ONE request gets HTTP 201 Created and ONE gets HTTP 409 Conflict
    assert 201 in status_codes
    assert 409 in status_codes