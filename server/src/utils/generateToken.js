import crypto from 'crypto';


export const generateRewardCode = () => {
  const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
};