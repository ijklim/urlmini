// URL Shortener routes (ESM)
import express from 'express';
import UrlShortener from '../api/url-shortener.js';
const router = express.Router();
console.log('routes/index.js loaded');

// Create new short URL (regex route to capture full URL)
router.get(/^\/new\/(.+)$/, (req, res) => {
  console.log('create: headers.host=', req.headers && req.headers.host, 'hostname=', req.hostname, 'socket.localPort=', req.socket && req.socket.localPort);
  const us = new UrlShortener(req);
  const gen = us.generateUrl(req.params[0]);
  if (gen.error) return res.json(gen);

  // Build short_url here using the current request (ensures correct host and port)
  const protocol = req.protocol || (req.secure ? 'https' : 'http');
  const host = req.get && typeof req.get === 'function' ? req.get('host') : (req.headers && req.headers.host) || req.hostname || 'localhost';
  const short_url = `${protocol}://${host}/${gen.id}`;

  const result = {
    original_url: gen.original_url,
    short_url,
    id: gen.id
  };

  res.json(result);
});

// Return all mappings so the front-end can display them
router.get('/api/mappings', (req, res) => {
  console.log('GET /api/mappings handler');
  const us = new UrlShortener(req);
  const mappings = us.getAllMappings();
  res.json(mappings);
});

// Redirect to original URL
router.get('/:id', (req, res, next) => {
  // Avoid conflict with static and API routes
  if (['public', 'api', 'favicon.ico'].includes(req.params.id)) return next();
  const us = new UrlShortener(req);
  const result = us.getOriginalUrl(req.params.id);
  if (result.error) return res.json(result);
  return res.redirect(result.original_url);
});

export default router;
