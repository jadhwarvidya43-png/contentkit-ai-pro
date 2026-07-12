const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  workspaceId: {
    type: String,
    required: true,
    default: 'default',
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please add a workflow name']
  },
  nodes: {
    type: Array,
    default: []
  },
  edges: {
    type: Array,
    default: []
  },
  isActive: {
    type: Boolean,
    default: false
  },
  cronSchedule: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Workflow', workflowSchema);
