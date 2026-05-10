# Traveloop - Personalized Travel Planner

Traveloop is a comprehensive travel planning platform that helps you discover, plan, and share your perfect trips.

## 📖 Documentation
Detailed system architecture, database schema, and API documentation can be found in [DOCS.md](./DOCS.md).

## 🚀 Getting Started
Traveloop is a full-stack travel planning platform for building multi-stop itineraries, tracking budgets, and sharing trips.

## 🚀 Features

- Dynamic itinerary planning with ordered city stops.
- Budget tracking and expense summaries.
- Trip journal and packing checklists.
- Public sharing and community discovery.
- Admin analytics for platform insights.

## Technology Stack
- Frontend: React + Vite, CSS3, SVG-only iconography
- Backend: Node.js, Express.js
- Database: PostgreSQL with UUID primary keys
- Security: JWT authentication, bcrypt password hashing, RBAC

## Design Philosophy: "Premium Voyage"

- Zero emoji policy in UI assets.
- Indigo-first palette with Teal and Rose accents.
- Clean, wireframe-aligned layouts.
- Outfit font for a modern premium feel.

## Documentation


- [Architecture](docs/ARCHITECTURE.md)

## Setup Instructions

### 1. Database
Execute `server/db/schema.sql` in your PostgreSQL instance.

### 2. Environment
Create `server/.env` with the following:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=traveloop
DB_PORT=5432
JWT_SECRET=your_jwt_secret_here
```

### 3. Install Dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 4. Run Locally

```bash
# Backend
cd server
node server.js

# Frontend
cd ../client
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend runs on `http://localhost:5000`.

## API Endpoints

### Auth (Public)
- POST `/api/auth/register`
- POST `/api/auth/login`

### Trips (Authenticated Users)
- GET `/api/trips`
- POST `/api/trips`
- POST `/api/trips/stop`

### Admin (Admin Role Only)
- GET `/api/admin/analytics`

## API Usage Examples

### Register a user

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@example.com","password":"Pass@123"}'
```

### Login and get token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Pass@123"}'
```

### Fetch authenticated trips

```bash
curl http://localhost:5000/api/trips \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## Demo Access

| Role | Email | Password |
| :--- | :--- | :--- |
| Admin | `admin@traveloop.com` | `Demo@1234` |
| User | `demo@traveloop.com` | `Demo@1234` |
## Team

- Anuj Kondawar: Lead, Integration, Auth Flow
- Chirag Bhayal: Frontend, 14 Screens, SVG Assets
- Raghav Dadhich: Backend API, Validation, Sharing Logic
- Tirupati Behera: Database Schema, Budget Engine, Data Seeding

## Hackathon Context

Traveloop was developed for the OdooxParul hackathon with a focus on polished UI, relational data modeling, and a production-ready full-stack structure.
