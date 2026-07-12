const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  workspaceId: {
    type: String,
    required: true,
    index: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['twitter', 'linkedin', 'blog', 'newsletter', 'instagram', 'youtube', 'other']
  },
  views: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  engagementRate: {
    type: Number,
    default: 0
  },
  recordedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

analyticsSchema.index({ workspaceId: 1, recordedAt: -1 });
analyticsSchema.index({ projectId: 1, platform: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
