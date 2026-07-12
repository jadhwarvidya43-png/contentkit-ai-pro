const { Queue, Worker, QueueEvents } = require('bullmq');
const Redis = require('ioredis');
const { eventBus, EVENT_NAMES } = require('./eventBus');
const config = require('../config');

// Using ioredis since BullMQ requires it
// We connect to localhost default port unless overridden in config
const redisConnection = new Redis(config.queue?.redisUrl || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const QUEUE_NAME = 'contentkit-jobs';

const jobQueue = new Queue(QUEUE_NAME, { connection: redisConnection });
const queueEvents = new QueueEvents(QUEUE_NAME, { connection: redisConnection });

const { generateCampaign } = require('./ai/gateway');

const jobHandlers = {};

function registerJobHandler(type, handler) {
  jobHandlers[type] = handler;
}

// Built-in handlers — log-only stubs for types that will be wired to real processors later
registerJobHandler('content-generation', async (job) => {
  console.log(`[Queue] Processing content-generation job ${job.id}`);
  const payload = job.data.payload;
  
  // Simulated text extraction for now (in production, we'd use Whisper or text extraction on payload.objectName)
  const sourceText = `Simulated extracted text from ${payload.originalName}`;

  // Call the AI Gateway
  const result = await generateCampaign({
    sourceText,
    brandKit: payload.options?.brandKit || { name: 'Default Brand', style: 'Professional' },
    model: payload.options?.model || 'gpt-4o',
    targetLanguage: payload.options?.language || 'en',
    stream: false,
    outputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        htmlContent: { type: 'string', description: 'HTML formatted content' }
      },
      required: ['title', 'htmlContent']
    }
  });

  return { 
    status: 'generated',
    content: result.content,
    metadata: result.metadata
  };
});

registerJobHandler('publishing', async (job) => {
  console.log(`[Queue] Processing publishing job ${job.id}`);
  return { status: 'published', platform: job.data.payload?.platform };
});

registerJobHandler('analytics-sync', async (job) => {
  console.log(`[Queue] Processing analytics-sync job ${job.id}`);
  return { status: 'synced' };
});

registerJobHandler('vector-index', async (job) => {
  console.log(`[Queue] Processing vector-index job ${job.id}`);
  return { status: 'indexed' };
});

async function enqueue({ type, payload, workspaceId, createdBy, priority = 0, scheduledFor = null }) {
  const options = {
    priority: priority || 0,
    attempts: config.queue?.maxRetries || 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  };

  if (scheduledFor) {
    options.delay = new Date(scheduledFor).getTime() - Date.now();
  }

  const job = await jobQueue.add(
    type,
    { type, payload, workspaceId, createdBy },
    options
  );

  console.log(`[Queue] Enqueued job ${job.id} type=${type} priority=${priority}`);
  return job;
}

function startWorker() {
  console.log(`[Queue] Worker started, listening to BullMQ queue: ${QUEUE_NAME}`);
  
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { type } = job.name; // job.name is the type in BullMQ
      const handler = jobHandlers[job.name] || jobHandlers[job.data.type];
      
      if (!handler) {
        throw new Error(`No handler registered for job type: ${job.name || job.data.type}`);
      }
      
      return await handler(job);
    },
    {
      connection: redisConnection,
      concurrency: config.queue?.concurrency || 5,
    }
  );

  worker.on('completed', (job, result) => {
    eventBus.emit(EVENT_NAMES.AI_JOB_COMPLETED, {
      jobId: job.id,
      type: job.data.type,
      createdBy: job.data.createdBy,
      workspaceId: job.data.workspaceId,
      result
    });
    console.log(`[Queue] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Queue] Job ${job.id} failed: ${err.message}`);
    // If attemptsMade >= opts.attempts, it means it's permanently failed
    if (job.attemptsMade >= (job.opts.attempts || 3)) {
      eventBus.emit(EVENT_NAMES.AI_JOB_FAILED, {
        jobId: job.id,
        type: job.data.type,
        createdBy: job.data.createdBy,
        workspaceId: job.data.workspaceId,
        error: err.message
      });
    }
  });

  return function stopWorker() {
    console.log('[Queue] Worker stopped');
    worker.close();
  };
}

async function getJobStatus(jobId) {
  const job = await jobQueue.getJob(jobId);
  if (!job) return null;
  const state = await job.getState();
  return {
    _id: job.id,
    type: job.name,
    status: state, // waiting, active, completed, failed, delayed
    result: job.returnvalue,
    error: job.failedReason,
  };
}

async function cancelJob(jobId) {
  const job = await jobQueue.getJob(jobId);
  if (job) {
    const state = await job.getState();
    if (state === 'waiting' || state === 'delayed') {
      await job.remove();
      console.log(`[Queue] Job ${jobId} removed/cancelled`);
    }
  }
  return job;
}

module.exports = {
  enqueue,
  processNextJob: () => {}, // No longer used, BullMQ worker handles it automatically
  startWorker,
  getJobStatus,
  cancelJob,
  registerJobHandler,
  jobQueue // export the queue instance for bull-board
};
