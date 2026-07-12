const Job = require('../../models/Job');
const queueService = require('../queueService');
const { eventBus, EVENT_NAMES } = require('../eventBus');

async function schedulePost({ projectId, platform, content, scheduledFor, workspaceId, createdBy }) {
  if (!scheduledFor) {
    throw new Error('scheduledFor date is required');
  }
  if (new Date(scheduledFor) < new Date()) {
    throw new Error('scheduledFor must be in the future');
  }

  const job = await queueService.enqueue({
    type: 'publishing',
    payload: {
      projectId,
      platform,
      content,
      scheduledFor
    },
    workspaceId,
    createdBy,
    priority: 1,
    scheduledFor: new Date(scheduledFor)
  });

  return {
    jobId: job._id,
    projectId,
    platform,
    scheduledFor: job.scheduledFor,
    status: job.status
  };
}

async function getScheduledPosts(workspaceId) {
  const posts = await Job.find({
    workspaceId,
    type: 'publishing',
    status: { $in: ['queued', 'processing'] }
  })
    .sort({ scheduledFor: 1 })
    .lean();

  return posts.map((job) => ({
    jobId: job._id,
    projectId: job.payload.projectId,
    platform: job.payload.platform,
    content: job.payload.content,
    scheduledFor: job.scheduledFor,
    status: job.status,
    createdAt: job.createdAt
  }));
}

async function cancelScheduledPost(jobId) {
  const job = await queueService.cancelJob(jobId);
  if (!job) {
    throw new Error(`Scheduled post not found or already processed: ${jobId}`);
  }
  return {
    jobId: job._id,
    status: job.status,
    cancelledAt: job.completedAt
  };
}

// Register the publishing job handler to emit CONTENT_PUBLISHED
const { registerJobHandler } = require('../queueService');
registerJobHandler('publishing', async (job) => {
  console.log(`[Publishing] Publishing to ${job.payload.platform} for project ${job.payload.projectId}`);

  // Actual platform API integrations would go here
  const result = {
    published: true,
    platform: job.payload.platform,
    publishedAt: new Date().toISOString()
  };

  eventBus.emit(EVENT_NAMES.CONTENT_PUBLISHED, {
    projectId: job.payload.projectId,
    platform: job.payload.platform,
    workspaceId: job.workspaceId,
    userId: job.createdBy
  });

  return result;
});

module.exports = {
  schedulePost,
  getScheduledPosts,
  cancelScheduledPost
};
