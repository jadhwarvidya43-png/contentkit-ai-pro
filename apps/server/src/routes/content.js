const express = require('express');
const router = express.Router();
const multer = require('multer');
const storageService = require('../services/storageService');
const queueService = require('../services/queueService');
const { requireAuth } = require('../middleware/auth');

// Setup multer for memory storage (we will pipe it to MinIO)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Upload endpoint
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    // 1. Store in MinIO
    const { objectName, url } = await storageService.uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    
    // 2. Queue for processing (transcription -> ai generation)
    // Here we'd link it to the user's workspace, etc.
    const job = await queueService.enqueue({
      type: 'content-generation',
      workspaceId: req.body.workspaceId || null,
      createdBy: req.user.id,
      payload: {
        objectName,
        url,
        mimetype: req.file.mimetype,
        originalName: req.file.originalname,
        options: req.body.options ? JSON.parse(req.body.options) : {}
      },
      priority: 10
    });
    
    res.status(201).json({
      success: true,
      message: 'File uploaded and queued for processing',
      mediaUrl: url,
      jobId: job.id
    });
  } catch (err) {
    console.error('[Upload API] Error:', err);
    res.status(500).json({ error: 'Failed to process upload' });
  }
});

// Stream media back
router.get('/media/:objectName', requireAuth, async (req, res) => {
  try {
    const stream = await storageService.getFileStream(req.params.objectName);
    stream.pipe(res);
  } catch (err) {
    res.status(404).json({ error: 'Media not found' });
  }
});

module.exports = router;
