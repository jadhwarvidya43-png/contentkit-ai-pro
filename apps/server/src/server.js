const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const { startTelemetry } = require('./services/telemetry');
startTelemetry();

// Load environment variables FIRST before requiring config
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = require('./config');
const connectDB = require('./config/db');

// Middleware imports
const { requestLogger } = require('./middleware/requestLogger');
const { correlationId } = require('./middleware/correlationId');
const { createRateLimiter } = require('./middleware/rateLimiter');

// Bull Board imports
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');

// Domain event handlers & Queue
const { registerAllHandlers } = require('./events/handlers');
const queueService = require('./services/queueService');

// Register all domain event handlers
registerAllHandlers();

// Connect to Database
connectDB();

// Setup Bull Board
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/api/v1/admin/queues');
createBullBoard({
  queues: [new BullMQAdapter(queueService.jobQueue)],
  serverAdapter: serverAdapter,
});

const app = express();

// Sentry Request Handler (must be first middleware)
const { Sentry } = require('./services/telemetry');
// app.use(Sentry.Handlers.requestHandler());
// app.use(Sentry.Handlers.tracingHandler());

// Core Middleware
app.use(correlationId);
app.use(requestLogger);

// Global rate limiting
const globalRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 1000 });
app.use(globalRateLimiter);

// Security & Parsing Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Versioned API Routes (v1)
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/projects', require('./routes/projects'));
app.use('/api/v1/brandkit', require('./routes/brandkit'));
app.use('/api/v1/workflows', require('./routes/workflows'));
app.use('/api/v1/content', require('./routes/content'));

// Mount Bull Board
app.use('/api/v1/admin/queues', serverAdapter.getRouter());

// Fallback for legacy routes if front-end hasn't been updated yet
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/brandkit', require('./routes/brandkit'));
app.use('/api/workflows', require('./routes/workflows'));

// Sentry Error Handler (must be before other error handlers)
Sentry.setupExpressErrorHandler(app);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static assets in production
if (config.app.env === 'production') {
  // Set static folder
  app.use(express.static('client/dist'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
}

const PORT = config.app.port;
app.listen(PORT, () => {
  console.log(`Server running in ${config.app.env} mode on port ${PORT}`);
  
  // Start the background job queue worker loop
  queueService.startWorker(config.queue.pollIntervalMs);
});