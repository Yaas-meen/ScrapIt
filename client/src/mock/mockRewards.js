export const rewardCatalog = {
  airtime: {
    minPoints: 500,
    providers: [
      { id: 'mtn',     label: 'MTN',     color: '#FFCC00' },
      { id: 'airtel',  label: 'Airtel',  color: '#ED1C24' },
      { id: 'glo',     label: 'Glo',     color: '#5BAF26' },
      { id: '9mobile', label: '9mobile', color: '#006A4D' },
    ],
    denominations: [
      { value: 500,  cost: 500 },
      { value: 1000, cost: 1000 },
      { value: 2000, cost: 2000 },
    ],
  },
  giftcard: {
    minPoints: 2500,
    providers: [
      { id: 'gplay',  label: 'Google Play' },
      { id: 'apple',  label: 'Apple' },
      { id: 'amazon', label: 'Amazon' },
    ],

    denominations: [
      { value: 1000, cost: 2500 },
      { value: 2000, cost: 5000 },
      { value: 5000, cost: 12000 },
    ],
  },
};

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const mockRedemptions = [
  {
    id: 'R-104',
    userId: 'u_001',
    type: 'airtime',
    provider: 'MTN',
    providerId: 'mtn',
    value: 500,
    pointsSpent: 500,
    code: 'MTN-9F2K-7H1Q',
    status: 'fulfilled',
    phone: '+2348035550142',
    createdAt: daysAgo(3),
  },
  {
    id: 'R-097',
    userId: 'u_001',
    type: 'giftcard',
    provider: 'Google Play',
    providerId: 'gplay',
    value: 1000,
    pointsSpent: 2500,
    code: 'GP-A7BD-3F9E-2K1L',
    status: 'fulfilled',
    createdAt: daysAgo(14),
  },
  {
    id: 'R-088',
    userId: 'u_001',
    type: 'airtime',
    provider: 'Airtel',
    providerId: 'airtel',
    value: 1000,
    pointsSpent: 1000,
    code: 'ATL-2X4M-9P0R',
    status: 'fulfilled',
    phone: '+2348035550142',
    createdAt: daysAgo(28),
  },
  {
    id: 'R-072',
    userId: 'u_001',
    type: 'giftcard',
    provider: 'Amazon',
    providerId: 'amazon',
    value: 2000,
    pointsSpent: 5000,
    code: 'AMZ-X1Y2-Z3W4-Q5R6',
    status: 'fulfilled',
    createdAt: daysAgo(48),
  },
  {
    id: 'R-063',
    userId: 'u_003',
    type: 'giftcard',
    provider: 'Apple',
    providerId: 'apple',
    value: 5000,
    pointsSpent: 12000,
    code: 'APL-77BB-44CC-1199',
    status: 'fulfilled',
    createdAt: daysAgo(60),
  },
];

export const mockRedemptionsByUser = (userId) =>
  mockRedemptions.filter((r) => r.userId === userId);

export default rewardCatalog;
