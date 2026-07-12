const Notification = require('../../models/Notification');

async function createNotification({ userId, workspaceId, title, message, type = 'info', actionUrl = null }) {
  const notification = await Notification.create({
    userId,
    workspaceId,
    title,
    message,
    type,
    actionUrl
  });
  return notification;
}

async function getUserNotifications(userId, limit = 50) {
  return Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

async function markAsRead(notificationId) {
  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
  if (!notification) {
    throw new Error(`Notification not found: ${notificationId}`);
  }
  return notification;
}

async function markAllAsRead(userId) {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
  return { modifiedCount: result.modifiedCount };
}

async function getUnreadCount(userId) {
  const count = await Notification.countDocuments({ userId, isRead: false });
  return count;
}

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};
