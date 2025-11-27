import { z } from 'zod';

/**
 * Maintenance request category enum
 */
export const maintenanceCategoryEnum = z.enum([
  'plumbing',
  'electrical',
  'hvac',
  'appliance',
  'structural',
  'pest_control',
  'landscaping',
  'cleaning',
  'other',
]);

/**
 * Maintenance request priority enum
 */
export const maintenancePriorityEnum = z.enum([
  'emergency',
  'high',
  'medium',
  'low',
]);

/**
 * Preferred contact method enum
 */
export const contactMethodEnum = z.enum(['phone', 'email', 'in_app', 'sms']);

/**
 * Maintenance request schema for tenant submissions
 */
export const maintenanceRequestSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),

  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Please provide a detailed description (at least 10 characters)')
    .max(2000, 'Description must be less than 2000 characters'),

  category: maintenanceCategoryEnum.default('other'),

  priority: maintenancePriorityEnum.default('medium'),

  entryPermissionGranted: z.boolean().default(false),

  entryInstructions: z.string().optional(),

  preferredContactMethod: contactMethodEnum.default('in_app'),

  photos: z.array(z.string()).optional().default([]),
});

/**
 * Type inference from maintenance request schema
 */
export type MaintenanceRequestFormData = z.infer<typeof maintenanceRequestSchema>;

/**
 * Emergency check refinement
 */
export const maintenanceRequestWithEmergencySchema = maintenanceRequestSchema.extend({
  isEmergency: z.boolean().default(false),
}).refine(
  (data) => {
    // If marked as emergency, priority should be emergency
    if (data.isEmergency) {
      return data.priority === 'emergency';
    }
    return true;
  },
  {
    message: 'Emergency requests must have emergency priority',
    path: ['priority'],
  }
);

export type MaintenanceRequestWithEmergencyFormData = z.infer<
  typeof maintenanceRequestWithEmergencySchema
>;
