# Seat-Booking-System
Seat Booking System (Mini-BookMyShow)
# Mini-BookMyShow — Seat Booking System

A full-stack, real-time event seat-booking application built with **FastAPI**, **MongoDB**, **React (TypeScript)**, and **Docker**.

This system handles event listings, interactive visual seat maps, booking management, and robust concurrent booking protection to prevent double-booking.

---

## 📌 Features

* **Event Management:** Browse events with customizable seat map layouts (e.g., Row A–E, Seats 1–10).
* **Interactive Seat Grid:** Visual indicator for `available`, `held`, and `booked` seats with real-time feedback.
* **Double-Booking Protection:** Guaranteed single-winner reservation using MongoDB atomic operations (`find_one_and_update`).
* **Booking Management:** View active reservations by email and cancel bookings to immediately release seats back to the available pool.
* **Admin Analytics:** Simple admin dashboard showing real-time event booking stats and revenue breakdowns.
* **Dockerized:** One-command setup for the database, backend API, and React frontend.

---

## 🛠 Tech Stack

* **Backend:** Python 3.11, FastAPI, Pydantic, Motor (Async MongoDB Driver)
* **Database:** MongoDB 7.0
* **Frontend:** React 18, TypeScript, Axios, Vite
* **Containerization:** Docker & Docker Compose

---

## 🚀 Quick Start (Docker Setup)

### Prerequisites

* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 1. Clone & Launch

Clone the repository and run the Docker Compose environment:

```bash
git clone https://github.com/your-username/mini-bookmyshow.git
cd mini-bookmyshow

# Build and start all containers in detached mode
docker-compose up --build -d

```

### 2. Access the Application

* **Frontend App:** [http://localhost:5173](http://localhost:5173)
* **FastAPI Interactive Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
* **MongoDB Instance:** `localhost:27017`

---

## 🔒 How Double-Booking is Prevented

### The Race Condition Problem

In high-concurrency environments (e.g., popular ticket sales), a typical **"check-then-write"** pattern creates a critical race condition:

1. **User A** checks if seat `D5` is available $\rightarrow$ Backend returns `True`.
2. **User B** checks if seat `D5` is available $\rightarrow$ Backend returns `True`.
3. **User A** updates status of `D5` to `booked`.
4. **User B** updates status of `D5` to `booked` *(Overwriting User A's reservation)*.

---

### The Solution: Atomic Mongo Operations

To prevent race conditions without complex server-side locks, this system uses MongoDB’s atomic **`find_one_and_update`** operator combined with query criteria matching.

---

#### Key Guarantees:

1. **Single Database Transaction:** MongoDB locks the matching document at the storage engine layer while evaluating `find_one_and_update`.
2. **First-Come, First-Served:** The first request to arrive mutates the status of the target seat array elements from `available` to `booked`.
3. **HTTP 409 Conflict:** Any subsequent request arriving milliseconds later fails the query condition (`status == "available"`) and returns an explicit `HTTP 409 Conflict` response to the frontend client.

---

## 📂 Project Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── database.py       # MongoDB Async Client (Motor)
│   │   ├── main.py           # FastAPI Routes & App Entrypoint
│   │   ├── models.py         # Pydantic & BSON Schemas
│   │   └── seed.py           # Database Seeder script
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # SeatGrid, Navbar, Modals
│   │   ├── pages/            # EventsPage, EventDetail, MyBookingsPage
│   │   ├── api.ts            # Axios Client configuration
│   │   └── types.ts          # TypeScript Type definitions
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md

```

---

## 🧪 Running the Concurrency Test Script

To verify that atomic locking blocks simultaneous double-booking requests, run the included asynchronous test script:

```bash
# Executed inside backend container or locally
python backend/tests/test_concurrency.py

```

**Expected Output:**

```text
[INFO] Firing 10 simultaneous booking requests for Seat D5...
[SUCCESS] Request #1: 201 Created - Seat D5 successfully booked!
[CONFLICT] Request #2: 409 Conflict - Seat no longer available.
[CONFLICT] Request #3: 409 Conflict - Seat no longer available.
...
[RESULT] Pass! 1 successful booking, 9 rejected requests. No double-bookings occurred.

```

---

## 📡 API Reference Endpoint Overview

| Method | Endpoint | Description | Status Code |
| --- | --- | --- | --- |
| **GET** | `/api/events` | List all available events | `200 OK` |
| **GET** | `/api/events/{id}` | Get event details & seat map status | `200 OK` / `404` |
| **POST** | `/api/bookings` | Book one or more seats atomically | `201 Created` / `409 Conflict` |
| **GET** | `/api/bookings?email={email}` | Fetch bookings by user email | `200 OK` |
| **POST** | `/api/bookings/{id}/cancel` | Cancel booking and release seats | `200 OK` / `404` |
| **GET** | `/api/admin/stats` | View booking stats per event | `200 OK` |
