import { z } from 'zod';

const AIRTIME_PROVIDERS = ['MTN', 'Airtel', 'Glo', '9mobile'];
const GIFT_CARD_PROVIDERS = ['Google Play', 'Apple', 'Amazon'];
const VALID_DENOMINATIONS = [1000, 2000, 5000];

export const redeemRewardSchema = z
  .object({
    type: z.enum(['Airtime', 'Gift Card'], {
      errorMap: () => ({ message: 'Type must be Airtime or Gift Card' }),
    }),

    provider: z.string({ required_error: 'Provider is required' }).trim(),

    pointsToSpend: z
      .number({
        required_error: 'pointsToSpend is required',
        invalid_type_error: 'pointsToSpend must be a number',
      })
      .int('pointsToSpend must be a whole number')
      .positive('pointsToSpend must be greater than 0'),

    denomination: z
      .number()
      .refine(
        (val) => VALID_DENOMINATIONS.includes(val),
        `Denomination must be one of: ${VALID_DENOMINATIONS.join(', ')}`
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'Airtime') {
        return AIRTIME_PROVIDERS.includes(data.provider);
      }
      return GIFT_CARD_PROVIDERS.includes(data.provider);
    },
    (data) => ({
      message:
        data.type === 'Airtime'
          ? `Provider must be one of: ${AIRTIME_PROVIDERS.join(', ')}`
          : `Provider must be one of: ${GIFT_CARD_PROVIDERS.join(', ')}`,
      path: ['provider'],
    })
  )
  .refine(
    (data) => {
      if (data.type === 'Airtime') return data.pointsToSpend >= 500;
      return data.pointsToSpend >= 1000;
    },
    (data) => ({
      message:
        data.type === 'Airtime'
          ? 'Minimum redemption for Airtime is 500 points'
          : 'Minimum redemption for Gift Card is 1000 points',
      path: ['pointsToSpend'],
    })
  )
  .refine(
    (data) => data.type !== 'Gift Card' || !!data.denomination,
    {
      message: 'Denomination is required for Gift Card redemptions',
      path: ['denomination'],
    }
  );