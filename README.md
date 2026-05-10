# ✈️ Traveloop: Personalized AI-Powered Travel Planner

Traveloop is a premium, full-stack travel planning platform designed to transform complex trip logistics into a seamless, visual journey. Built for modern travelers and digital nomads.

![Traveloop Hero](https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80)

## 🌟 Key Features

### 🗺️ Intelligent Itinerary Builder
- **Multi-Stop Planning**: Organize trips by cities and sequences.
- **Granular Activities**: Schedule sightseeing, dining, and adventure with time and cost tracking.
- **Dynamic Checklists**: Never forget your passport again with automated packing lists.

### 📊 Professional Admin Suite
- **Real-time Analytics**: Monitor user growth, trip activity, and category distribution.
- **KPI Tracking**: High-level metrics for platform health.
- **User Management**: Administrative control over the platform's community.

### 🌍 Community & Discovery
- **Public Feed**: Share your adventures or discover itineraries from fellow travelers.
- **One-Click Copy**: Found a perfect Tokyo plan? Copy it to your account instantly.
- **Live FX Conversion**: Planning a trip to Dubai? See costs in AED and INR (~₹) simultaneously with live exchange rates.

### 🔔 Smart Notifications
- **Automated Alerts**: Receive instant feedback on trip creation, sharing, and system updates.
- **Personalized Inbox**: User-specific notification history.

---

## 🛠️ Technical Stack

- **Frontend**: React 18, Vite, Chart.js, React Router v6.
- **Backend**: Node.js, Express.js, JWT Auth, Bcrypt.
- **Database**: PostgreSQL (Relational) with UUID primary keys.
- **Deployment**: Vercel (Frontend) + Render (Backend/DB).

---

## 📂 Documentation

Detailed technical documentation is available in the `docs/` directory:

1.  **[Architecture](docs/ARCHITECTURE.md)**: System design and technology stack.
2.  **[Database Schema](docs/DATABASE.md)**: Tables, ERD, and relationships.
3.  **[API Reference](docs/API.md)**: Complete REST endpoint documentation.
4.  **[Deployment Guide](DEPLOYMENT.md)**: Instructions for production setup.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js v18+
- PostgreSQL v14+

### 2. Installation
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Environment Setup
Create a `.env` file in the `server/` directory:
```env
PORT=5000
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secure_secret
```

### 4. Database Setup & Seed
```bash
cd server
node db/runSchema.js
node db/seed.js
```

### 5. Run Locally
```bash
# In server directory
npm run dev

# In client directory
npm run dev
```

---

## 🔑 Demo Access

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@traveloop.com` | `Demo@1234` |
| **User** | `demo@traveloop.com` | `Demo@1234` |

---

## 🏆 Hackathon Context
Traveloop was developed as a solution for the **OdooxParul Hackathon**, focusing on professional UI/UX, robust relational data modeling, and production-ready full-stack architecture.
