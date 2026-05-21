export const mockUsers = [
  {
    id: 'u-001', name: 'Chidi Okeke',
    email: 'chidi@gmail.com', password: 'password123',
    phone: '+2348012345678', role: 'user',
    address: '14 Admiralty Way, Lekki Phase 1, Lagos',
    points: 2450, pointsEarned: 3200, pointsSpent: 750,
    profileComplete: true, avatar: 'CO', isActive: true,
    createdAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: 'u-002', name: 'Amaka Osei',
    email: 'amaka@gmail.com', password: 'password123',
    phone: '+2348023456789', role: 'user',
    address: '7 Adeola Odeku Street, Victoria Island, Lagos',
    points: 8000, pointsEarned: 9500, pointsSpent: 1500,
    profileComplete: true, avatar: 'AO', isActive: true,
    createdAt: '2024-01-20T09:00:00.000Z',
  },
  {
    id: 'u-003', name: 'Bola Adeyemi',
    email: 'bola@gmail.com', password: 'password123',
    phone: '+2348034567890', role: 'user',
    address: '22 Allen Avenue, Ikeja, Lagos',
    points: 500, pointsEarned: 500, pointsSpent: 0,
    profileComplete: true, avatar: 'BA', isActive: true,
    createdAt: '2024-02-01T08:00:00.000Z',
  },
  {
    id: 'u-admin', name: 'ScrapIt Admin',
    email: 'admin@scrapit.com', password: 'Admin@1234',
    phone: '+2348000000001', role: 'admin',
    address: 'ScrapIt HQ, Victoria Island, Lagos',
    points: 0, pointsEarned: 0, pointsSpent: 0,
    profileComplete: true, avatar: 'SA', isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

export const findMockUserByEmail = (email) =>
  mockUsers.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null;
export default mockUsers;