const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/response.util');
const { User } = require('../models');

/**
 * NotificationController - Manages user in-app notifications and preferences
 */
exports.list = asyncHandler(async (req, res) => {
  // Mock notifications stored in user metadata or a dedicated table
  const user = await User.findByPk(req.user.id);
  const notifications = user.metadata?.notifications || [];
  return sendResponse(res, 200, notifications, 'Notifications fetched.');
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  const unread = (user.metadata?.notifications || []).filter(n => !n.read).length;
  return sendResponse(res, 200, { unreadCount: unread });
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  const notifications = user.metadata?.notifications || [];
  const updated = notifications.map(n => n.id === req.params.id ? { ...n, read: true, readAt: new Date() } : n);
  
  await user.update({ metadata: { ...user.metadata, notifications: updated } });
  return sendResponse(res, 200, null, 'Notification marked as read');
});

exports.getPreferences = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  return sendResponse(res, 200, user.metadata?.notificationPreferences || { email: true, push: true });
});

exports.updatePreferences = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  await user.update({ 
    metadata: { 
      ...user.metadata, 
      notificationPreferences: req.body 
    } 
  });
  return sendResponse(res, 200, req.body, 'Preferences updated');
});
