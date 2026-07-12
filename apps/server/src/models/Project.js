const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please add a project title']
  },
  inputType: {
    type: String,
    required: true,
    enum: ['youtube', 'upload', 'website', 'text']
  },
  inputData: {
    type: String,
    required: true
  },
  extractedText: {
    type: String,
    default: ''
  },
  generatedContent: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  },
  folder: {
    type: String,
    default: 'Socials'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);