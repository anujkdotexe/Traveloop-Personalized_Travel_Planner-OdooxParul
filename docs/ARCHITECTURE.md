# Traveloop — System Architecture

## Overview

Traveloop is a **monorepo** split into two independently-runnable packages — a React SPA and an Express REST API — connected in development via a Vite reverse proxy.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                   BROWSER                       │
│                                                 │
│  React SPA (Vite, port 5173)                    │
│  ┌─────────────────────────────────────────┐    │
│  │  AuthContext  → JWT stored in memory    │    │
│  │  React Router v6 (18 protected routes)  │    │
│  │                                         │    │
│  │  14 SCREENS:                            │    │
│  │  Login · Signup · Dashboard             │    │
│  │  CreateTrip · ItineraryBuilder          │    │
│  │  ItineraryView · CitySearch             │    │
│  │  ActivitySearch · Budget · Invoice      │    │
│  │  Checklist · Notes · Community          │    │
│  │  Profile · Admin · SharedView           │    │
│  └─────────────────────────────────────────┘    │
│           │ fetch /api/* (proxied)              │
└───────────┼─────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────────────┐
│         Express API Server (port 5000)          │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │  Middleware stack                        │   │
│  │  cors · express.json · verifyUser        │   │
│  │  verifyAdmin (admin-only routes)         │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  Routes:                                        │
│  POST /auth/register  POST /auth/login          │
│  GET|POST|PUT|DELETE /trips/:id                 │
│  GET|POST|PUT|DELETE /trips/:id/stops           │
│  GET|POST|PUT|DELETE /stops/:id/activities      │
│  GET /trips/:id/budget                          │
│  GET|POST|PATCH|DELETE /trips/:id/expenses      │
│  GET|POST|PATCH|DELETE /trips/:id/checklist     │
│  GET|POST|PUT|DELETE /trips/:id/notes           │
│  GET /community                                 │
│  GET /admin/stats  GET|DELETE /admin/users      │
│                                                 │
│  Controllers → DB queries (pg pool)             │
└───────────┬─────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────────────┐
│           PostgreSQL Database                   │
│                                                 │
│  users ─── trips ─── stops ─── activities      │
│                   └── expenses                 │
│                   └── checklists               │
│                   └── notes (stop_id optional)  │
│                                                 │
│  All FK: ON DELETE CASCADE                      │
└─────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### State Management

| Concern | Solution |
|---------|---------|
| Auth session | `AuthContext` — React Context with `user`, `token`, `isAdmin`, `login()`, `logout()` |
| Token persistence | `localStorage` key `traveloop_token` |
| UI state | Local `useState` per page |
| Server state | Direct `fetch` calls with `token` from context |
| Notifications | Custom `useToast` hook (`Toast.jsx`) |

### Routing

All routes are declared in `App.jsx`. Three wrapper components protect routes:
- `<ProtectedRoute>` — redirects to `/login` if no token
- `<AdminRoute>` — redirects to `/dashboard` if not admin role
- `<GuestRoute>` — redirects to `/dashboard` if already logged in

### Component Hierarchy

```
App.jsx
├── Navbar (sticky, avatar dropdown, notification bell)
├── AuthContext.Provider
│   ├── /login           → Login.jsx
│   ├── /signup          → Signup.jsx
│   ├── /forgot-password → ForgotPassword.jsx
│   ├── /shared/:id      → SharedView.jsx (no auth)
│   └── [Protected]
│       ├── /dashboard        → Dashboard.jsx
│       ├── /trips            → MyTrips.jsx
│       ├── /create-trip      → CreateTrip.jsx
│       ├── /itinerary/:id    → ItineraryBuilder.jsx
│       ├── /itinerary-view/:id → ItineraryView.jsx
│       ├── /city-search      → CitySearch.jsx
│       ├── /activity-search  → ActivitySearch.jsx
│       ├── /budget/:id       → Budget.jsx
│       ├── /invoice/:id      → ExpenseInvoice.jsx
│       ├── /checklist/:id    → Checklist.jsx
│       ├── /notes/:id        → Notes.jsx
│       ├── /community        → Community.jsx
│       ├── /profile          → Profile.jsx
│       └── [Admin only]
│           └── /admin        → Admin.jsx
```

---

## Backend Architecture

### Auth Flow

```
POST /auth/login
  → Find user by email in DB
  → bcrypt.compare(password, hash)  [cost 12]
  → Sign JWT {id, role} expires 7d
  → Return token + user object

Subsequent requests:
  → Authorization: Bearer <token>
  → middleware/auth.js: jwt.verify(token, JWT_SECRET)
  → Attach req.user = {id, role}
  → verifyAdmin: check req.user.role === 'admin'
```

### Database Schema

```sql
-- Core
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT CHECK (role IN ('user','admin')) DEFAULT 'user',
  language_pref TEXT DEFAULT 'English',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trips (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  start_date  DATE,
  end_date    DATE,
  description TEXT,
  cover_url   TEXT,
  is_public   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stops (
  id             SERIAL PRIMARY KEY,
  trip_id        INT REFERENCES trips(id) ON DELETE CASCADE,
  city           TEXT NOT NULL,
  country        TEXT,
  arrival_date   DATE,
  departure_date DATE,
  position       INT DEFAULT 0
);

CREATE TABLE activities (
  id           SERIAL PRIMARY KEY,
  stop_id      INT REFERENCES stops(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  category     TEXT,
  scheduled_at TEXT,
  duration_min INT DEFAULT 0,
  cost         NUMERIC DEFAULT 0,
  notes        TEXT
);

CREATE TABLE expenses (
  id          SERIAL PRIMARY KEY,
  trip_id     INT REFERENCES trips(id) ON DELETE CASCADE,
  category    TEXT,
  description TEXT,
  amount      NUMERIC NOT NULL,
  currency    TEXT DEFAULT 'USD',
  paid_at     TIMESTAMPTZ
);

CREATE TABLE checklists (
  id        SERIAL PRIMARY KEY,
  trip_id   INT REFERENCES trips(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category  TEXT DEFAULT 'General',
  is_packed BOOLEAN DEFAULT false
);

CREATE TABLE notes (
  id         SERIAL PRIMARY KEY,
  trip_id    INT REFERENCES trips(id) ON DELETE CASCADE,
  stop_id    INT REFERENCES stops(id) ON DELETE SET NULL,
  title      TEXT NOT NULL,
  content    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Design System

Defined in `client/src/index.css` as CSS custom properties:

```css
--primary:       #6366f1  (Indigo)
--secondary:     #14b8a6  (Teal)
--accent:        #f43f5e  (Rose)
--success:       #10b981
--warning:       #f59e0b
--radius-lg:     24px
--radius-md:     14px
--radius-full:   9999px
```

**Typography:** Outfit (Google Fonts) — weights 300, 400, 500, 600, 700

**Icons:** All SVG inline — zero emoji policy enforced project-wide.

**Animations:**
- `@keyframes dropdownIn` — navbar/notification panel slide-in
- `@keyframes spin` — loading spinner
- `.card-hover:hover` — `translateY(-3px)` + shadow elevation
- `.btn-primary:hover` — `translateY(-1px)` + glow shadow

---

## Data Flow: Creating a Trip

```
User fills CreateTrip form
  → POST /api/trips { title, start_date, end_date, description }
  → Server validates input
  → INSERT INTO trips (user_id, ...) RETURNING *
  → Response: trip object with new id
  → Navigate to /itinerary/:id

User adds a stop
  → POST /api/trips/:id/stops { city, country, arrival_date, departure_date }
  → INSERT INTO stops → Response
  → Add activity to stop
  → POST /api/stops/:stopId/activities { name, category, cost }
  → Budget auto-calculated: SELECT SUM(cost) FROM activities...
```

---

## Security Considerations

| Vector | Mitigation |
|--------|-----------|
| Password storage | bcrypt cost 12 |
| Token theft | JWT expires in 7 days; no refresh token stored in DB |
| CSRF | SPA with `Authorization` header (not cookies) |
| Role escalation | `role` stored in DB; re-checked on every admin request |
| SQL injection | Parameterized queries via `pg` pool |
| Sensitive env vars | `.env` git-ignored; `.env.example` provided |
