# Traveloop — Personalized Travel Planner

Traveloop is an all-in-one travel companion designed to simplify trip planning, budget management, and itinerary organization. From building multi-stop journeys to tracking every penny spent, Traveloop provides a premium, interactive experience for modern travelers.

## 🚀 Features

- **Dynamic Itinerary Builder**: Plan multi-city trips with drag-and-drop ease.
- **Financial Command Center**: Real-time budget tracking and automated invoice generation.
- **Trip Journal**: Record memories and important notes for every destination.
- **Smart Checklists**: Never forget an item with categorized packing lists.
- **Community Feed**: Share your adventures and discover top destinations.
- **Admin Dashboard**: Powerful analytics and platform management tools.

## 🛠️ Technology Stack

- **Frontend**: React, Chart.js, Vite
- **Backend**: Node.js, Express, JWT
- **Database**: PostgreSQL (UUID based schema)
- **Deployment**: Vercel & Render

## 📖 Documentation

Detailed technical documentation is available in the `/docs` directory:

- [System Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Database Schema](docs/DATABASE.md)

## ✅ Requirements

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm (ships with Node.js)

### Recommended Tooling
- VS Code with ESLint extension
- Postman or curl for API testing

## 🚦 Setup

### 1. Clone and enter the project

```bash
git clone https://github.com/anujkdotexe/Traveloop-Personalized_Travel_Planner-OdooxParul.git
cd Traveloop-Personalized_Travel_Planner-OdooxParul
```

### 2. Configure and run backend

```bash
cd server
npm install
cp .env.example .env
```

Update `.env` values for your local PostgreSQL instance (especially `DB_*` fields and `JWT_SECRET`), then start the API:

```bash
npm run dev
```

The backend runs at `http://localhost:5000` by default.

### 3. Run frontend

In a new terminal:

```bash
cd client
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` by default.

## 🔌 API Usage

Base URL (local): `http://localhost:5000`

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@example.com","password":"Password123!"}'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Password123!"}'
```

Use the returned JWT in the `Authorization: Bearer <token>` header for protected endpoints.

For full endpoint coverage, see [API Reference](docs/API.md).

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
