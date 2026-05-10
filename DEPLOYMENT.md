# Traveloop Deployment Guide

This guide provides step-by-step instructions for deploying the Traveloop full-stack application to production environments.

## 1. Database Deployment (Render)
1. Create a new **PostgreSQL** instance on Render.
2. Set the "Database" name to `traveloop_db`.
3. Capture the **External Database URL**.

## 2. Backend Deployment (Render)
1. Create a new **Web Service** on Render.
2. Connect your GitHub repository.
3. **Build Command**: `cd server && npm install`
4. **Start Command**: `cd server && node server.js`
5. **Environment Variables**:
   - `PORT`: 5000 (or as needed)
   - `DATABASE_URL`: Your captured Postgres URL.
   - `JWT_SECRET`: A long, random string.
   - `NODE_ENV`: `production`

## 3. Frontend Deployment (Vercel)
1. Import your repository into **Vercel**.
2. **Framework Preset**: Vite.
3. **Root Directory**: `client`
4. **Environment Variables**:
   - `VITE_API_URL`: Your Render backend URL.
5. **SPA Configuration**: Ensure `vercel.json` is present in the `client/` root to handle SPA routing.

### Example `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://your-render-backend.com/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 4. Post-Deployment Verification
1. **Initialize Schema**: Run `node server/db/runSchema.js` targeting the production DB.
2. **Seed Data**: Run `node server/db/seed.js` to populate the platform.
3. **SSL**: Verify that both the frontend and backend are served over HTTPS.
4. **Health Check**: Visit `https://your-backend.com/api/health` to confirm the server is responsive.

---

## Maintenance & Logs
- **Backend Logs**: Use `render logs` to monitor API health.
- **Frontend Logs**: Monitor the Vercel dashboard for build failures.
- **DB Backups**: Render provides automatic daily backups on paid tiers.
