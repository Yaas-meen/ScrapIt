const daysAgo = (n, h = 9) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
};

export const mockNotifications = [
  {
    id: 'n1',
    userId: 'u_001',
    message: 'Your pickup PCK-2038 is now In Progress.',
    kind: 'pickup',
    readAt: null,
    createdAt: daysAgo(2, 11),
    meta: { pickupId: 'PCK-2038' },
  },
  {
    id: 'n2',
    userId: 'u_001',
    message: 'Pickup PCK-2041 approved. A collector will arrive tomorrow.',
    kind: 'pickup',
    readAt: null,
    createdAt: daysAgo(0, 12),
    meta: { pickupId: 'PCK-2041' },
  },
  {
    id: 'n3',
    userId: 'u_001',
    message: 'You earned 52 points from PCK-2035.',
    kind: 'reward',
    readAt: null,
    createdAt: daysAgo(5, 11),
    meta: { pickupId: 'PCK-2035', points: 52 },
  },
  {
    id: 'n4',
    userId: 'u_001',
    message: 'Pickup PCK-2031 was rejected. See details for reason.',
    kind: 'pickup',
    readAt: daysAgo(8),
    createdAt: daysAgo(9, 14),
    meta: { pickupId: 'PCK-2031' },
  },
  {
    id: 'n5',
    userId: 'u_001',
    message: 'Welcome to ScrapIt — schedule your first pickup to start earning.',
    kind: 'system',
    readAt: daysAgo(19),
    createdAt: daysAgo(20, 9),
    meta: {},
  },

  {
    id: 'n6',
    userId: 'u_003',
    message: 'Pickup PCK-2042 received — awaiting admin review.',
    kind: 'pickup',
    readAt: null,
    createdAt: daysAgo(0, 9),
    meta: { pickupId: 'PCK-2042' },
  },
];

export const mockNotificationsByUser = (userId) =>
  mockNotifications.filter((n) => n.userId === userId);

export const unreadCount = (userId) =>
  mockNotifications.filter((n) => n.userId === userId && !n.readAt).length;

export default mockNotifications;
