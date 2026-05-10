# Traveloop REST API Reference

Base URL (development): `http://localhost:5000/api`

All protected endpoints require: `Authorization: Bearer <JWT_TOKEN>`

---

## Authentication

### POST `/auth/register`
Register a new user account.

**Body:**
```json
{ "name": "string", "email": "string", "password": "string (min 8 chars)" }
```

**Response:** `201`
```json
{ "status": "success", "message": "Account created." }
```

---

### POST `/auth/login`
Authenticate and receive a JWT token.

**Body:**
```json
{ "email": "string", "password": "string" }
```

**Response:** `200`
```json
{
  "status": "success",
  "token": "<JWT>",
  "user": { "id": 1, "name": "Demo User", "email": "demo@traveloop.com", "role": "user" }
}
```

---

## Trips (Protected)

### GET `/trips`
List all trips for the authenticated user.

**Response:** `200` — Array of trip objects with `stop_count`.

---

### POST `/trips`
Create a new trip.

**Body:**
```json
{ "title": "string", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD", "description": "string", "is_public": false }
```

---

### GET `/trips/:id`
Get a single trip with all stops and activities.

---

### PUT `/trips/:id`
Update a trip (owner only).

**Body:** Any subset of trip fields.

---

### DELETE `/trips/:id`
Delete a trip and all associated data (owner only). Cascades to stops, activities, expenses, checklists, notes.

---

## Stops

### POST `/trips/:id/stops`
Add a city stop to a trip.

**Body:**
```json
{ "city": "Paris", "country": "France", "arrival_date": "2024-06-12", "departure_date": "2024-06-18" }
```

---

### PUT `/stops/:stopId`
Update a stop's dates or position.

---

### DELETE `/stops/:stopId`
Remove a stop (and its activities) from a trip.

---

## Activities

### POST `/stops/:stopId/activities`
Add an activity to a stop.

**Body:**
```json
{ "name": "Eiffel Tower", "category": "sightseeing", "scheduled_at": "09:00", "duration_min": 120, "cost": 45 }
```

---

### PUT `/activities/:actId`
Update an activity.

---

### DELETE `/activities/:actId`
Delete an activity.

---

## Budget & Expenses

### GET `/trips/:id/budget`
Get budget summary with total estimated cost and per-category breakdown.

**Response:**
```json
{
  "status": "success",
  "data": {
    "total": 2470,
    "budget": 3000,
    "remaining": 530,
    "by_category": { "Hotel": 1200, "Travel": 100, "Dining": 840, "Sightseeing": 180, "Transport": 150 },
    "daily_average": 176,
    "days": 14
  }
}
```

---

### POST `/trips/:id/expenses`
Log a manual expense entry.

**Body:**
```json
{ "category": "Hotel", "description": "Hotel Ritz - 6 nights", "amount": 1200, "currency": "USD" }
```

---

## Checklist

### GET `/trips/:id/checklist`
Get all checklist items for a trip, grouped by category.

---

### POST `/trips/:id/checklist`
Add an item to the checklist.

**Body:**
```json
{ "item_name": "Passport", "category": "Documents" }
```

---

### PATCH `/checklist/:itemId`
Toggle `is_packed` status.

---

### DELETE `/checklist/:itemId`
Remove an item.

---

## Notes / Journal

### GET `/trips/:id/notes`
Get all notes for a trip.

---

### POST `/trips/:id/notes`
Create a new note.

**Body:**
```json
{ "title": "Hotel Check-in Details", "content": "string", "stop_id": 2 }
```

---

### PUT `/notes/:noteId`
Update a note's title or content.

---

### DELETE `/notes/:noteId`
Delete a note.

---

---

## Notifications (Protected)

### GET `/notifications`
Get all notifications for the authenticated user.

### PATCH `/notifications/read-all`
Mark all notifications as read for the authenticated user.

---

## Community & Destinations (Public)

### GET `/trips/public/community`
Get all trips with `is_public = true`. Supports `?search=` and `?sort=popular|recent`.

### GET `/trips/public/top-destinations`
Get top 4 popular cities across all user trips for dashboard highlights.

---

## Admin (Admin role only)

### GET `/admin/stats`
Platform-wide analytics.

**Response:**
```json
{
  "total_users": 12840,
  "active_trips": 4215,
  "shared_itineraries": 1052,
  "activities_logged": 38940,
  "top_cities": [{ "name": "Paris, France", "count": 842 }, ...],
  "user_growth": [1200, 1900, 3000, 3500, 4800, 5200]
}
```

---

### GET `/admin/users`
List all registered users.

---

### DELETE `/admin/users/:userId`
Remove a user account and all their data.

---

## Error Responses

All errors return:

```json
{ "status": "error", "message": "Human-readable description." }
```

| Code | Meaning |
|------|---------|
| 400 | Validation error (missing/invalid fields) |
| 401 | Missing or invalid token |
| 403 | Insufficient role (non-admin accessing admin route) |
| 404 | Resource not found |
| 409 | Conflict (e.g. email already in use) |
| 500 | Internal server error |
