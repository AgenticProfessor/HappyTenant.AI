import { z } from 'zod';

/**
 * Lease type enum
 */
export const leaseTypeEnum = z.enum(['fixed', 'month_to_month', 'week_to_week']);

/**
 * Lease status enum
 */
export const leaseStatusEnum = z.enum([
  'draft',
  'pending_signature',
  'active',
  'expired',
  'terminated',
  'renewed',
]);

/**
 * Full lease validation schema
 * Used for creating and editing leases
 */
export const leaseSchema = z
  .object({
    tenantId: z.string().min(1, 'Please select a tenant'),

    unitId: z.string().min(1, 'Please select a unit'),

    leaseType: leaseTypeEnum,

    startDate: z.date({
      required_error: 'Start date is required',
      invalid_type_error: 'Please enter a valid start date',
    }),

    endDate: z.date({
      required_error: 'End date is required',
      invalid_type_error: 'Please enter a valid end date',
    }).optional(),

    rentAmount: z
      .number({
        required_error: 'Rent amount is required',
        invalid_type_error: 'Please enter a valid rent amount',
      })
      .positive('Rent amount must be greater than 0')
      .max(999999, 'Rent amount must be less than $999,999'),

    rentDueDay: z
      .number()
      .min(1, 'Due day must be between 1 and 28')
      .max(28, 'Due day must be between 1 and 28'),

    securityDeposit: z
      .number()
      .nonnegative('Security deposit cannot be negative')
      .max(999999, 'Security deposit must be less than $999,999'),

    petDeposit: z
      .number()
      .nonnegative('Pet deposit cannot be negative')
      .max(99999, 'Pet deposit must be less than $99,999'),

    lateFeeAmount: z
      .number()
      .nonnegative('Late fee cannot be negative')
      .max(9999, 'Late fee must be less than $9,999'),

    lateFeeGraceDays: z
      .number()
      .nonnegative('Grace days cannot be negative')
      .max(30, 'Grace days must be less than 30'),

    status: leaseStatusEnum,

    terms: z.string().optional(),

    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      // For fixed leases, end date is required
      if (data.leaseType === 'fixed' && !data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: 'End date is required for fixed-term leases',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      // End date must be after start date
      if (data.endDate && data.startDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      // For fixed leases, end date should be at least 30 days after start
      if (data.leaseType === 'fixed' && data.endDate && data.startDate) {
        const diffTime = Math.abs(data.endDate.getTime() - data.startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 30;
      }
      return true;
    },
    {
      message: 'Lease term should be at least 30 days',
      path: ['endDate'],
    }
  );

/**
 * Type inference from lease schema
 */
export type LeaseFormData = z.infer<typeof leaseSchema>;

/**
 * Partial lease schema for optional updates
 */
export const leaseUpdateSchema = leaseSchema.partial();

export type LeaseUpdateFormData = z.infer<typeof leaseUpdateSchema>;
