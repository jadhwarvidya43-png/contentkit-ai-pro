const express = require('express');
const router = express.Router();
const Workflow = require('../models/Workflow');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const list = await Workflow.find({ workspaceId: 'default' });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, nodes, edges, isActive, cronSchedule } = req.body;
  try {
    let workflow = await Workflow.create({
      workspaceId: 'default',
      name,
      nodes,
      edges,
      isActive,
      cronSchedule
    });
    res.status(200).json(workflow);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Workflow.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workflow removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
