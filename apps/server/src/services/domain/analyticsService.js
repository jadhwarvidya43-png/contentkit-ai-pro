const Analytics = require('../../models/Analytics');

async function trackEvent({ projectId, workspaceId, platform, views = 0, clicks = 0, shares = 0 }) {
  const engagementRate = views > 0
    ? parseFloat((((clicks + shares) / views) * 100).toFixed(2))
    : 0;

  const analytics = await Analytics.create({
    projectId,
    workspaceId,
    platform,
    views,
    clicks,
    shares,
    engagementRate,
    recordedAt: new Date()
  });

  return analytics;
}

async function getProjectAnalytics(projectId) {
  const records = await Analytics.find({ projectId })
    .sort({ recordedAt: -1 })
    .lean();

  const totals = records.reduce(
    (acc, r) => {
      acc.views += r.views;
      acc.clicks += r.clicks;
      acc.shares += r.shares;
      return acc;
    },
    { views: 0, clicks: 0, shares: 0 }
  );

  totals.engagementRate = totals.views > 0
    ? parseFloat((((totals.clicks + totals.shares) / totals.views) * 100).toFixed(2))
    : 0;

  return { totals, records, count: records.length };
}

async function getWorkspaceAnalytics(workspaceId, dateRange = {}) {
  const filter = { workspaceId };

  if (dateRange.start || dateRange.end) {
    filter.recordedAt = {};
    if (dateRange.start) filter.recordedAt.$gte = new Date(dateRange.start);
    if (dateRange.end) filter.recordedAt.$lte = new Date(dateRange.end);
  }

  const records = await Analytics.find(filter)
    .sort({ recordedAt: -1 })
    .lean();

  const byPlatform = {};
  for (const record of records) {
    if (!byPlatform[record.platform]) {
      byPlatform[record.platform] = { views: 0, clicks: 0, shares: 0, count: 0 };
    }
    byPlatform[record.platform].views += record.views;
    byPlatform[record.platform].clicks += record.clicks;
    byPlatform[record.platform].shares += record.shares;
    byPlatform[record.platform].count++;
  }

  const totals = Object.values(byPlatform).reduce(
    (acc, p) => {
      acc.views += p.views;
      acc.clicks += p.clicks;
      acc.shares += p.shares;
      return acc;
    },
    { views: 0, clicks: 0, shares: 0 }
  );

  return { totals, byPlatform, recordCount: records.length };
}

async function getTopPerformingContent(workspaceId, limit = 10) {
  const pipeline = [
    { $match: { workspaceId } },
    {
      $group: {
        _id: '$projectId',
        totalViews: { $sum: '$views' },
        totalClicks: { $sum: '$clicks' },
        totalShares: { $sum: '$shares' },
        platforms: { $addToSet: '$platform' },
        lastRecorded: { $max: '$recordedAt' }
      }
    },
    {
      $addFields: {
        engagementScore: {
          $add: ['$totalViews', { $multiply: ['$totalClicks', 2] }, { $multiply: ['$totalShares', 3] }]
        }
      }
    },
    { $sort: { engagementScore: -1 } },
    { $limit: limit }
  ];

  return Analytics.aggregate(pipeline);
}

module.exports = {
  trackEvent,
  getProjectAnalytics,
  getWorkspaceAnalytics,
  getTopPerformingContent
};
