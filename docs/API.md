# Traveloop API Specification

This document provides a comprehensive overview of the RESTful API endpoints available in the Traveloop platform.

## Base URL
- Local: `http://localhost:5000/api`
- Production: `https://traveloop-personalized-travel-planner.onrender.com/api`

## Authentication (`/auth`)
Endpoints for user identity and account management.

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/signup` | None | Register a new user account |
| `POST` | `/login` | None | Authenticate and receive JWT |
| `PATCH`| `/update-profile`| JWT | Update user name, email, or bio |
| `DELETE`| `/delete-account`| JWT | Permanently remove account and data |

## Trips (`/trips`)
Core travel planning and itinerary endpoints.

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | JWT | Get all trips for the authenticated user |
| `POST` | `/` | JWT | Create a new trip |
| `GET` | `/:id` | JWT | Get full details for a specific trip |
| `POST` | `/stop` | JWT | Add a city stop to an itinerary |
| `POST` | `/activity` | JWT | Add an activity to a specific stop |
| `GET` | `/:id/budget` | JWT | Get full budget breakdown for a trip |
| `GET` | `/:id/checklist`| JWT | Get packing checklist for a trip |

## Community (`/community`)
Social features and public trip discovery.

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/feed` | None | Get public trips from the community |
| `POST` | `/:id/like` | JWT | Like a public trip |

## Notifications (`/notifications`)
User-specific alerts.

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | JWT | Get recent notifications for the user |
| `PATCH`| `/read-all` | JWT | Mark all notifications as read |

## Error Responses
The API uses standard HTTP status codes:
- `200 OK`: Request succeeded
- `201 Created`: Resource successfully created
- `400 Bad Request`: Validation error or invalid input
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Authenticated but lack permissions
- `404 Not Found`: Resource does not exist
- `500 Internal Server Error`: Backend crash or database failure
