import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name:     z.string().min(2, 'Full name must be at least 2 characters'),
  email:    z.string().min(1, 'Email is required').email('Invalid email address'),
  phone:    z.string()
    .min(1, 'Phone number is required')
    .refine((v) => v.replace(/[^0-9]/g, '').length >= 10,
      'Enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm:  z.string().min(1, 'Please confirm your password'),
  accept:   z.boolean().refine((v) => v === true, 'You must accept the Terms'),
}).refine((d) => d.password === d.confirm, {
  message: 'Passwords do not match',
  path:    ['confirm'],
});

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone:    z.string().optional(),
  address:  z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword:     z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
}).refine((d) => d.newPassword !== d.currentPassword, {
  message: 'New password must be different from current',
  path:    ['newPassword'],
});

export const schedulePickupSchema = z.object({
  pickupDate: z.string().min(1, 'Please select a pickup date'),
  address:    z.string().min(5, 'Please enter a full pickup address'),
});
