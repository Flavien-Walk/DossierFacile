'use strict';

const express = require('express');
const cors = require('cors');

const previewRoute = require('./routes/preview');
const checkoutRoute = require('./routes/checkout');
const finalRoute = require('./routes/final');

const app = express();
const PORT = process.env.PORT || 4000;

// CORS — allow frontend origin
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://dossierfacile.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((o) => origin.startsWith(o))) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
  })
);

app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// Routes
app.use('/', previewRoute);
app.use('/', checkoutRoute);
app.use('/', finalRoute);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne.' });
});

app.listen(PORT, () => {
  console.log(`DossierFacile backend running on port ${PORT}`);
});
