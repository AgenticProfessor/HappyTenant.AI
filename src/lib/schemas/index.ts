/**
 * Form Schemas
 *
 * Export all validation schemas for easy importing
 */

// Property schemas
export {
  propertySchema,
  propertyTypes,
  propertyStatuses,
  usStates,
  defaultPropertyValues,
  type PropertyFormValues,
} from './property';

// Unit schemas
export {
  unitSchema,
  unitStatuses,
  unitAmenities,
  amenityLabels,
  defaultUnitValues,
  type UnitFormValues,
} from './unit';

// Tenant schemas
export {
  tenantSchema,
  tenantUpdateSchema,
  emergencyContactSchema,
  type TenantFormData,
  type TenantUpdateFormData,
} from './tenant';

// Lease schemas
export {
  leaseSchema,
  leaseUpdateSchema,
  leaseTypeEnum,
  leaseStatusEnum,
  type LeaseFormData,
  type LeaseUpdateFormData,
} from './lease';

// Maintenance schemas
export {
  maintenanceRequestSchema,
  maintenanceRequestWithEmergencySchema,
  maintenanceCategoryEnum,
  maintenancePriorityEnum,
  contactMethodEnum,
  type MaintenanceRequestFormData,
  type MaintenanceRequestWithEmergencyFormData,
} from './maintenance';
