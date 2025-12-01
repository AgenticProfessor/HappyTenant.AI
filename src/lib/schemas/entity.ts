import { z } from 'zod';

// ============================================================
// ENUMS
// ============================================================

export const EntityTypeEnum = z.enum([
  'INDIVIDUAL',
  'LLC',
  'SERIES_LLC',
  'SERIES_LLC_CHILD',
  'LP',
  'LLP',
  'S_CORP',
  'C_CORP',
  'TRUST',
  'ESTATE',
  'OTHER',
]);

export const EntityStatusEnum = z.enum([
  'ACTIVE',
  'INACTIVE',
  'DISSOLVED',
  'PENDING_FORMATION',
  'SUSPENDED',
]);

// US State codes for state of formation
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
] as const;

export const StateCodeEnum = z.enum(US_STATES);

// ============================================================
// TYPES
// ============================================================

export type EntityType = z.infer<typeof EntityTypeEnum>;
export type EntityStatus = z.infer<typeof EntityStatusEnum>;
export type StateCode = z.infer<typeof StateCodeEnum>;

// ============================================================
// INPUT SCHEMAS
// ============================================================

export const CreateEntitySchema = z.object({
  name: z.string().min(1, 'Entity name is required').max(200),
  legalName: z.string().max(300).optional().nullable(),
  entityType: EntityTypeEnum,
  parentEntityId: z.string().optional().nullable(),

  // Registration Info
  stateOfFormation: StateCodeEnum.optional().nullable(),
  dateFormed: z.coerce.date().optional().nullable(),
  registeredAgent: z.string().max(200).optional().nullable(),
  registeredAgentAddress: z.string().max(500).optional().nullable(),

  // Tax Info
  ein: z.string()
    .regex(/^\d{2}-\d{7}$/, 'EIN must be in XX-XXXXXXX format')
    .optional()
    .nullable(),

  // Address
  addressLine1: z.string().max(200).optional().nullable(),
  addressLine2: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  country: z.string().max(100).default('USA'),

  // Contact
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().optional().nullable(),

  // Status & Compliance
  status: EntityStatusEnum.default('ACTIVE'),
  annualReportDue: z.coerce.date().optional().nullable(),

  // Settings
  isDefault: z.boolean().default(false),
});

export const UpdateEntitySchema = CreateEntitySchema.partial();

export const EntityFiltersSchema = z.object({
  entityType: EntityTypeEnum.optional(),
  status: EntityStatusEnum.optional(),
  parentEntityId: z.string().optional().nullable(),
  search: z.string().optional(),
  hasProperties: z.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ============================================================
// RESPONSE SCHEMAS
// ============================================================

export const EntitySchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  legalName: z.string().nullable(),
  entityType: EntityTypeEnum,
  isDefault: z.boolean(),

  // Hierarchy
  parentEntityId: z.string().nullable(),

  // Registration
  stateOfFormation: z.string().nullable(),
  dateFormed: z.date().nullable(),
  registeredAgent: z.string().nullable(),
  registeredAgentAddress: z.string().nullable(),

  // Tax
  ein: z.string().nullable(),

  // Address
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string(),

  // Contact
  phone: z.string().nullable(),
  email: z.string().nullable(),

  // Status & Compliance
  status: EntityStatusEnum,
  annualReportDue: z.date().nullable(),
  goodStandingDate: z.date().nullable(),

  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const EntityWithRelationsSchema = EntitySchema.extend({
  // Parent entity info
  parentEntity: z.object({
    id: z.string(),
    name: z.string(),
    entityType: EntityTypeEnum,
  }).nullable(),

  // Child entities count
  _count: z.object({
    childEntities: z.number(),
    properties: z.number(),
    documents: z.number(),
  }),
});

export const EntityListResponseSchema = z.object({
  entities: z.array(EntityWithRelationsSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type CreateEntityInput = z.infer<typeof CreateEntitySchema>;
export type UpdateEntityInput = z.infer<typeof UpdateEntitySchema>;
export type EntityFilters = z.infer<typeof EntityFiltersSchema>;
export type Entity = z.infer<typeof EntitySchema>;
export type EntityWithRelations = z.infer<typeof EntityWithRelationsSchema>;
export type EntityListResponse = z.infer<typeof EntityListResponseSchema>;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getEntityTypeLabel(type: EntityType): string {
  const labels: Record<EntityType, string> = {
    INDIVIDUAL: 'Individual',
    LLC: 'LLC',
    SERIES_LLC: 'Series LLC',
    SERIES_LLC_CHILD: 'Series',
    LP: 'Limited Partnership',
    LLP: 'Limited Liability Partnership',
    S_CORP: 'S Corporation',
    C_CORP: 'C Corporation',
    TRUST: 'Trust',
    ESTATE: 'Estate',
    OTHER: 'Other',
  };
  return labels[type] || type;
}

export function getEntityStatusLabel(status: EntityStatus): string {
  const labels: Record<EntityStatus, string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    DISSOLVED: 'Dissolved',
    PENDING_FORMATION: 'Pending Formation',
    SUSPENDED: 'Suspended',
  };
  return labels[status] || status;
}

export function getEntityStatusColor(status: EntityStatus): string {
  const colors: Record<EntityStatus, string> = {
    ACTIVE: 'success',
    INACTIVE: 'secondary',
    DISSOLVED: 'destructive',
    PENDING_FORMATION: 'warning',
    SUSPENDED: 'destructive',
  };
  return colors[status] || 'secondary';
}

export function canHaveChildEntities(type: EntityType): boolean {
  return type === 'SERIES_LLC';
}

export function isChildEntity(type: EntityType): boolean {
  return type === 'SERIES_LLC_CHILD';
}
