const mongoose = require('mongoose');

const brandKitSchema = new mongoose.Schema({
  workspaceId: {
    type: String,
    required: true,
    default: 'default',
    index: true
  },
  brandName: {
    type: String,
    required: [true, 'Please add a brand name']
  },
  logoUrl: {
    type: String,
    default: ''
  },
  primaryColor: {
    type: String,
    default: '#6366f1'
  },
  secondaryColor: {
    type: String,
    default: '#a855f7'
  },
  fonts: {
    title: { type: String, default: 'Outfit' },
    body: { type: String, default: 'Inter' }
  },
  writingStyle: {
    type: String,
    default: ''
  },
  mission: {
    type: String,
    default: ''
  },
  targetAudience: {
    type: String,
    default: ''
  },
  products: [{
    name: { type: String, required: true },
    description: { type: String, required: true },
    cta: { type: String, default: '' }
  }],
  favoriteTags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BrandKit', brandKitSchema);
