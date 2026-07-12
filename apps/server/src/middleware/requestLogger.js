'use strict';

/**
 * Structured Request Logger Middleware — ContentKit AI Pro
 *
 * Emits one JSON line per request to stdout after the response finishes.
 * Fields: method, url, status, responseTimeMs, correlationId, userId, ip,
 *         contentLength, timestamp.
 *
 * Usage:
 *   const { requestLogger } = require('./requestLogger');
 *   app.use(requestLogger);
 */

/**
 * Express middleware — logs structured JSON for every completed request.
 */
const requestLogger = (req, res, next) => {
  const startHr = process.hrtime.bigint();

  // Hook into the 'finish' event so we capture the final status code.
  res.on('finish', () => {
    const durationNs = process.hrtime.bigint() - startHr;
    const responseTimeMs = Number(durationNs) / 1e6;

    const entry = {
      timestamp: new Date().toISOString(),
      level: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      responseTimeMs: Math.round(responseTimeMs * 100) / 100,
      correlationId: req.correlationId || null,
      userId: req.user && req.user._id ? String(req.user._id) : null,
      ip: req.ip || req.socket.remoteAddress || null,
      contentLength: res.get('Content-Length') || null,
      userAgent: req.get('User-Agent') || null,
    };

    process.stdout.write(JSON.stringify(entry) + '\n');
  });

  next();
};

module.exports = { requestLogger };
