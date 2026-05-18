import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .optional(),

  phone: z
    .string()
    .trim()
    .regex(
      /^\+?[0-9]{10,15}$/,
      'Phone number must be 10-15 digits, optionally starting with +'
    )
    .optional(),

  defaultAddress: z
    .string()
    .trim()
    .min(10, 'Address must be at least 10 characters')
    .max(300, 'Address must not exceed 300 characters')
    .optional(),
}).refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: 'At least one field must be provided' }
);