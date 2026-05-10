# Traveloop — Deployment Guide

> Complete guide for deploying Traveloop to production on any platform.

---

## Architecture Overview

```
Internet → [Nginx / Reverse Proxy]
                ├── / (static)      → React build (dist/)
                └── /api/*          → Express API (Node.js)
                                          └── PostgreSQL DB
```

---

## 1. Local Development (Quick Start)

```bash
# Clone
git clone https://github.com/<org>/OdooxParul.git && cd OdooxParul

# Install all deps
cd server && npm install && cd ../client && npm install && cd ..

# Configure
cp server/.env.example server/.env
# Edit server/.env: set DB_* and JWT_SECRET

# Seed database
node server/db/seed.js

# Start both (two terminals)
cd server && npm run dev    # → http://localhost:5000
cd client && npm run dev    # → http://localhost:5173
```

---

## 2. Production Build

### Build the React SPA

```bash
cd client
npm run build
# Output: client/dist/
```

### Verify the build

```bash
cd client
npm run preview   # serves dist/ locally on port 4173
```

---

## 3. Environment Variables (Production)

Create `server/.env` with production values:

```env
# Server
PORT=5000
NODE_ENV=production

# PostgreSQL — use connection string OR individual fields
DB_URL=postgresql://user:password@host:5432/traveloop_prod
# OR individual:
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=traveloop_prod
DB_USER=traveloop_user
DB_PASSWORD=your_strong_password

# JWT — generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_64_char_minimum_random_secret

# CORS
CLIENT_ORIGIN=https://traveloop.yourdomain.com

# Currency API (no key needed — Frankfurter is free)
# Optional: override if using a different exchange rate API
# EXCHANGE_API_URL=https://api.frankfurter.app/latest
```

---

## 4. Deployment Options

### Option A — Render.com (Recommended for Hackathon)

**Easiest zero-config deployment.**

#### Step 1: Deploy PostgreSQL
1. Render Dashboard → New → PostgreSQL
2. Name: `traveloop-db`, Plan: Free
3. Copy the **Internal Database URL**

#### Step 2: Deploy Backend
1. New → Web Service → Connect GitHub repo
2. **Root Directory**: `server`
3. **Build Command**: `npm install`
4. **Start Command**: `node server.js`
5. Add environment variables:
   ```
   DB_URL=<internal database URL from step 1>
   JWT_SECRET=<generate with crypto.randomBytes(64).toString('hex')>
   CLIENT_ORIGIN=https://traveloop-client.onrender.com
   NODE_ENV=production
   PORT=5000
   ```
6. Deploy → note the URL: `https://traveloop-api.onrender.com`

#### Step 3: Deploy Frontend
1. New → Static Site → Connect same GitHub repo
2. **Root Directory**: `client`
3. **Build Command**: `npm install && npm run build`
4. **Publish Directory**: `dist`
5. Add environment variable:
   ```
   VITE_API_URL=https://traveloop-api.onrender.com/api
   ```
6. Deploy

#### Step 4: Run Database Seed
In Render Shell for the backend service:
```bash
node db/seed.js
```

---

### Option B — Railway.app

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login

# In project root
railway init
railway up

# Link PostgreSQL
railway add --plugin postgresql
railway variables set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
railway variables set NODE_ENV=production
```

---

### Option C — VPS / Ubuntu Server (DigitalOcean, AWS EC2, etc.)

#### System Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### Configure PostgreSQL

```bash
sudo -u postgres psql
```

```sql
CREATE USER traveloop WITH PASSWORD 'your_strong_password';
CREATE DATABASE traveloop_prod OWNER traveloop;
GRANT ALL PRIVILEGES ON DATABASE traveloop_prod TO traveloop;
\q
```

#### Deploy Application

```bash
# Clone repo
cd /var/www
sudo git clone https://github.com/<org>/OdooxParul.git traveloop
cd traveloop

# Install dependencies
cd server && npm install --production
cd ../client && npm install && npm run build

# Configure environment
sudo cp server/.env.example server/.env
sudo nano server/.env   # Fill in production values

# Run DB migrations + seed
node server/db/seed.js
```

#### Configure Nginx

```nginx
# /etc/nginx/sites-available/traveloop
server {
    listen 80;
    server_name traveloop.yourdomain.com;

    # Serve React build
    root /var/www/traveloop/client/dist;
    index index.html;

    # API reverse proxy
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # React Router fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 256;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/traveloop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Start with PM2

```bash
cd /var/www/traveloop/server

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'traveloop-api',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
    }
  }]
};
EOF

pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup   # Follow the displayed command to enable on reboot
```

#### SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d traveloop.yourdomain.com
# Auto-renewal is set up by default
```

---

### Option D — Docker (Recommended for Teams)

#### Dockerfile (server)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

#### Dockerfile (client)

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

#### docker-compose.yml

```yaml
version: '3.8'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: traveloop
      POSTGRES_USER: traveloop
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U traveloop"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ./server
    environment:
      NODE_ENV: production
      PORT: 5000
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: traveloop
      DB_USER: traveloop
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      CLIENT_ORIGIN: ${CLIENT_ORIGIN}
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "5000:5000"

  client:
    build:
      context: ./client
      args:
        VITE_API_URL: ${VITE_API_URL}
    ports:
      - "80:80"
    depends_on:
      - api

volumes:
  pgdata:
```

```bash
# Deploy
cp server/.env.example .env
# Edit .env with production values

docker-compose up -d --build

# Seed the database
docker-compose exec api node db/seed.js
```

---

## 5. Post-Deployment Checklist

```
[ ] Server returns 200 on GET /api/health
[ ] POST /api/auth/login works for demo@traveloop.com / Demo1234!
[ ] POST /api/auth/login works for admin@traveloop.com / Admin1234!
[ ] All 14 screens load without console errors
[ ] Currency conversion shows INR equivalent on activity cards
[ ] Budget page shows live rates banner
[ ] Admin dashboard accessible only to admin role
[ ] /shared/:id accessible without login
[ ] HTTPS certificate valid (padlock in browser)
[ ] .env not present in git history (git log --all -- server/.env)
[ ] Database has no sensitive seed data in production
```

---

## 6. Currency API (Frankfurter)

Traveloop uses **Frankfurter** (https://api.frankfurter.app) for live exchange rates:

- **No API key required**
- **Rate source**: European Central Bank (ECB)
- **Update frequency**: Daily (business days)
- **Rate limit**: None for moderate use
- **Caching**: Client caches rates in localStorage for 1 hour

The app gracefully falls back to hardcoded approximate rates if the API is unreachable.

```bash
# Test the endpoint
curl "https://api.frankfurter.app/latest?from=INR&to=USD,AED,EUR,GBP,JPY"
```

---

## 7. Monitoring & Maintenance

```bash
# View API logs
pm2 logs traveloop-api

# Monitor CPU/memory
pm2 monit

# Restart after code update
cd /var/www/traveloop
git pull origin main
cd server && npm install --production
pm2 restart traveloop-api

# Update client
cd client && npm install && npm run build
# Nginx serves dist/ automatically
```

---

## 8. Backup PostgreSQL

```bash
# Daily backup script
pg_dump -U traveloop -h localhost traveloop_prod > backup_$(date +%Y%m%d).sql

# Restore
psql -U traveloop -h localhost traveloop_prod < backup_20240610.sql
```

---

## 9. Performance Notes

| Concern | Solution |
|---------|---------|
| React bundle size | Vite tree-shaking; Chart.js auto-imported |
| Exchange rate fetches | 1-hour localStorage cache |
| DB queries | Indexes on `trips.user_id`, `activities.stop_id` |
| Static assets | Nginx gzip compression enabled |
| Node.js clustering | PM2 `exec_mode: cluster` uses all CPU cores |

---

## Demo Credentials

| Role | Email | Password |
|------|-------|---------|
| Regular User | demo@traveloop.com | Demo1234! |
| Admin | admin@traveloop.com | Admin1234! |
