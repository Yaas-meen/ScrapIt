import Notification from '../models/Notification.model.js';

//template object dor the different types of notifications
const getNotificationContent = (status, pointsEarned = 0, rejectionReason = '') => {
  const templates = {
    Approved: {
      type: 'Approved',
      title: 'Pickup request approved!',
      message:
        'Great news! Your pickup request has been approved. A collector will be assigned shortly.',
    },
    Rejected: {
      type: 'Rejected',
      title: 'Pickup request rejected',
      message: `Your pickup request was rejected. Reason: ${rejectionReason || 'No reason provided.'}`,
    },
    'In Progress': {
      type: 'In Progress',
      title: 'Collector is on the way',
      message: 'Your assigned collector has started the pickup. Please have your waste ready.',
    },
    Completed: {
      type: 'Completed',
      title: 'Pickup completed!',
      message: `Your pickup is complete. You earned ${pointsEarned} points. Keep recycling!`,
    },
  };

  return templates[status] || null;
};


export const createStatusNotification = async (userId, pickupId, newStatus, extra = {}) => {
  const content = getNotificationContent(
    newStatus,
    extra.pointsEarned,
    extra.rejectionReason
  );

  // pending has no notification
  if (!content) return null;

  const notification = await Notification.create({
    user: userId,
    type: content.type,
    title: content.title,
    message: content.message,
    pickup: pickupId,
  });

  return notification;
};

//for the general notification
export const createGeneralNotification = async (userId, title, message) => {
  return await Notification.create({
    user: userId,
    type: 'General',
    title,
    message,
  });
};