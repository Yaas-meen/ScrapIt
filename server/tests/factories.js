import bcrypt from 'bcryptjs';
import User      from '../src/models/User.model.js';
import Collector from '../src/models/Collector.model.js';
import Pickup    from '../src/models/Pickup.model.js';

export const TEST_USER = {
  fullName: 'Test User',
  email:    'testuser@scrapit.com',
  phone:    '+2348012345678',
  password: 'password123',
  defaultAddress: '14 Admiralty Way, Lekki, Lagos',
};

export const TEST_ADMIN = {
  fullName: 'Test Admin',
  email:    'admin@scrapit.com',
  phone:    '+2348000000001',
  password: 'Admin@1234',
  role:     'admin',
};

export const TEST_COLLECTOR = {
  fullName: 'Test Collector',
  email:    'collector@scrapit.com',
  phone:    '+2348098765432',
  password: 'collector123',
};

// Creates a real user in the test DB
export const createTestUser = async (overrides = {}) => {
  return User.create({ ...TEST_USER, role: 'user', ...overrides });
};

// Creates an admin — bypasses bcrypt by using create() which triggers pre-save hook
export const createTestAdmin = async () => {
  return User.create({ ...TEST_ADMIN });
};

// Creates a collector
export const createTestCollector = async (overrides = {}) => {
  return Collector.create({ ...TEST_COLLECTOR, ...overrides });
};

// Creates a pickup in a given status
export const createTestPickup = async (userId, overrides = {}) => {
  const wasteItems = [
    { type: 'Plastic', weight: 2.5, pointsRate: 10, pointsEarned: 25 },
    { type: 'Metal',   weight: 1,   pointsRate: 20, pointsEarned: 20 },
  ];

  return Pickup.create({
    user: userId,
    wasteItems,
    totalWeight: 3.5,
    totalPoints: 45,
    pickupDate:  new Date(Date.now() + 86_400_000), // tomorrow
    address:     '14 Admiralty Way, Lekki, Lagos',
    status:      'Pending',
    statusLog: [
      {
        status:         'Pending',
        changedBy:      userId,
        changedByModel: 'User',
        note:           'Created by test',
      },
    ],
    ...overrides,
  });
};