export const AIRTIME_DENOMINATIONS = [
  { value: 100,  cost: 100,  label: '₦100'   },
  { value: 200,  cost: 200,  label: '₦200'   },
  { value: 500,  cost: 500,  label: '₦500'   },
  { value: 1000, cost: 1000, label: '₦1,000' },
];

export const GIFT_CARD_DENOMINATIONS = [
  { value: 1000, cost: 1000, label: '₦1,000' },
  { value: 2000, cost: 2000, label: '₦2,000' },
  { value: 5000, cost: 5000, label: '₦5,000' },
];

export const getDenominations = (type) =>
  type === 'giftcard' ? GIFT_CARD_DENOMINATIONS : AIRTIME_DENOMINATIONS;
