'use strict';

/**
 * Correlation ID Middleware — ContentKit AI Pro
 *
 * Generates a UUID v4 for each inbound request (or reuses one supplied
 * by an upstream proxy in the X-Correlation-Id header).  The ID is
 * attached to `req.correlationId` and echoed back as a response header
 * so callers can reference it in support tickets / logs.
 *
 * Usage:
 *   const { correlationId } = require('./correlationId');
 *   app.use(correlationId);
 */

const crypto = require('crypto');

/**
 * Generate a RFC 4122 v4 UUID using the built-in crypto module so there
 * are no external dependencies.
 *
 * @returns {string} UUID v4 string
 */
const generateUuidV4 = () => {
  // Node 14.17+ / 16+ have crypto.randomUUID()
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback for older Node versions
  const bytes = crypto.randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 1
  const hex = bytes.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
};

/**
 * Express middleware — attach a correlation ID to every request.
 */
const correlationId = (req, _res, next) => {
  const id =
    req.headers['x-correlation-id'] ||
    req.headers['x-request-id'] ||
    generateUuidV4();

  req.correlationId = id;
  _res.set('X-Correlation-Id', id);
  next();
};

module.exports = { correlationId };
