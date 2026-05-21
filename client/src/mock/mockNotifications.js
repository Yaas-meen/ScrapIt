const hoursAgo = (n) => new Date(Date.now() - n * 3_600_000).toISOString();
const daysAgo  = (n) => new Date(Date.now() - n * 86_400_000).toISOString();

export const mockNotifications = [
  {
    id: 'n-001', userId: 'u-001',
    type: 'Approved', title: 'Pickup request approved!',
    message: 'Your pickup PCK-2003 has been approved. A collector will be assigned shortly.',
    pickupId: 'PCK-2003', readAt: null, isRead: false,
    createdAt: hoursAgo(2),
  },
  {
    id: 'n-002', userId: 'u-001',
    type: 'Rejected', title: 'Pickup request rejected',
    message: 'Your pickup PCK-2007 was rejected. Reason: Image was too blurry.',
    pickupId: 'PCK-2007', readAt: null, isRead: false,
    createdAt: daysAgo(4),
  },
  {
    id: 'n-003', userId: 'u-001',
    type: 'Completed', title: 'Pickup completed!',
    message: 'Your pickup PCK-2001 is complete. You earned 25 points. Keep recycling!',
    pickupId: 'PCK-2001', readAt: daysAgo(9), isRead: true,
    createdAt: daysAgo(10),
  },
  {
    id: 'n-004', userId: 'u-002',
    type: 'In Progress', title: 'Collector is on the way',
    message: 'Your assigned collector has started pickup PCK-2004. Have your waste ready.',
    pickupId: 'PCK-2004', readAt: null, isRead: false,
    createdAt: hoursAgo(5),
  },
  {
    id: 'n-005', userId: 'u-002',
    type: 'Completed', title: 'Pickup completed!',
    message: 'Your pickup PCK-2002 is complete. You earned 60 points.',
    pickupId: 'PCK-2002', readAt: daysAgo(7), isRead: true,
    createdAt: daysAgo(8),
  },
  {
    id: 'n-006', userId: 'u-003',
    type: 'General', title: 'Welcome to ScrapIt!',
    message: 'Start recycling today and earn points you can redeem for airtime and gift cards.',
    pickupId: null, readAt: null, isRead: false,
    createdAt: daysAgo(20),
  },
];

export const mockNotificationsByUser = (userId) =>
  mockNotifications.filter((n) => n.userId === userId);

export const unreadCount = (userId) =>
  mockNotifications.filter((n) => n.userId === userId && !n.readAt).length;
export default mockNotifications;