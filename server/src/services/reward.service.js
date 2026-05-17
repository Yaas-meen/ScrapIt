import Reward from '../models/Reward.model.js';
import { deductPointsFromUser } from './points.service.js';
import { generateRewardCode } from '../utils/generateRewardCode.js';


export const GIFT_CARD_DENOMINATIONS = {
  1000: 1000,  // ₦1,000 = 1,000 points
  2000: 2000,  
  5000: 5000,  
};


export const REDEMPTION_MINIMUMS = {
  Airtime: 500,
  'Gift Card': 1000,
};


export const VALID_PROVIDERS = {
  Airtime: ['MTN', 'Airtel', 'Glo', '9mobile'],
  'Gift Card': ['Google Play', 'Apple', 'Amazon'],
};

export const validateRedemption = (type, provider, pointsToSpend, denomination, userPoints) => {
  if (!['Airtime', 'Gift Card'].includes(type)) {
    return { valid: false, message: 'Invalid reward type' };
  }

  if (!VALID_PROVIDERS[type].includes(provider)) {
    return {
      valid: false,
      message: `Invalid provider for ${type}. Valid options: ${VALID_PROVIDERS[type].join(', ')}`,
    };
  }

  const minimum = REDEMPTION_MINIMUMS[type];
  if (pointsToSpend < minimum) {
    return {
      valid: false,
      message: `Minimum redemption for ${type} is ${minimum} points`,
    };
  }

  if (pointsToSpend > userPoints) {
    return {
      valid: false,
      message: `Insufficient points. You have ${userPoints} points but need ${pointsToSpend}`,
    };
  }


  if (type === 'Gift Card') {
    if (!denomination) {
      return { valid: false, message: 'Denomination is required for Gift Card redemptions' };
    }

    const validDenoms = Object.keys(GIFT_CARD_DENOMINATIONS).map(Number);
    if (!validDenoms.includes(Number(denomination))) {
      return {
        valid: false,
        message: `Invalid denomination. Choose from: ₦${validDenoms.join(', ₦')}`,
      };
    }

    const requiredPoints = GIFT_CARD_DENOMINATIONS[denomination];
    if (pointsToSpend < requiredPoints) {
      return {
        valid: false,
        message: `₦${denomination} gift card requires ${requiredPoints} points`,
      };
    }
  }

  return { valid: true };
};


export const processRedemption = async ({ userId, type, provider, pointsToSpend, denomination }) => {
  const nairaValue = type === 'Airtime'
    ? pointsToSpend        
    : Number(denomination); 

 
  await deductPointsFromUser(userId, pointsToSpend);

  const code = generateRewardCode();

  const reward = await Reward.create({
    user: userId,
    type,
    provider,
    pointsSpent: pointsToSpend,
    nairaValue,
    code,
    denomination: denomination ? Number(denomination) : null,
  });

  return reward;
};