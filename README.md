# Traveloop — Personalized Travel Planner

A full-stack travel planning platform built with **React + Vite** (frontend) and **Express + PostgreSQL** (backend). Plan multi-city itineraries, track budgets, manage packing lists, and share trips with the community.

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Clone and install
```bash
git clone https://github.com/<your-org>/OdooxParul.git
cd OdooxParul

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env with your DB credentials and JWT secret
```

### 3. Initialize the database

```bash
cd server
node db/seed.js
```

This creates all tables and seeds two demo accounts:

| Role  | Email                | Password     |
|-------|----------------------|--------------|
| User  | demo@traveloop.com   | Demo1234!    |
| Admin | admin@traveloop.com  | Admin1234!   |

### 4. Run the application

```bash
# Terminal 1 — Backend (port 5000)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
```

Visit `http://localhost:5173`

---

## All 14 Screens Implemented

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| 0 | Landing Page | `/` | Product introduction, value prop, and community highlights |
| 1 | Login | `/login` | Email/password auth with demo user dropdown |
| 2 | Registration | `/signup` | Full registration: photo, name, phone, city, country, additional info |
| 3 | Dashboard | `/dashboard` | Hero banner, Group by/Filter/Sort toolbar, trip cards, top destinations |
| 4 | Create Trip | `/create-trip` | Trip form + 4 Quick-Start Templates + cover photo upload |
| 5 | Itinerary Builder | `/itinerary/:id` | Day-wise activity planner with city stops, drag handles, quick-add modals |
| 6 | Itinerary View | `/itinerary-view/:id` | Read-only view with List/Calendar toggle + budget sidebar |
| 7 | City Search | `/city-search` | 12 real cities, region/budget/sort filters, Add to Trip |
| 8 | Activity Search | `/activity-search` | 12 activities, category pills, cost/duration/sort filters |
| 9 | Trip Budget | `/budget/:id` | Doughnut + bar charts, line-item table, over-budget alerts |
| 10 | Packing Checklist | `/checklist/:id` | Categorized items, progress bar, add/remove/reset/print |
| 11 | Shared/Public View | `/shared/:id` | Public read-only itinerary, Copy Trip, Share URL |
| 12 | User Profile | `/profile` | Edit info, Saved Destinations, Preplanned Trips, Previous Trips |
| 13 | Trip Notes/Journal | `/notes/:id` | Search toolbar, sidebar list, All/By Day/By Stop tabs, rich editor |
| 14 | Expense Invoice | `/invoice/:id` | Invoice document, line items table, budget summary panel, Download/Email/Mark Paid |
| — | Admin Dashboard | `/admin` | KPI cards, user growth chart, activity types donut, popular destinations, user management |
| — | Community | `/community` | Public trip feed with Group by/Filter/Sort, Copy Trip, Heart/Like |
| — | Forgot Password | `/forgot-password` | Password reset flow |

---

## Project Structure

```
OdooxParul/
├── client/                     # React + Vite SPA
│   ├── index.html              # SEO meta tags + OG descriptors
│   ├── vite.config.js          # Dev-server proxy: /api → localhost:5000
│   └── src/
│       ├── App.jsx             # Full routing tree (18 routes)
│       ├── index.css           # Premium Voyage design system
│       ├── main.jsx
│       ├── components/
│       │   ├── Navbar.jsx      # Avatar dropdown + Notification bell
│       │   ├── Modal.jsx
│       │   └── Toast.jsx
│       ├── context/
│       │   └── AuthContext.jsx # Persistent JWT session
│       ├── pages/              # 18 page components (Home, Dashboard, etc.)
│       └── routes/
│           └── ProtectedRoute.jsx  # verifyUser + verifyAdmin guards
├── server/                     # Express API
│   ├── server.js
│   ├── .env.example
│   ├── controllers/
│   │   ├── authController.js   # bcrypt-12 + JWT auth
│   │   ├── tripController.js   # Full CRUD for trips/stops/activities
│   │   └── adminController.js  # Analytics + user management
│   ├── middleware/
│   │   └── auth.js             # JWT verification middleware
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── tripRoutes.js
│   │   └── adminRoutes.js
│   └── db/
│       ├── schema.sql          # Normalized PostgreSQL schema
│       └── seed.js             # Idempotent seeder (admin + demo user)
└── docs/
    ├── maindoc.md              # Product requirements
    ├── API.md                  # REST API reference
    ├── ARCHITECTURE.md         # System architecture
    ├── CONTRIBUTING.md         # Contribution guide
    └── Traveloop - 8 hours.excalidraw.png  # Wireframe
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Vanilla CSS (Premium Voyage design system) |
| Charts | Chart.js (doughnut, bar, line) |
| Backend | Express.js, Node.js |
| Database | PostgreSQL (normalized schema) |
| Auth | JWT + bcryptjs (cost factor 12) |
| Dev tools | Nodemon, Vite HMR |

---

## Security

- Passwords hashed with **bcrypt cost factor 12**
- All protected routes require a valid **JWT Bearer token**
- Role-based access control: `user` and `admin` roles enforced in both middleware and DB CHECK constraint
- `.env` excluded from version control; `.env.example` provided

---

## Design System

The "Premium Voyage" design system is defined in `client/src/index.css`:

- **Colors**: Indigo primary (`#6366f1`), Teal secondary (`#14b8a6`), Rose accent (`#f43f5e`)
- **Typography**: Outfit (Google Fonts)
- **No emojis** — all icons are inline SVGs
- **Animations**: `dropdownIn` keyframe, card hover `translateY(-3px)`, button `translateY(-1px)` on hover
- **Components**: `.btn`, `.card`, `.input-field`, `.tabs`, `.toolbar`, `.badge`, `.tag`, `.progress-bar-track`, `.invoice-table`

---

## Database Schema

```
users (id, name, email, password_hash, role, language_preference, created_at)
trips (id, user_id, title, start_date, end_date, description, cover_url, is_public)
stops (id, trip_id, city, country, arrival_date, departure_date, position)
activities (id, stop_id, name, category, scheduled_at, duration_min, cost, notes)
expenses (id, trip_id, category, description, amount, currency, paid_at)
checklists (id, trip_id, item_name, category, is_packed)
notes (id, trip_id, stop_id, title, content, created_at)
```

All foreign keys use `ON DELETE CASCADE`.

---

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md)

## License

MIT
