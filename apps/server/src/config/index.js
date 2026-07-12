'use strict';

/**
 * Centralized Configuration Layer — ContentKit AI Pro
 *
 * Reads all configuration from process.env and exposes a deeply-frozen,
 * immutable config object.  Every key has a sensible default so the
 * application can boot in development without a .env file.
 *
 * Usage:
 *   const config = require('./config');
 *   console.log(config.app.port);
 */

const path = require('path');

/* ------------------------------------------------------------------ */
/*  Helper: convert string env vars to the appropriate JS type        */
/* ------------------------------------------------------------------ */

const toInt = (val, fallback) => {
  const parsed = parseInt(val, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBool = (val, fallback) => {
  if (val === undefined || val === null || val === '') return fallback;
  return val === 'true' || val === '1';
};

const toList = (val, fallback) => {
  if (!val || typeof val !== 'string') return fallback;
  return val.split(',').map((s) => s.trim()).filter(Boolean);
};

/* ------------------------------------------------------------------ */
/*  Build config object                                               */
/* ------------------------------------------------------------------ */

const config = {
  /* -------- Application ------------------------------------------- */
  app: {
    port: toInt(process.env.PORT, 5000),
    env: process.env.NODE_ENV || 'development',
    name: process.env.APP_NAME || 'ContentKit AI Pro',
  },

  /* -------- Database ---------------------------------------------- */
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/contentkitai',
    options: {
      maxPoolSize: toInt(process.env.DB_MAX_POOL_SIZE, 10),
      minPoolSize: toInt(process.env.DB_MIN_POOL_SIZE, 2),
      serverSelectionTimeoutMS: toInt(process.env.DB_SERVER_SELECTION_TIMEOUT_MS, 5000),
      socketTimeoutMS: toInt(process.env.DB_SOCKET_TIMEOUT_MS, 45000),
      autoIndex: toBool(process.env.DB_AUTO_INDEX, process.env.NODE_ENV !== 'production'),
    },
  },

  /* -------- AI / LLM providers ------------------------------------ */
  ai: {
    providers: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        baseUrl: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
      },
      google: {
        apiKey: process.env.GOOGLE_AI_API_KEY || '',
      },
    },
    defaultModel: process.env.AI_DEFAULT_MODEL || 'gpt-4o',
    maxRetries: toInt(process.env.AI_MAX_RETRIES, 3),
    timeoutMs: toInt(process.env.AI_TIMEOUT_MS, 60000),
  },

  /* -------- Background job queue ---------------------------------- */
  queue: {
    pollIntervalMs: toInt(process.env.QUEUE_POLL_INTERVAL_MS, 5000),
    maxRetries: toInt(process.env.QUEUE_MAX_RETRIES, 3),
    concurrency: toInt(process.env.QUEUE_CONCURRENCY, 2),
  },

  /* -------- File / asset storage ---------------------------------- */
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local', // 'local' | 's3'
    localDir: process.env.STORAGE_LOCAL_DIR || path.resolve(process.cwd(), 'uploads'),
    s3Bucket: process.env.S3_BUCKET || '',
    s3Region: process.env.S3_REGION || 'us-east-1',
  },

  /* -------- Authentication & security ----------------------------- */
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
    jwtExpire: process.env.JWT_EXPIRE || '15m',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
    bcryptSalt: toInt(process.env.BCRYPT_SALT_ROUNDS, 12),
  },
};

/* ------------------------------------------------------------------ */
/*  Deep-freeze so no runtime code can mutate config                  */
/* ------------------------------------------------------------------ */

const deepFreeze = (obj) => {
  Object.freeze(obj);
  Object.keys(obj).forEach((key) => {
    if (
      obj[key] !== null &&
      typeof obj[key] === 'object' &&
      !Object.isFrozen(obj[key])
    ) {
      deepFreeze(obj[key]);
    }
  });
  return obj;
};

module.exports = deepFreeze(config);
