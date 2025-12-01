import type {
  PersonalInfoInput,
  EmploymentInput,
  RentalHistoryStepInput,
  ReferencesStepInput,
  AdditionalInfoInput,
  DocumentsStepInput,
  ConsentInput,
} from '@/lib/schemas/application'

export interface ApplicationFormData {
  // Step 1: Personal Info
  personalInfo: Partial<PersonalInfoInput>

  // Payment (conditional step after personal info)
  payment: {
    paymentIntentId?: string
    paid: boolean
  }

  // Step 2: Employment
  employment: Partial<EmploymentInput>

  // Step 3: Rental History
  rentalHistory: Partial<RentalHistoryStepInput>

  // Step 4: References
  references: Partial<ReferencesStepInput>

  // Step 5: Additional Info
  additionalInfo: Partial<AdditionalInfoInput>

  // Step 6: Documents
  documents: Partial<DocumentsStepInput>

  // Step 7: Consent
  consent: Partial<ConsentInput>
}

export interface ApplicationLinkInfo {
  id: string
  name?: string | null
  applicationFee?: number | null
  collectFeeOnline: boolean
  requiredDocuments: string[]
  customQuestions?: Record<string, unknown> | null
  organization: {
    name: string
  }
  unit?: {
    id: string
    unitNumber: string
    bedrooms: number
    bathrooms: number
    squareFeet?: number | null
    rent: number
    property: {
      name: string
      address: string
      city: string
      state: string
      zipCode: string
      imageUrl?: string | null
    }
  } | null
}

export interface WizardStep {
  id: string
  title: string
  shortTitle: string
  description: string
  icon: string
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'personal',
    title: 'Personal Information',
    shortTitle: 'Personal',
    description: 'Tell us about yourself',
    icon: 'user',
  },
  {
    id: 'employment',
    title: 'Employment & Income',
    shortTitle: 'Employment',
    description: 'Your work and income details',
    icon: 'briefcase',
  },
  {
    id: 'rental-history',
    title: 'Rental History',
    shortTitle: 'History',
    description: 'Your previous residences',
    icon: 'home',
  },
  {
    id: 'references',
    title: 'References',
    shortTitle: 'References',
    description: 'Personal and professional contacts',
    icon: 'users',
  },
  {
    id: 'additional',
    title: 'Additional Information',
    shortTitle: 'Additional',
    description: 'Pets, vehicles, and more',
    icon: 'clipboard-list',
  },
  {
    id: 'documents',
    title: 'Documents',
    shortTitle: 'Documents',
    description: 'Upload required documents',
    icon: 'file-text',
  },
  {
    id: 'consent',
    title: 'Review & Submit',
    shortTitle: 'Submit',
    description: 'Review and submit your application',
    icon: 'check-circle',
  },
]

export const EMPTY_FORM_DATA: ApplicationFormData = {
  personalInfo: {},
  payment: {
    paid: false,
  },
  employment: {},
  rentalHistory: {
    rentalHistory: [],
  },
  references: {
    references: [],
  },
  additionalInfo: {
    hasPets: false,
    pets: [],
    hasVehicles: false,
    vehicles: [],
    additionalOccupants: [],
  },
  documents: {
    uploadedDocuments: [],
  },
  consent: {},
}
