import { z } from 'zod';

/**
 * Phone number validation regex
 * Matches formats: (512) 555-1234, 512-555-1234, 5125551234, etc.
 */
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

/**
 * Emergency contact schema
 */
export const emergencyContactSchema = z.object({
  name: z.string().optional(),
  phone: z
    .string()
    .regex(phoneRegex, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  relationship: z.string().optional(),
});

/**
 * Full tenant validation schema
 * Used for creating and editing tenant information
 */
export const tenantSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),

  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  phone: z
    .string()
    .regex(phoneRegex, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),

  emergencyContactName: z.string().optional(),

  emergencyContactPhone: z
    .string()
    .regex(phoneRegex, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),

  emergencyContactRelationship: z.string().optional(),

  notes: z.string().optional(),

  employerName: z.string().optional(),

  monthlyIncome: z
    .number()
    .positive('Monthly income must be positive')
    .optional()
    .or(z.nan()),
});

/**
 * Type inference from tenant schema
 */
export type TenantFormData = z.infer<typeof tenantSchema>;

/**
 * Partial tenant schema for optional updates
 */
export const tenantUpdateSchema = tenantSchema.partial();

export type TenantUpdateFormData = z.infer<typeof tenantUpdateSchema>;
