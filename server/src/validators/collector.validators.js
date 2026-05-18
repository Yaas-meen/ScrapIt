import { z } from 'zod';

export const createCollectorSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),

  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),

  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .regex(
      /^\+?[0-9]{10,15}$/,
      'Phone number must be 10-15 digits, optionally starting with +'
    ),

  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must not exceed 50 characters'),
});