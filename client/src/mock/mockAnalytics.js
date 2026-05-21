import { mockUsers } from './mockUsers';
import { mockCollectors } from './mockCollectors';
import { mockPickups } from './mockPickups';

const byStatus = mockPickups.reduce(
  (acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  },
  { Pending: 0, Approved: 0, 'In Progress': 0, Completed: 0, Rejected: 0 }
);

const totalPointsAwarded = mockPickups.reduce(
  (sum, p) => sum + (p.pointsAwarded || 0),
  0
);

const totalKg = mockPickups
  .filter((p) => p.status === 'Completed')
  .reduce((sum, p) => sum + (p.verifiedWeight || p.weight || 0), 0);

export const mockAnalytics = {
  totals: {
    users: mockUsers.length,
    collectors: mockCollectors.filter((c) => c.active).length,
    pickups: mockPickups.length,
    pointsAwarded: totalPointsAwarded,
    kgCollected: +totalKg.toFixed(1),
  },
  byStatus,

  weekly: [
    { week: '2026-W11', pickups: 42, kg: 268 },
    { week: '2026-W12', pickups: 51, kg: 332 },
    { week: '2026-W13', pickups: 48, kg: 311 },
    { week: '2026-W14', pickups: 57, kg: 364 },
    { week: '2026-W15', pickups: 63, kg: 402 },
    { week: '2026-W16', pickups: 58, kg: 371 },
    { week: '2026-W17', pickups: 64, kg: 412 },
    { week: '2026-W18', pickups: 72, kg: 458 },
  ],

  topUsers: [...mockUsers]
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)
    .map((u) => ({ id: u.id, name: u.name, points: u.points, pickups: 0 })),

    byWasteType: [
    { type: 'plastic', kg: 142.3, pickups: 8 },
    { type: 'glass', kg: 87.6, pickups: 5 },
    { type: 'metal', kg: 64.2, pickups: 4 },
  ],
};

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const mockActivityLog = [
  { id: 'a1', text: 'Admin Bola updated PCK-2038 to In Progress', at: daysAgo(2) },
  { id: 'a2', text: 'Admin Bola assigned PCK-2042 to Chidi Eze', at: daysAgo(0) },
  { id: 'a3', text: 'Admin Bola approved PCK-2041', at: daysAgo(0) },
  { id: 'a4', text: 'Admin Bola rejected PCK-2033', at: daysAgo(6) },
  { id: 'a5', text: 'Admin Tunde added new collector Fatima Bello', at: daysAgo(11) },
];
export default mockAnalytics;
