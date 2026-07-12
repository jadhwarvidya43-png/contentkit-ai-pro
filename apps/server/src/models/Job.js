const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Job type is required'],
    index: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  workspaceId: {
    type: String,
    required: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'queued',
    index: true
  },
  priority: {
    type: Number,
    default: 0,
    index: true
  },
  scheduledFor: {
    type: Date,
    default: Date.now,
    index: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  error: {
    type: String,
    default: null
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

jobSchema.index({ status: 1, priority: -1, scheduledFor: 1 });

module.exports = mongoose.model('Job', jobSchema);
