# Seat Booking System

A full-stack, concurrent seat-booking application built for events (movies, shows, workshops). Users can view events, check real-time seat availability, and book seats securely without the risk of double-booking.

---

## 🛠️ Stack Required

- **Backend:** Python (FastAPI)
- **Database:** MongoDB
- **Frontend:** React + TypeScript
- **Containerization:** Docker & Docker Compose

---

## 📋 Overview

This application provides an interactive seat map for events, allowing users to pick available seats and confirm bookings. The primary technical hurdle solved by this system is preventing double-booking when multiple users attempt to book the exact same seat simultaneously.

---

## 🚀 How Double-Booking is Prevented

Double-booking is prevented by leveraging **MongoDB's atomic operations** instead of performing a separate read and write step.

### The Problem (Race Condition)
A naive approach uses a two-step check:
1. `GET` seat status (Check if `available`)
2. `UPDATE` seat status to `booked`

If two users request the same seat at nearly the same time, both read requests see the seat as `available`, causing both update operations to succeed—resulting in a double-booking.

### The Solution (Atomic Updates)
We eliminate the race condition by combining the condition check and the update into a single atomic database operation using `find_one_and_update`:

- The operation explicitly queries for a seat where `id = target_seat_id` **AND** `status = "available"`.
- It updates the status to `"booked"` in one unbroken step inside MongoDB.
- If two simultaneous requests hit the database:
  - The **first request** finds the seat with status `"available"`, updates it to `"booked"`, and succeeds (**200 OK**).
  - The **second request** fails to find a document matching `status = "available"` (since it was just changed to `"booked"`), returning no modified document.
  - The backend catches this state and immediately returns a **`409 Conflict`** HTTP response code with a message stating: *"Seat no longer available"*.

---

## ✨ Features & Requirements

### 1. Events
- Includes title, date/time, venue name, and customizable seat layouts (e.g., Rows A–E, Seats 1–10 = 50 total seats).
- Full CRUD functionality.
- Pre-seeded with 2–3 sample events out of the box.

### 2. Seats & Booking Flow
- Interactive visual seat map displaying **available**, **held**, and **booked** states.
- Optional seat pricing/categories (e.g., Standard vs. Premium).
- Simple user booking confirmation (name and email).

### 3. Booking Management
- **My Bookings** view filtered by email address.
- Ability to cancel existing bookings, automatically returning seats back to the `available` state.

---

## 💻 Setup & Running with Docker

Run the entire application (MongoDB, FastAPI, React) end-to-end using Docker:

```bash
docker-compose up --build

🎯 Stretch Goals & Optional Features
Temporary Seat Holds: Auto-release seats if not confirmed within 2 minutes.

Concurrency Test Script: Script simulating simultaneous booking requests targeting the same seat to prove atomic locking works.

Admin Dashboard: Booking statistics and metrics per event.


---

### **Git Commands to Commit and Push**

Run these commands in your VS Code terminal (`Ctrl + ~`):

```powershell
# Stage the README.md file
git add README.md

# Commit the changes
git commit -m "docs: add README with setup instructions and double-booking explanation"

# Push the changes to GitHub
git push origin main