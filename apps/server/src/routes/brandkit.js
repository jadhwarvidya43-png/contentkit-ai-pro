const express = require('express');
const router = express.Router();
const BrandKit = require('../models/BrandKit');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/default', async (req, res) => {
  try {
    const kit = await BrandKit.findOne({ workspaceId: 'default' });
    if (!kit) {
      return res.status(404).json({ message: 'No brand kit found' });
    }
    res.json(kit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const { workspaceId, brandName, logoUrl, primaryColor, secondaryColor, writingStyle, mission, targetAudience, products } = req.body;
  try {
    let kit = await BrandKit.findOne({ workspaceId: workspaceId || 'default' });
    if (kit) {
      kit.brandName = brandName;
      kit.logoUrl = logoUrl;
      kit.primaryColor = primaryColor;
      kit.secondaryColor = secondaryColor;
      kit.writingStyle = writingStyle;
      kit.mission = mission;
      kit.targetAudience = targetAudience;
      kit.products = products;
      await kit.save();
    } else {
      kit = await BrandKit.create({
        workspaceId: workspaceId || 'default',
        brandName,
        logoUrl,
        primaryColor,
        secondaryColor,
        writingStyle,
        mission,
        targetAudience,
        products
      });
    }
    res.status(200).json(kit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
