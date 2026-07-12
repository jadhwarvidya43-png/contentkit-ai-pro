'use strict';

/**
 * Sliding-window Rate Limiter Middleware — ContentKit AI Pro
 *
 * Uses an in-memory Map to track request counts per IP + route within
 * a configurable time window.  When the limit is exceeded the client
 * receives a 429 with a Retry-After header.
 *
 * Usage:
 *   const { createRateLimiter } = require('./rateLimiter');
 *   router.use(createRateLimiter({ windowMs: 60_000, maxRequests: 100 }));
 */

/* ------------------------------------------------------------------ */
/*  Internal store — Map<string, { count, windowStart }>              */
/* ------------------------------------------------------------------ */

const store = new Map();

/**
 * Periodically purge entries whose window has expired so the Map does
 * not grow unbounded.  Runs every 60 s by default.
 */
const CLEANUP_INTERVAL_MS = 60_000;
let cleanupTimer = null;

const startCleanup = (windowMs) => {
  if (cleanupTimer) return; // already running
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now - entry.windowStart >= windowMs) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // Allow the Node process to exit without waiting for this timer
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
};

/* ------------------------------------------------------------------ */
/*  Factory                                                           */
/* ------------------------------------------------------------------ */

/**
 * Create an Express middleware that enforces a sliding-window rate limit.
 *
 * @param {Object}  opts
 * @param {number}  opts.windowMs    - Length of the window in milliseconds (default 60 000).
 * @param {number}  opts.maxRequests - Maximum number of requests allowed per window (default 100).
 * @returns {Function} Express middleware
 */
const createRateLimiter = ({ windowMs = 60_000, maxRequests = 100 } = {}) => {
  startCleanup(windowMs);

  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const route = req.baseUrl + req.path;
    const key = `${ip}::${route}`;
    const now = Date.now();

    let entry = store.get(key);

    // If no record or the window has expired, start a fresh window.
    if (!entry || now - entry.windowStart >= windowMs) {
      entry = { count: 1, windowStart: now };
      store.set(key, entry);
      setRateLimitHeaders(res, maxRequests, maxRequests - 1, windowMs);
      return next();
    }

    entry.count += 1;

    if (entry.count > maxRequests) {
      const retryAfterSec = Math.ceil(
        (entry.windowStart + windowMs - now) / 1000
      );
      setRateLimitHeaders(res, maxRequests, 0, windowMs);
      res.set('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfterSeconds: retryAfterSec,
      });
    }

    setRateLimitHeaders(res, maxRequests, maxRequests - entry.count, windowMs);
    return next();
  };
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const setRateLimitHeaders = (res, limit, remaining, windowMs) => {
  res.set('X-RateLimit-Limit', String(limit));
  res.set('X-RateLimit-Remaining', String(Math.max(remaining, 0)));
  res.set('X-RateLimit-Reset', String(Math.ceil((Date.now() + windowMs) / 1000)));
};

module.exports = { createRateLimiter };
