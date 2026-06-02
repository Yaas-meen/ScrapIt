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


  .superRefine((data, ctx) => {
    if (data.type === 'Airtime') {
      if (!AIRTIME_PROVIDERS.includes(data.provider)) {
        ctx.addIssue({
          path: ['provider'],
          code: z.ZodIssueCode.custom,
          message: `Provider must be one of: ${AIRTIME_PROVIDERS.join(', ')}`,
        });
      }
    } else {
      if (!GIFT_CARD_PROVIDERS.includes(data.provider)) {
        ctx.addIssue({
          path: ['provider'],
          code: z.ZodIssueCode.custom,
          message: `Provider must be one of: ${GIFT_CARD_PROVIDERS.join(', ')}`,
        });
      }
    }

    if (data.type === 'Airtime' && data.pointsToSpend < 500) {
      ctx.addIssue({
        path: ['pointsToSpend'],
        code: z.ZodIssueCode.custom,
        message: 'Minimum redemption for Airtime is 500 points',
      });
    }

    if (data.type === 'Gift Card' && data.pointsToSpend < 1000) {
      ctx.addIssue({
        path: ['pointsToSpend'],
        code: z.ZodIssueCode.custom,
        message: 'Minimum redemption for Gift Card is 1000 points',
      });
    }

    if (data.type === 'Gift Card') {
      if (!data.denomination) {
        ctx.addIssue({
          path: ['denomination'],
          code: z.ZodIssueCode.custom,
          message: 'Denomination is required for Gift Card redemptions',
        });
      }
    }
  });