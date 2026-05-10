# Traveloop API Reference

This document provides technical details for the Traveloop REST API. All requests must use the `application/json` Content-Type. Authentication is handled via JWT in the `Authorization` header.

## Authentication
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Create a new user account |
| `/api/auth/login` | `POST` | Authenticate and receive JWT |

## Trips
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/trips` | `GET` | List all trips for current user |
| `/api/trips` | `POST` | Create a new trip |
| `/api/trips/:id` | `GET` | Get full trip details (stops + activities) |
| `/api/trips/:id` | `PUT` | Update trip settings |
| `/api/trips/:id` | `DELETE` | Remove a trip and all associated data |

## Itinerary Management
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/trips/stop` | `POST` | Add a new destination stop to a trip |
| `/api/trips/activity` | `POST` | Add an activity to a specific stop |
| `/api/trips/:id/budget` | `GET` | Get budget breakdown and expense list |
| `/api/trips/expenses` | `POST` | Record a new expense |

## Checklist & Notes
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/trips/:id/checklist` | `GET` | Fetch all items in the packing list |
| `/api/trips/checklist` | `POST` | Add a new item to the checklist |
| `/api/trips/checklist/:id/toggle` | `PATCH` | Mark an item as packed/unpacked |
| `/api/trips/:id/notes` | `GET` | Fetch all trip notes |
| `/api/trips/notes` | `POST` | Save a new trip note |

## Admin Endpoints
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/admin/analytics` | `GET` | Get platform-wide usage statistics |
| `/api/admin/users` | `GET` | List all registered users |
| `/api/admin/users/:id` | `DELETE` | Force remove a user account |

## Response Format
Standard success response:
```json
{
  "status": "success",
  "data": { ... }
}
```

Standard error response:
```json
{
  "status": "error",
  "message": "Human readable error description"
}
```
