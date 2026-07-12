const BrandKit = require('../../models/BrandKit');
const { eventBus, EVENT_NAMES } = require('../eventBus');

async function saveBrandKit(data) {
  const { workspaceId = 'default', ...fields } = data;

  const brandKit = await BrandKit.findOneAndUpdate(
    { workspaceId },
    { workspaceId, ...fields },
    { upsert: true, new: true, runValidators: true }
  );

  eventBus.emit(EVENT_NAMES.BRANDKIT_UPDATED, {
    brandKitId: brandKit._id,
    brandName: brandKit.brandName,
    workspaceId: brandKit.workspaceId,
    userId: data.userId || null
  });

  return brandKit;
}

async function getBrandKit(workspaceId) {
  const brandKit = await BrandKit.findOne({ workspaceId });
  if (!brandKit) {
    throw new Error(`BrandKit not found for workspace: ${workspaceId}`);
  }
  return brandKit;
}

async function deleteBrandKit(id) {
  const brandKit = await BrandKit.findByIdAndDelete(id);
  if (!brandKit) {
    throw new Error(`BrandKit not found: ${id}`);
  }
  return brandKit;
}

module.exports = {
  saveBrandKit,
  getBrandKit,
  deleteBrandKit
};
