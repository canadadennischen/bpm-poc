'use strict';

// ── 環境變數 ─────────────────────────────────────────────
require('dotenv').config();

// 強制台灣/台北時區 (GMT+8)，避免雲端 UTC 時差問題
process.env.TZ = 'Asia/Taipei';

const express = require('express');
const session = require('express-session');
const path    = require('path');

const authRouter      = require('./routes/auth');
const { errorHandler } = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_please_change',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge:   60 * 60 * 1000  // 1 hour
  }
}));

// ── Static files (Frontend) ───────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ────────────────────────────────────────────────
app.use('/api/v1/auth', authRouter);

// Fallback: SPA-style redirect to Login for unknown routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});

// ── Global Error Handler ──────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[BPM] Server running on http://localhost:${PORT}`);
    console.log(`[BPM] TZ = ${process.env.TZ}`);
  });
}

module.exports = app;  // export for Jest/Supertest
