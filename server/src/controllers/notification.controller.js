import Notification from '../models/Notification.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// ─────────────────────────────────────────────
// USER — Get own notifications
// GET /api/v1/notifications/my
// ─────────────────────────────────────────────
export const getMyNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;

  const filter = { user: req.user._id };
  if (unreadOnly === 'true') {
    filter.isRead = false;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate('pickup', 'status totalPoints pickupDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ]);

  return successResponse(res, 200, 'Notifications retrieved', {
    notifications,
    unreadCount,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// ─────────────────────────────────────────────
// USER — Mark a single notification as read
// PATCH /api/v1/notifications/:id/read
// ─────────────────────────────────────────────
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return errorResponse(res, 404, 'Notification not found');
  }

  if (notification.user.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Not authorised');
  }

  if (notification.isRead) {
    return successResponse(res, 200, 'Already marked as read', notification);
  }

  notification.isRead = true;
  await notification.save();

  return successResponse(res, 200, 'Notification marked as read', notification);
});

// ─────────────────────────────────────────────
// USER — Mark all notifications as read
// PATCH /api/v1/notifications/read-all
// ─────────────────────────────────────────────
export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  return successResponse(res, 200, 'All notifications marked as read', {
    updated: result.modifiedCount,
  });
});

// ─────────────────────────────────────────────
// USER — Delete a single notification
// DELETE /api/v1/notifications/:id
// ─────────────────────────────────────────────
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return errorResponse(res, 404, 'Notification not found');
  }

  if (notification.user.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Not authorised');
  }

  await notification.deleteOne();

  return successResponse(res, 200, 'Notification deleted');
});