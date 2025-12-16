// Express app setup (ESM)
import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import urlShortenerRouter from './routes/index.js';

const app = express();

// Development request logger (lightweight)
app.use((req, res, next) => {
  console.log('REQ', req.method, req.path);
  next();
});

// CORS/X-Origin Middleware
if (!process.env.DISABLE_XORIGIN) {
  app.use((req, res, next) => {
    const allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    const origin = req.headers.origin || '*';
    if (!process.env.XORIG_RESTRICT || allowedOrigins.includes(origin)) {
      console.log(origin);
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    }
    next();
  });
}

// Also expose mappings at app-level to ensure availability
import UrlShortener from './api/url-shortener.js';
app.get('/api/mappings', (req, res) => {
  const us = new UrlShortener(req);
  res.json(us.getAllMappings());
});

// Static files
app.use('/public', express.static(path.join(process.cwd(), 'public')));

// Debug route to inspect request host/port behavior
app.get('/_debug/req', (req, res) => {
  res.json({
    host_get: req.get && typeof req.get === 'function' ? req.get('host') : null,
    headers_host: req.headers && req.headers.host,
    hostname: req.hostname,
    socket_localPort: req.socket && req.socket.localPort,
    protocol: req.protocol
  });
});

// Home page
app.route('/').get((req, res) => {
  res.sendFile(path.join(process.cwd(), 'views/index.html'));
});

// URL Shortener routes (mounted after specific app-level routes)
app.use('/', urlShortenerRouter);

// 404 handler - respond with JSON for API requests, text for browsers
app.use((req, res, next) => {
  const acceptJson = req.headers['accept'] && req.headers['accept'].includes('application/json');
  const isApi = req.path.startsWith('/api');
  const status = 404;
  if (acceptJson || isApi || req.xhr) {
    return res.status(status).json({ error: 'Not found' });
  }
  res.status(status).type('txt').send('Not found');
});

// Error handler - structured logging and content negotiation
app.use((err, req, res, next) => {
  // Always log the error server-side
  console.error(err && err.stack ? err.stack : err);

  const status = err && err.status ? err.status : 500;
  const message = err && err.message ? err.message : 'SERVER ERROR';

  const acceptJson = req.headers['accept'] && req.headers['accept'].includes('application/json');
  const isApi = req.path.startsWith('/api') || req.xhr;

  // In production hide stack traces; show them in development
  const showStack = process.env.NODE_ENV !== 'production';

  if (acceptJson || isApi) {
    const payload = { error: message };
    if (showStack && err && err.stack) payload.stack = err.stack;
    return res.status(status).json(payload);
  }

  // Fallback to plain text for browser requests
  let text = message;
  if (showStack && err && err.stack) text += '\n' + err.stack;
  res.status(status).type('txt').send(text);
});

export default app;
