# Traveloop: Strategic Project Blueprint (Revised V2)

## Vision and Objective
To develop a high-performance, multi-city travel planning platform that strictly follows the provided wireframe designs. The system utilizes a "Premium Voyage" light-mode aesthetic, modular architecture, and SVG-only iconography to deliver a state-of-the-art travel planning experience.

---

## Design System: Premium Voyage (Light Mode)
A high-end travel aesthetic focused on trust, freshness, and clarity.

| Token | Hex Code | Application |
| :--- | :--- | :--- |
| **Primary** | #6366F1 | Brand identity, primary actions, active navigation |
| **Secondary** | #14B8A6 | Success indicators, nature-related activities |
| **Accent** | #F43F5E | Highlights, excitement, over-budget warnings |
| **Text Main** | #1E293B | High-contrast primary typography |
| **Text Muted** | #64748B | Secondary information, captions |
| **Background**| #F8FAFC | Soft ice page background |
| **Surface** | #FFFFFF | Cards, modals, and timeline blocks |
| **Border** | #F1F5F9 | Subtle dividers for a minimalist look |

**SVG Integration Strategy:**
- Use Lucide-style minimalist SVGs for all iconography.
- Absolute zero emoji policy (all visual cues are SVG-based).
- Icons will inherit Primary or Muted colors based on context.

---

## Wireframe Compliance (14 Screens)
Strictly following the provided layout designs:

1. **Login/Signup:** Vertical centered form with branding header.
2. **Dashboard:** Features a full-width "Banner Image" area, a global search bar, and "Quick Action" cards.
3. **Create Trip:** Multi-step or grouped form with "Trip Name", "Dates", and "Cover Photo" upload.
4. **My Trips:** Horizontal card grid showcasing trip name, dates, and city count.
5. **Itinerary Builder:** Vertical timeline on the left with a main workspace for "Days" and "Activity Blocks".
6. **Itinerary View:** Clean read-only timeline grouped by city headers.
7. **City Search:** Result list with "Country", "Cost Index", and "Popularity" metrics.
8. **Activity Search:** Filterable list of experiences (Sightseeing, Food, Adventure).
9. **Budget Breakdown:** Integrated Pie/Bar charts (Chart.js) and daily average tables.
10. **Packing Checklist:** Categorized checkable list (Clothing, Docs, Electronics).
11. **Shared/Public View:** Read-only web page with a "Copy to My Trips" CTA.
12. **User Profile:** Personal settings, saved destinations, and photo management.
13. **Trip Notes/Journal:** Text-rich area for per-day or per-trip reminders.
14. **Admin Dashboard:** High-level platform analytics (User trends, Top Cities).

---

## Database Architecture (PostgreSQL)
- **Users:** UUID, email, password_hash, name, bio.
- **Trips:** UUID, user_id (FK), title, start_date, end_date, cover_url.
- **Stops:** UUID, trip_id (FK), city_name, sequence, arrival, departure.
- **Activities:** UUID, stop_id (FK), name, cost, category, scheduled_time.
- **Expenses:** UUID, trip_id (FK), category, amount, date.
- **Checklist:** UUID, trip_id (FK), item, category_id, is_packed.

---

## Team Work Division

### 1. Anuj Kondawar (Lead & Integration)
- Setup React/Node environment and state management.
- Implement Auth flow and Itinerary Reordering logic.
- Final integration and deployment.

### 2. Chirag Bhayal (Frontend & UX)
- Implement "Premium Voyage" design system.
- Build all 14 screens exactly as per wireframe layouts.
- Handle all SVG implementations and micro-animations.

### 3. Raghav Dadhich (Backend & API)
- Build RESTful endpoints for Trips, Stops, and Budget.
- Implement validation and error handling.
- Public URL sharing logic.

### 4. Tirupati Behera (Database & Business Logic)
- PostgreSQL schema implementation and data migrations.
- Budget calculation engine and analytics processing.
- Data seeding for Cities/Activities.

---

## 8-Hour Execution Roadmap
- **Hour 1:** Environment setup & DB Schema.
- **Hours 2-3:** Auth & Dashboard (Banner/Search).
- **Hours 4-5:** Itinerary Builder & Search Flow.
- **Hours 6-7:** Budgeting, Checklist, & Shared View.
- **Hour 8:** Polish, Audit, and Documentation.
