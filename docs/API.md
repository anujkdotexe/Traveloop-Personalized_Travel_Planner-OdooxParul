# Traveloop REST API Documentation

Base URL: `https://traveloop-personalized-travel-planner.onrender.com/api` (Production)
Local: `http://localhost:5000/api`

## Overview
All endpoints return JSON responses. Errors follow a standard format:
```json
{ "status": "error", "message": "Reason for failure" }
```

---

## 1. Authentication
Endpoints for user lifecycle management.

### [POST] `/auth/register`
Create a new user account.
- **Body**: `{ "name", "email", "password" }`
- **Response**: `201 Created`

### [POST] `/auth/login`
Authenticate and receive a JWT.
- **Body**: `{ "email", "password" }`
- **Response**: `200 OK` with `{ "token", "user" }`

---

## 2. Trips & Itineraries
Core CRUD operations for travel plans.

### [GET] `/trips`
List all trips for the authenticated user.

### [POST] `/trips`
Initialize a new trip.
- **Body**: `{ "title", "start_date", "end_date", "description", "is_public" }`

### [GET] `/trips/:id`
Fetch complete trip details including stops and activities.

### [PUT] `/trips/:id`
Modify trip details. Supports partial updates.

### [DELETE] `/trips/:id`
Permanent removal of a trip and all associated child records.

---

## 3. Notifications
User engagement and alerts.

### [GET] `/notifications`
Retrieve recent alerts (max 20) for the user.

### [PATCH] `/notifications/read-all`
Mark all unread alerts as read.

---

## 4. Admin Analytics (Admin Only)
High-level platform monitoring.

### [GET] `/admin/stats`
Returns aggregated data for:
- Total users, trips, and activities.
- User registration growth (6-month trend).
- Activity category distribution.
- Top destinations leaderboard.

### [GET] `/admin/users`
List all users with their trip counts and registration dates.

### [DELETE] `/admin/users/:userId`
Administrative removal of a user account.

---

## 5. Community & Public
Public-facing discovery endpoints.

### [GET] `/trips/public/community`
Searchable feed of itineraries marked as `is_public = true`.

### [GET] `/trips/public/top-destinations`
Calculates and returns the most visited cities globally.
