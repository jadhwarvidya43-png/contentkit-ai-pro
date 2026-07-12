const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  translateContent
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

router.post('/translate', translateContent);

router.route('/')
  .post(createProject)
  .get(getProjects);

router.route('/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

module.exports = router;