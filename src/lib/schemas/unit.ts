import { z } from 'zod';

/**
 * Unit Form Validation Schemas
 *
 * These schemas define validation rules for unit creation and editing forms.
 * They ensure data integrity and provide type-safe form validation.
 */

// Unit status enum
export const unitStatuses = [
  'vacant',
  'occupied',
  'maintenance',
  'reserved',
] as const;

// Common unit amenities
export const unitAmenities = [
  'dishwasher',
  'washer_dryer',
  'air_conditioning',
  'heating',
  'parking',
  'balcony',
  'patio',
  'pool_access',
  'gym_access',
  'pet_friendly',
  'hardwood_floors',
  'carpet',
  'tile_floors',
  'updated_kitchen',
  'updated_bathroom',
  'walk_in_closet',
  'storage',
  'elevator_access',
] as const;

/**
 * Full Unit Schema
 * Used for validating unit add/edit forms
 */
export const unitSchema = z.object({
  unitNumber: z
    .string()
    .min(1, 'Unit number is required')
    .max(50, 'Unit number must be less than 50 characters'),

  name: z
    .string()
    .max(100, 'Unit name must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  bedrooms: z
    .number()
    .int('Bedrooms must be a whole number')
    .min(0, 'Bedrooms cannot be negative')
    .max(20, 'Bedrooms must be 20 or less'),

  bathrooms: z
    .number()
    .min(0, 'Bathrooms cannot be negative')
    .max(20, 'Bathrooms must be 20 or less')
    .multipleOf(0.5, 'Bathrooms must be in increments of 0.5'),

  squareFeet: z
    .number()
    .int('Square feet must be a whole number')
    .min(1, 'Square feet must be at least 1')
    .optional()
    .or(z.literal(0))
    .transform(val => val === 0 ? undefined : val),

  floorNumber: z
    .number()
    .int('Floor number must be a whole number')
    .optional()
    .or(z.literal(0))
    .transform(val => val === 0 ? undefined : val),

  marketRent: z
    .number()
    .min(0, 'Rent amount cannot be negative')
    .max(1000000, 'Rent amount must be less than $1,000,000'),

  depositAmount: z
    .number()
    .min(0, 'Deposit amount cannot be negative')
    .max(1000000, 'Deposit amount must be less than $1,000,000')
    .optional()
    .or(z.literal(0))
    .transform(val => val === 0 ? undefined : val),

  status: z.enum(unitStatuses, {
    required_error: 'Status is required',
    invalid_type_error: 'Please select a valid status',
  }),

  features: z
    .array(z.string())
    .default([]),

  isListed: z
    .boolean()
    .default(false),

  listingDescription: z
    .string()
    .max(2000, 'Listing description must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
});

/**
 * Type inference from schema
 */
export type UnitFormValues = z.infer<typeof unitSchema>;

/**
 * Default values for unit form
 */
export const defaultUnitValues: Partial<UnitFormValues> = {
  unitNumber: '',
  name: '',
  bedrooms: 1,
  bathrooms: 1,
  marketRent: 0,
  status: 'vacant',
  features: [],
  isListed: false,
  listingDescription: '',
};

/**
 * Amenity labels for UI display
 */
export const amenityLabels: Record<typeof unitAmenities[number], string> = {
  dishwasher: 'Dishwasher',
  washer_dryer: 'Washer/Dryer',
  air_conditioning: 'Air Conditioning',
  heating: 'Heating',
  parking: 'Parking',
  balcony: 'Balcony',
  patio: 'Patio',
  pool_access: 'Pool Access',
  gym_access: 'Gym Access',
  pet_friendly: 'Pet Friendly',
  hardwood_floors: 'Hardwood Floors',
  carpet: 'Carpet',
  tile_floors: 'Tile Floors',
  updated_kitchen: 'Updated Kitchen',
  updated_bathroom: 'Updated Bathroom',
  walk_in_closet: 'Walk-in Closet',
  storage: 'Storage',
  elevator_access: 'Elevator Access',
};
