const daysAgo = (n) => new Date(Date.now() - n * 86_400_000).toISOString();

export const rewardCatalog = {
  airtime: {
    label: 'Airtime', icon: '📱',
    description: 'Instant airtime on any Nigerian network',
    minPoints: 500,
    providers: [
      { id: 'mtn',     label: 'MTN',     color: '#FFCB00' },
      { id: 'airtel',  label: 'Airtel',  color: '#EF0000' },
      { id: 'glo',     label: 'Glo',     color: '#009900' },
      { id: '9mobile', label: '9mobile', color: '#006633' },
    ],
    denominations: [
      { value: 500,  cost: 500,  label: '₦500'   },
      { value: 1000,  cost: 1000,  label: '₦1,000'   },
      { value: 2000,  cost: 2000,  label: '₦2,000'   },
      { value: 3000, cost: 3000, label: '₦3,000' },
    ],
  },
  giftcard: {
    label: 'Gift Card', icon: '🎁',
    description: 'Redeem for popular digital gift cards',
    minPoints: 1000,
    providers: [
      { id: 'gplay',  label: 'Google Play', color: '#4285F4' },
      { id: 'apple',  label: 'Apple',       color: '#555555' },
      { id: 'amazon', label: 'Amazon',      color: '#FF9900' },
    ],
    denominations: [
      { value: 1000, cost: 1000, label: '₦1,000' },
      { value: 2000, cost: 2000, label: '₦2,000' },
      { value: 5000, cost: 5000, label: '₦5,000' },
    ],
  },
};

export const mockRedemptions = [
  {
    id: 'R-101', userId: 'u-001', type: 'airtime',
    provider: 'MTN', providerId: 'mtn',
    value: 500, pointsSpent: 500,
    code: 'MTN-A1B2-C3D4', status: 'fulfilled',
    phone: '+2348012345678', createdAt: daysAgo(7),
  },
  {
    id: 'R-102', userId: 'u-002', type: 'giftcard',
    provider: 'Google Play', providerId: 'gplay',
    value: 1000, pointsSpent: 1000,
    code: 'GP-X9Y8-Z7W6-V5U4', status: 'fulfilled',
    phone: undefined, createdAt: daysAgo(14),
  },
];

export const mockRedemptionsByUser = (userId) =>
  mockRedemptions.filter((r) => r.userId === userId);
export default mockRedemptions;