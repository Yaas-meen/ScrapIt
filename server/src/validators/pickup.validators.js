import { z } from 'zod';

const wasteItemSchema = z.object({
  type: z.enum(['Plastic', 'Glass', 'Metal'], {
    errorMap: () => ({ message: 'Waste type must be Plastic, Glass or Metal' }),
  }),
  weight: z
    .number({ required_error: 'Weight is required', invalid_type_error: 'Weight must be a number' })
    .positive('Weight must be greater than 0')
    .max(1000, 'Weight cannot exceed 1000kg per item'),
});

export const createPickupSchema = z.object({
  wasteItems: z
    .array(wasteItemSchema)
    .min(1, 'At least one waste item is required')
    .max(10, 'Cannot add more than 10 waste items'),

  pickupDate: z
    .string({ required_error: 'Pickup date is required' })
    .refine((date) => {
      const picked = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return picked >= today;
    }, 'Pickup date cannot be in the past'),

  address: z
    .string()
    .trim()
    .min(10, 'Address must be at least 10 characters')
    .max(300, 'Address must not exceed 300 characters')
    .optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(
    ['Approved', 'Rejected', 'In Progress', 'Completed'],
    { errorMap: () => ({ message: 'Invalid status value' }) }
  ),

  rejectionReason: z
    .string()
    .trim()
    .min(10, 'Rejection reason must be at least 10 characters')
    .max(500, 'Rejection reason must not exceed 500 characters')
    .optional(),

  completionNotes: z
    .string()
    .trim()
    .max(500, 'Completion notes must not exceed 500 characters')
    .optional(),
}).refine(
  (data) => data.status !== 'Rejected' || !!data.rejectionReason,
  {
    message: 'Rejection reason is required when rejecting a pickup',
    path: ['rejectionReason'],
  }
);

export const assignCollectorSchema = z.object({
  collectorId: z
    .string({ required_error: 'Collector ID is required' })
    .regex(/^[a-f\d]{24}$/i, 'Invalid collector ID format'),
});