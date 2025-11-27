import { z } from 'zod';

/**
 * Property Form Validation Schemas
 *
 * These schemas define validation rules for property creation and editing forms.
 * They ensure data integrity and provide type-safe form validation.
 */

// Property type enum
export const propertyTypes = [
  'single_family',
  'multi_family',
  'apartment',
  'condo',
  'townhouse',
  'commercial',
] as const;

// Property status enum
export const propertyStatuses = [
  'active',
  'inactive',
  'maintenance',
] as const;

// US States
export const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
] as const;

/**
 * Full Property Schema
 * Used for validating property edit forms
 */
export const propertySchema = z.object({
  name: z
    .string()
    .min(1, 'Property name is required')
    .max(100, 'Property name must be less than 100 characters'),

  type: z.enum(propertyTypes, {
    required_error: 'Property type is required',
    invalid_type_error: 'Please select a valid property type',
  }),

  // Address fields
  addressLine1: z
    .string()
    .min(1, 'Street address is required')
    .max(200, 'Street address must be less than 200 characters'),

  addressLine2: z
    .string()
    .max(200, 'Address line 2 must be less than 200 characters')
    .optional()
    .or(z.literal('')),

  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters'),

  state: z.enum(usStates, {
    required_error: 'State is required',
    invalid_type_error: 'Please select a valid state',
  }),

  postalCode: z
    .string()
    .min(1, 'ZIP code is required')
    .regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be in format 12345 or 12345-6789'),

  country: z
    .string(),

  // Optional fields
  yearBuilt: z
    .number()
    .int('Year must be a whole number')
    .min(1800, 'Year must be 1800 or later')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future')
    .optional()
    .or(z.literal(0))
    .transform(val => val === 0 ? undefined : val),

  squareFeet: z
    .number()
    .int('Square feet must be a whole number')
    .min(1, 'Square feet must be at least 1')
    .optional()
    .or(z.literal(0))
    .transform(val => val === 0 ? undefined : val),

  purchasePrice: z
    .number()
    .min(0, 'Purchase price cannot be negative')
    .optional()
    .or(z.literal(0))
    .transform(val => val === 0 ? undefined : val),

  currentValue: z
    .number()
    .min(0, 'Current value cannot be negative')
    .optional()
    .or(z.literal(0))
    .transform(val => val === 0 ? undefined : val),

  status: z.enum(propertyStatuses, {
    required_error: 'Status is required',
    invalid_type_error: 'Please select a valid status',
  }),

  photos: z
    .array(z.string().url('Photo must be a valid URL'))
    .optional(),
});

/**
 * Type inference from schema
 */
export type PropertyFormValues = z.infer<typeof propertySchema>;

/**
 * Default values for property form
 */
export const defaultPropertyValues: Partial<PropertyFormValues> = {
  name: '',
  type: 'apartment',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: 'TX',
  postalCode: '',
  country: 'US',
  status: 'active',
  photos: [],
};
