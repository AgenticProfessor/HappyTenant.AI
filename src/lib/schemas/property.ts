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
  'ACTIVE',
  'INACTIVE',
  'SOLD',
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
    message: 'Please select a valid property type',
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
    message: 'Please select a valid state',
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
    .min(0, 'Year cannot be negative')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future')
    .optional(),

  squareFeet: z
    .number()
    .int('Square feet must be a whole number')
    .min(0, 'Square feet cannot be negative')
    .optional(),

  purchasePrice: z
    .number()
    .min(0, 'Purchase price cannot be negative')
    .optional(),

  currentValue: z
    .number()
    .min(0, 'Current value cannot be negative')
    .optional(),

  status: z.enum(propertyStatuses, {
    message: 'Please select a valid status',
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
  status: 'ACTIVE',
  photos: [],
};
