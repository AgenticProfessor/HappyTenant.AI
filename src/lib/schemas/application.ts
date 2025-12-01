import { z } from 'zod'

// ============================================================
// SHARED TYPES
// ============================================================

export const employmentStatusOptions = [
  'EMPLOYED_FULL_TIME',
  'EMPLOYED_PART_TIME',
  'SELF_EMPLOYED',
  'UNEMPLOYED',
  'RETIRED',
  'STUDENT',
  'OTHER',
] as const

export type EmploymentStatus = typeof employmentStatusOptions[number]

// ============================================================
// APPLICATION LINK SCHEMAS
// ============================================================

export const createApplicationLinkSchema = z.object({
  name: z.string().optional(),
  unitId: z.string().optional(),
  applicationFee: z.number().min(0).max(100).optional(),
  collectFeeOnline: z.boolean().default(false),
  expiresAt: z.string().datetime().optional(),
  maxApplications: z.number().min(1).optional(),
  requiredDocuments: z.array(z.enum(['id', 'pay_stubs', 'bank_statements', 'tax_returns', 'other'])).default([]),
  customQuestions: z.array(z.object({
    question: z.string(),
    required: z.boolean().default(false),
    type: z.enum(['text', 'textarea', 'select', 'checkbox']),
    options: z.array(z.string()).optional(),
  })).optional(),
})

export const updateApplicationLinkSchema = createApplicationLinkSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type CreateApplicationLinkInput = z.infer<typeof createApplicationLinkSchema>
export type UpdateApplicationLinkInput = z.infer<typeof updateApplicationLinkSchema>

// ============================================================
// RENTAL HISTORY SCHEMA
// ============================================================

export const rentalHistorySchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  landlordName: z.string().optional(),
  landlordPhone: z.string().optional(),
  landlordEmail: z.string().email().optional().or(z.literal('')),
  rent: z.number().min(0).optional(),
  moveInDate: z.string().optional(),
  moveOutDate: z.string().optional(),
  reasonForLeaving: z.string().optional(),
})

export type RentalHistory = z.infer<typeof rentalHistorySchema>

// ============================================================
// REFERENCE SCHEMA
// ============================================================

export const referenceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  yearsKnown: z.number().min(0).optional(),
})

export type Reference = z.infer<typeof referenceSchema>

// ============================================================
// PET SCHEMA
// ============================================================

export const petSchema = z.object({
  name: z.string().optional(),
  type: z.string().min(1, 'Pet type is required'), // dog, cat, bird, etc.
  breed: z.string().optional(),
  weight: z.number().min(0).optional(),
  age: z.number().min(0).optional(),
  isServiceAnimal: z.boolean(),
})

export type Pet = z.infer<typeof petSchema>

// ============================================================
// VEHICLE SCHEMA
// ============================================================

export const vehicleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 2).optional(),
  color: z.string().optional(),
  licensePlate: z.string().optional(),
  state: z.string().optional(),
})

export type Vehicle = z.infer<typeof vehicleSchema>

// ============================================================
// ADDITIONAL OCCUPANT SCHEMA
// ============================================================

export const additionalOccupantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  dateOfBirth: z.string().optional(),
  age: z.number().min(0).optional(),
  occupation: z.string().optional(),
})

export type AdditionalOccupant = z.infer<typeof additionalOccupantSchema>

// ============================================================
// STEP-BY-STEP WIZARD SCHEMAS
// ============================================================

// Step 1: Personal Information
export const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  ssn: z.string().optional().refine(
    (val) => !val || val.replace(/\D/g, '').length === 9,
    'SSN must be 9 digits'
  ),
  driversLicense: z.string().optional(),
  driversLicenseState: z.string().optional(),
})

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>

// Step 2: Employment
export const employmentSchema = z.object({
  employmentStatus: z.enum(employmentStatusOptions),
  employerName: z.string().optional(),
  employerPhone: z.string().optional(),
  employerAddress: z.string().optional(),
  jobTitle: z.string().optional(),
  monthlyIncome: z.number().min(0, 'Income must be positive'),
  yearsAtJob: z.number().min(0).optional(),
  additionalIncome: z.number().min(0).optional(),
  additionalIncomeSource: z.string().optional(),
})

export type EmploymentInput = z.infer<typeof employmentSchema>

// Step 3: Rental History
export const rentalHistoryStepSchema = z.object({
  currentAddress: z.string().min(1, 'Current address is required'),
  currentCity: z.string().min(1, 'City is required'),
  currentState: z.string().min(1, 'State is required'),
  currentZip: z.string().min(5, 'ZIP code is required'),
  currentLandlordName: z.string().optional(),
  currentLandlordPhone: z.string().optional(),
  currentRent: z.number().min(0).optional(),
  currentMoveInDate: z.string().optional(),
  reasonForMoving: z.string().optional(),
  rentalHistory: z.array(rentalHistorySchema),
})

export type RentalHistoryStepInput = z.infer<typeof rentalHistoryStepSchema>

// Step 4: References
export const referencesStepSchema = z.object({
  references: z.array(referenceSchema).min(2, 'At least 2 references required'),
})

export type ReferencesStepInput = z.infer<typeof referencesStepSchema>

// Step 5: Additional Info (pets, vehicles, occupants)
export const additionalInfoSchema = z.object({
  // Pets
  hasPets: z.boolean(),
  pets: z.array(petSchema),

  // Vehicles
  hasVehicles: z.boolean(),
  vehicles: z.array(vehicleSchema),

  // Additional occupants
  additionalOccupants: z.array(additionalOccupantSchema),

  // Emergency contact
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
  emergencyContactRelation: z.string().min(1, 'Relationship is required'),
})

export type AdditionalInfoInput = z.infer<typeof additionalInfoSchema>

// Step 6: Documents (handled separately via file upload)
export const documentsStepSchema = z.object({
  uploadedDocuments: z.array(z.object({
    type: z.enum(['id', 'pay_stubs', 'bank_statements', 'tax_returns', 'other']),
    fileId: z.string(),
    fileName: z.string(),
  })).default([]),
})

export type DocumentsStepInput = z.infer<typeof documentsStepSchema>

// Step 7: Consent
export const consentSchema = z.object({
  consentToBackgroundCheck: z.boolean().refine((val) => val === true, {
    message: 'You must consent to a background check',
  }),
  consentToCreditCheck: z.boolean().refine((val) => val === true, {
    message: 'You must consent to a credit check',
  }),
  desiredMoveInDate: z.string().min(1, 'Desired move-in date is required'),
  desiredLeaseTermMonths: z.number().min(1).max(24),
  howDidYouHear: z.string().optional(),
  additionalComments: z.string().optional(),
})

export type ConsentInput = z.infer<typeof consentSchema>

// ============================================================
// COMPLETE APPLICATION SCHEMA (Public Submission)
// ============================================================

export const publicApplicationSchema = z.object({
  // Application link token
  token: z.string().min(1, 'Application link token is required'),

  // Personal Info
  ...personalInfoSchema.shape,

  // Employment
  ...employmentSchema.shape,

  // Rental History
  ...rentalHistoryStepSchema.shape,

  // References
  references: z.array(referenceSchema).min(2, 'At least 2 references required'),

  // Additional Info
  ...additionalInfoSchema.shape,

  // Consent
  ...consentSchema.shape,
})

export type PublicApplicationInput = z.infer<typeof publicApplicationSchema>

// ============================================================
// APPLICATION NOTE SCHEMA
// ============================================================

export const applicationNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  isInternal: z.boolean().default(true),
})

export type ApplicationNoteInput = z.infer<typeof applicationNoteSchema>

// ============================================================
// SCREENING RESULT SCHEMA (Manual Entry)
// ============================================================

export const screeningResultSchema = z.object({
  provider: z.string().default('Manual'),
  creditScore: z.number().min(300).max(850).optional(),
  criminalCheck: z.enum(['PENDING', 'PASS', 'FAIL', 'REVIEW_NEEDED', 'NOT_APPLICABLE']),
  evictionCheck: z.enum(['PENDING', 'PASS', 'FAIL', 'REVIEW_NEEDED', 'NOT_APPLICABLE']),
  incomeVerification: z.enum(['PENDING', 'PASS', 'FAIL', 'REVIEW_NEEDED', 'NOT_APPLICABLE']),
  verifiedIncome: z.number().min(0).optional(),
  notes: z.string().optional(),
})

export type ScreeningResultInput = z.infer<typeof screeningResultSchema>

// ============================================================
// STATUS UPDATE SCHEMA
// ============================================================

export const applicationStatusUpdateSchema = z.object({
  status: z.enum([
    'NEW',
    'UNDER_REVIEW',
    'SCREENING_IN_PROGRESS',
    'APPROVED',
    'DECLINED',
    'WAITLIST',
    'WITHDRAWN',
    'LEASE_SIGNED',
  ]),
  reason: z.string().optional(),
})

export type ApplicationStatusUpdateInput = z.infer<typeof applicationStatusUpdateSchema>

// ============================================================
// EMAIL VERIFICATION SCHEMA
// ============================================================

export const emailVerificationSchema = z.object({
  applicationId: z.string().min(1),
  code: z.string().length(6, 'Verification code must be 6 digits'),
})

export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>
