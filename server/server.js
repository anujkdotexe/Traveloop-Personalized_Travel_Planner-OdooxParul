const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [CLIENT_ORIGIN]
    : ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes  = require('./routes/authRoutes');
const tripRoutes  = require('./routes/tripRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth',  authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/admin', adminRoutes);

// ── Health Check (used by deployment platforms & PM2) ─────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Traveloop API',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()) + 's',
    timestamp: new Date().toISOString(),
    node: process.version,
  });
});

// ── Root ──────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'active', service: 'Traveloop API', docs: '/api/health' });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: `Route ${req.method} ${req.path} not found.` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {  // eslint-disable-line no-unused-vars
  console.error('[Error]', err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ status: 'error', message: err.message || 'Internal server error.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Traveloop API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
});
