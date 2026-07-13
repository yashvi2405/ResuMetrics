require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { pingDB } = require('./db');

// Routes
const authRouter = require('./routes/auth');
const resumeRouter = require('./routes/resume');
const analysisRouter = require('./routes/analysis');
const dashboardRouter = require('./routes/dashboard');
const prepRouter = require('./routes/prep');
const chatRouter = require('./routes/chat');
const scheduleRouter = require('./routes/schedule');

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173',
  // Production
  'https://resu-metrics.vercel.app',
];

const extraOrigins = config.CORS_ALLOWED_ORIGINS
  ? config.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = [...defaultOrigins, ...extraOrigins];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static uploads ───────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.resolve(config.UPLOAD_DIR)));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/prep', prepRouter);
app.use('/api/chat', chatRouter);
app.use('/api/schedule', scheduleRouter);

// ─── Root & health endpoints ──────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ message: 'Resume Insight Tool API', status: 'running', version: '1.0.0' });
});

app.get('/health', async (_req, res) => {
  try {
    await pingDB();
    res.json({ status: 'healthy', database: 'connected' });
  } catch (err) {
    res.json({ status: 'unhealthy', database: `disconnected: ${err.message}` });
  }
});

app.get('/api/health', async (_req, res) => {
  try {
    await pingDB();
    res.json({ status: 'healthy', database: 'connected', api: 'working' });
  } catch (err) {
    res.json({ status: 'unhealthy', database: `disconnected: ${err.message}`, api: 'working' });
  }
});

app.get('/api', (_req, res) => {
  res.json({ message: 'Resume Insight Tool API', version: '1.0.0' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ detail: err.message || 'Internal server error' });
});

module.exports = app;
