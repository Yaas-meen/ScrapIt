export const mockCollectors = [
  {
    id: 'c_001',
    name: 'Chidi Eze',
    email: 'chidi@scrapit.io',
    phone: '+2348012345678',
    password: 'collector123',
    role: 'collector',
    zone: 'Apapa',
    vehicle: 'Pickup Truck — LAG 482 KK',
    active: true,
    availability: 'available',
    assignedCount: 4,
    ratingAvg: 4.7,
    avatar: 'CE',
    createdAt: '2024-03-10T09:00:00.000Z',
  },
  {
    id: 'c_002',
    name: 'Bisi Adeyemi',
    email: 'bisi@scrapit.io',
    phone: '+2348023456789',
    password: 'collector123',
    role: 'collector',
    zone: 'Ikoyi',
    vehicle: 'Van — LAG 991 AB',
    active: true,
    availability: 'busy',
    assignedCount: 7,
    ratingAvg: 4.9,
    avatar: 'BA',
    createdAt: '2024-04-22T08:30:00.000Z',
  },
  {
    id: 'c_003',
    name: 'Kunle Akande',
    email: 'kunle@scrapit.io',
    phone: '+2348034567890',
    password: 'collector123',
    role: 'collector',
    zone: 'Victoria Island',
    vehicle: 'Pickup Truck — LAG 220 XY',
    active: true,
    availability: 'available',
    assignedCount: 2,
    ratingAvg: 4.5,
    avatar: 'KA',
    createdAt: '2024-06-14T11:00:00.000Z',
  },
  {
    id: 'c_004',
    name: 'Fatima Bello',
    email: 'fatima@scrapit.io',
    phone: '+2348055678901',
    password: 'collector123',
    role: 'collector',
    zone: 'Ikeja',
    vehicle: 'Van — LAG 117 CD',
    active: false,
    availability: 'offline',
    assignedCount: 0,
    ratingAvg: 4.2,
    avatar: 'FB',
    createdAt: '2024-09-05T15:00:00.000Z',
  },
  {
    id: 'c_005',
    name: 'Tunde Ogundipe',
    email: 'tunde@scrapit.io',
    phone: '+2348066789012',
    password: 'collector123',
    role: 'collector',
    zone: 'Lekki',
    vehicle: 'Pickup Truck — LAG 707 EF',
    active: true,
    availability: 'available',
    assignedCount: 5,
    ratingAvg: 4.6,
    avatar: 'TO',
    createdAt: '2024-07-19T10:00:00.000Z',
  },
];

export function findMockCollectorByEmail(email) {
  return mockCollectors.find((c) => c.email.toLowerCase() === String(email).toLowerCase());
}

export function findMockCollectorById(id) {
  return mockCollectors.find((c) => c.id === id);
}

export const activeMockCollectors = () => mockCollectors.filter((c) => c.active);

export default mockCollectors;
