'use strict';

const crypto = require('crypto');

class AICache {
  constructor() {
    this._store = new Map();
  }

  get(key) {
    const entry = this._store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value, ttlMs = 300000) {
    this._store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  clear() {
    this._store.clear();
  }

  get size() {
    this._evictExpired();
    return this._store.size;
  }

  _evictExpired() {
    const now = Date.now();
    for (const [key, entry] of this._store) {
      if (now > entry.expiresAt) this._store.delete(key);
    }
  }
}

/**
 * Generates a deterministic cache key by hashing prompt + model with SHA-256.
 */
function generateCacheKey(prompt, model) {
  const input = `${model}::${prompt}`;
  return crypto.createHash('sha256').update(input).digest('hex');
}

module.exports = { AICache, generateCacheKey };
