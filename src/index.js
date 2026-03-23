'use strict';

// Load .env for local development (no-op in production where env vars are injected)
try { require('dotenv').config(); } catch (_) {}

const express = require('express');
const cors = require('cors');

const previewRoute = require('./routes/preview');
const checkoutRoute = require('./routes/checkout');
const finalRoute = require('./routes/final');

const app = express();
const PORT = process.env.PORT || 4000;

// ── CORS ─────────────────────────────────────────────────────────────────────
// Allow: any *.vercel.app subdomain (covers all preview + production URLs),
//        the configured FRONTEND_URL, and localhost for local dev.
app.use(
  cors({
    origin: (origin, callback) => {
      // No origin = curl / server-to-server / mobile → allow
      if (!origin) return callback(null, true);

      // Any Vercel deployment (production + preview URLs)
      if (origin.endsWith('.vercel.app')) return callback(null, true);

      // Explicitly configured frontend URL
      const configured = process.env.FRONTEND_URL;
      if (configured && origin === configured) return callback(null, true);

      // Local dev
      if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return callback(null, true);
      }

      console.warn('[CORS] Blocked origin:', origin);
      callback(new Error(`CORS: origin not allowed — ${origin}`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// ── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'dev' }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/', previewRoute);
app.use('/', checkoutRoute);
app.use('/', finalRoute);

// ── Error handler ────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[error]', err.message);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Erreur serveur interne.' });
});

app.listen(PORT, () => {
  console.log(`DossierFacile backend running on port ${PORT}`);
  console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || '(not set — all vercel.app allowed)'}`);
});
