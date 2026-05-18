export const mockCollectors = [
  {
    id: 'col-001', name: 'Emeka Nwosu',
    email: 'emeka@scrapit.com', password: 'collector123',
    phone: '+2348098765432', role: 'collector',
    zone: 'Lekki / VI', avatar: 'EN',
    active: true, isActive: true,
    assignedCount: 3, totalCompleted: 34,
    createdAt: '2024-01-05T10:00:00.000Z',
  },
  {
    id: 'col-002', name: 'Sola Adebayo',
    email: 'sola@scrapit.com', password: 'collector123',
    phone: '+2348087654321', role: 'collector',
    zone: 'Ikeja / Surulere', avatar: 'SA',
    active: true, isActive: true,
    assignedCount: 6, totalCompleted: 21,
    createdAt: '2024-01-08T10:00:00.000Z',
  },
  {
    id: 'col-003', name: 'Ngozi Eze',
    email: 'ngozi@scrapit.com', password: 'collector123',
    phone: '+2348076543210', role: 'collector',
    zone: 'Yaba / Mainland', avatar: 'NE',
    active: false, isActive: false,
    assignedCount: 0, totalCompleted: 8,
    createdAt: '2024-01-10T10:00:00.000Z',
  },
];

export const findMockCollectorById      = (id)    => mockCollectors.find((c) => c.id === id) || null;
export const findMockCollectorByEmail   = (email) =>
  mockCollectors.find((c) => c.email.toLowerCase() === String(email).toLowerCase()) || null;

export default mockCollectors;