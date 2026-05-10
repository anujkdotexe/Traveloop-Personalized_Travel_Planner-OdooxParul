# Traveloop — Personalized Travel Planner

> A full-stack web application for planning, managing, and sharing personalized travel itineraries. Built for the OdooxParul Hackathon.

---

## Table of Contents

- [Overview](#overview)
- [Team](#team)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Demo Credentials](#demo-credentials)
- [Feature Overview](#feature-overview)
- [API Reference](#api-reference)
- [Design System](#design-system)
- [Security](#security)
- [Scripts Reference](#scripts-reference)

---

## Overview

Traveloop is a personalized travel planning platform that lets users:

- Build detailed day-by-day itineraries with city stops and activities
- Track trip budgets with visual charts and expense tables
- Manage packing checklists and trip notes/journals
- Discover and copy community-shared itineraries
- Share trips via public read-only links

Admin users additionally have access to a platform analytics dashboard covering user growth, popular destinations, and activity trends.

---

## Team

| Member | Role |
|---|---|
| Anuj Kondawar | Lead — Frontend Architecture, Auth, Routing |
| Chirag Bhayal | Backend API, Database Schema |
| Raghav Dadhich | UI Components, Design System |
| Tirupati Behera | Community, Admin Dashboard, Shared View |

---

## Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | React Router DOM v7 |
| Charts | Chart.js 4 |
| Styling | Vanilla CSS (custom design system) |
| State | React Context API (AuthContext) |
| HTTP | Native Fetch API |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js v24 |
| Framework | Express v5 |
| Database | PostgreSQL 16 |
| ORM/Query | node-postgres (pg) |
| Auth | JWT (jsonwebtoken) |
| Encryption | bcryptjs (cost factor 12) |

---

## Project Structure

```
OdooxParul/
├── client/                        # React + Vite frontend
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/            # Shared UI components
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Toast.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # JWT auth state
│   │   ├── pages/                 # One file per screen (14 screens)
│   │   │   ├── Admin.jsx
│   │   │   ├── Budget.jsx
│   │   │   ├── Checklist.jsx
│   │   │   ├── Community.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ItineraryBuilder.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MyTrips.jsx
│   │   │   ├── Notes.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── SharedView.jsx
│   │   │   └── Signup.jsx
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx # Auth + Admin route guards
│   │   ├── App.jsx                # Router configuration
│   │   ├── index.css              # Design system tokens + global styles
│   │   └── main.jsx               # React entry point
│   ├── index.html                 # HTML shell with SEO meta tags
│   ├── package.json
│   └── vite.config.js             # Dev server + API proxy
│
├── server/                        # Express REST API
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js      # Register + Login with bcrypt
│   │   └── tripController.js
│   ├── db/
│   │   ├── db.js                  # PostgreSQL connection pool
│   │   ├── schema.sql             # Full normalized DB schema
│   │   └── seed.js                # Demo user seeder
│   ├── middleware/
│   │   └── auth.js                # verifyUser + verifyAdmin JWT middleware
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   └── tripRoutes.js
│   ├── .env.example               # Template — copy to .env
│   └── server.js                  # Express app entry point
│
├── docs/
│   ├── maindoc.md                 # Product requirements document
│   ├── API.md                     # REST API reference
│   └── Traveloop - 8 hours.excalidraw.png   # Wireframe
│
├── .gitignore
├── README.md                      # This file
└── evaluation_and_things_to_be_taken_care.md
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

### 1. Clone the repository

```bash
git clone https://github.com/anujkdotexe/Traveloop-Personalized_Travel_Planner-OdooxParul-.git
cd OdooxParul
```

### 2. Set up the backend

```bash
cd server
cp .env.example .env
# Edit .env and fill in your PostgreSQL credentials and JWT secret
npm install
```

### 3. Set up the database

```bash
# Create the database (run once)
psql -U postgres -c "CREATE DATABASE traveloop;"

# Apply the schema
psql -U postgres -d traveloop -f db/schema.sql

# Seed demo users
npm run seed
```

### 4. Start the backend server

```bash
npm start          # production
npm run dev        # development with nodemon (auto-reload)
```

The API will be available at `http://localhost:5000`.

### 5. Set up the frontend

```bash
cd ../client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

> The Vite dev server is configured to proxy all `/api/*` requests to `http://localhost:5000` automatically — no CORS issues in development.

---

## Environment Variables

Copy `server/.env.example` to `server/.env` and fill in:

| Variable | Description | Example |
|---|---|---|
| `PORT` | API server port | `5000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `traveloop` |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `your_password` |
| `JWT_SECRET` | JWT signing secret (keep long and random) | `a64-char-hex-string` |

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Database Setup

The full normalized schema is in `server/db/schema.sql`. Tables:

| Table | Description |
|---|---|
| `users` | Account data, roles (user/admin), encrypted passwords |
| `trips` | Trip headers — title, dates, status, visibility |
| `stops` | Ordered city stops within a trip |
| `activities` | Per-stop activities with time, cost, category |
| `expenses` | Trip-level financial entries |
| `checklists` | Packing list items per trip |
| `notes` | Trip journal/notes content |

---

## Demo Credentials

Two pre-seeded accounts are available for testing. Use the **Quick Demo Login** dropdown on the login screen.

| Role | Email | Password |
|---|---|---|
| Regular User | `demouser@traveloop.com` | `Demo@1234` |
| Admin | `admin@traveloop.com` | `Admin@1234` |

---

## Feature Overview

### Authentication (Screens 1-3)
- **Login** — email/password form + Quick Demo Login dropdown with role badges
- **Signup** — full registration (first name, last name, phone, city, country)
- **Forgot Password** — password reset request form

### Trip Management (Screens 4-5)
- **Dashboard** — gradient hero banner, global search, recent itineraries, top destinations grid
- **My Trips** — tabbed view (All / Ongoing / Upcoming / Completed), search + filter + sort toolbar

### Itinerary Planner (Screen 6)
- **Itinerary Builder** — split layout: stop sidebar + day-wise activity workspace
- City Search modal with region filter and cost/popularity data
- Activity Search modal with type filter and cost estimates
- Drag-to-reorder activity cards

### Trip Utilities (Screens 7-9)
- **Budget** — KPI cards + Chart.js donut chart + daily bar chart + itemized expense table
- **Packing Checklist** — per-category columns with progress bar, add/delete/reset per item
- **Trip Notes** — split editor: sidebar note list with search + full-width markdown-style editor

### Social (Screen 10)
- **Community** — public itinerary feed with like, copy-to-my-trips, search, filter, sort

### Profile (Screen 11)
- Personal info editor, language preference, saved destinations, security (2FA placeholder)

### Admin (Screen 12 — Admin only)
- KPI cards: total users, active trips, shared itineraries, activities logged
- User growth line chart (6 months) + Activity types donut chart
- Popular destinations ranked list
- User management table with remove action

### Shared View (Screen 13 — Public)
- Public read-only itinerary view with sticky header + Copy Trip CTA
- Hero banner, route pills, timeline itinerary

---

## API Reference

See `docs/API.md` for the complete REST API reference.

### Quick Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new account |
| `POST` | `/api/auth/login` | Public | Login and receive JWT |
| `GET` | `/api/trips` | User | List user's trips |
| `POST` | `/api/trips` | User | Create new trip |
| `POST` | `/api/trips/stop` | User | Add stop to trip |
| `GET` | `/api/admin/stats` | Admin | Platform analytics |
| `GET` | `/api/admin/users` | Admin | List all users |

---

## Design System

The **Premium Voyage Palette** is defined as CSS custom properties in `client/src/index.css`:

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#6366f1` (Indigo) | Buttons, active states, links |
| `--secondary` | `#14b8a6` (Teal) | Progress bars, success states |
| `--accent` | `#f43f5e` (Rose) | Alerts, danger actions |
| `--text-main` | `#1e293b` | Headings and body text |
| `--text-muted` | `#64748b` | Placeholders, secondary text |
| `--bg-page` | `#f8fafc` | Page background |
| `--bg-surface` | `#ffffff` | Cards, modals |

All icons are **inline SVG** only — zero emoji project-wide (hackathon rule compliance).

---

## Security

| Feature | Implementation |
|---|---|
| Password hashing | bcryptjs, cost factor 12 |
| Authentication | JWT, 8-hour expiry, `Authorization: Bearer` header |
| Route protection | `ProtectedRoute` — redirects unauthenticated users |
| Admin isolation | `AdminRoute` — redirects non-admin users to dashboard |
| SQL injection | Parameterized queries via `node-postgres` |
| Secret management | `.env` excluded from version control via `.gitignore` |

---

## Scripts Reference

### Server (`cd server`)

| Script | Command | Description |
|---|---|---|
| Start | `npm start` | Run server with Node |
| Dev | `npm run dev` | Run with nodemon (auto-reload) |
| Seed | `npm run seed` | Create/update demo users in DB |

### Client (`cd client`)

| Script | Command | Description |
|---|---|---|
| Dev | `npm run dev` | Start Vite dev server on port 5173 |
| Build | `npm run build` | Production bundle to `dist/` |
| Preview | `npm run preview` | Preview production build locally |
| Lint | `npm run lint` | Run ESLint |

---

*Built with dedication by Team OdooxParul — Hackathon 2025*
