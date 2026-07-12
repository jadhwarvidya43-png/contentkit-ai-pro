const mongoose = require('mongoose');

const vectorDocumentSchema = new mongoose.Schema({
  workspaceId: {
    type: String,
    required: true,
    index: true
  },
  sourceType: {
    type: String,
    required: true,
    enum: ['project', 'brandkit', 'workflow', 'content', 'document'],
    index: true
  },
  sourceId: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  tokens: {
    type: [String],
    default: []
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

vectorDocumentSchema.index({ workspaceId: 1, sourceType: 1 });
vectorDocumentSchema.index({ sourceId: 1 }, { unique: true });

module.exports = mongoose.model('VectorDocument', vectorDocumentSchema);
