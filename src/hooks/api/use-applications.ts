'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export type ApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'PENDING_SCREENING'
  | 'SCREENING_COMPLETE'
  | 'APPROVED'
  | 'CONDITIONALLY_APPROVED'
  | 'DENIED'
  | 'WITHDRAWN'
  | 'LEASE_OFFERED'
  | 'LEASE_SIGNED'

export interface Application {
  id: string
  unitId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth?: string | null
  driversLicense?: string | null
  driversLicenseState?: string | null
  currentAddress?: string | null
  currentCity?: string | null
  currentState?: string | null
  currentZip?: string | null
  currentLandlordName?: string | null
  currentLandlordPhone?: string | null
  currentRent?: number | null
  reasonForMoving?: string | null
  employmentStatus?: string | null
  employerName?: string | null
  employerPhone?: string | null
  jobTitle?: string | null
  monthlyIncome?: number | null
  additionalIncome?: number | null
  rentalHistory?: Array<{
    address: string
    landlordName?: string
    landlordPhone?: string
    rent?: number
    moveInDate?: string
    moveOutDate?: string
    reasonForLeaving?: string
  }> | null
  additionalOccupants?: Array<{
    name: string
    relationship: string
    age?: number
    occupation?: string
  }> | null
  hasPets: boolean
  pets?: Array<{
    type: string
    breed?: string
    weight?: number
    age?: number
  }> | null
  hasVehicles: boolean
  vehicles?: Array<{
    make: string
    model: string
    year?: number
    color?: string
    licensePlate?: string
    state?: string
  }> | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelation?: string | null
  references?: Array<{
    name: string
    relationship: string
    phone?: string
    email?: string
  }> | null
  consentToBackgroundCheck: boolean
  consentToCreditCheck: boolean
  desiredMoveInDate?: string | null
  desiredLeaseTerm?: number | null
  howDidYouHear?: string | null
  additionalComments?: string | null
  status: ApplicationStatus
  reviewNotes?: string | null
  denialReason?: string | null
  conditionalApprovalTerms?: string | null
  applicationFeeReceived: boolean
  applicationFeePaidAt?: string | null
  submittedAt: string
  reviewedAt?: string | null
  reviewedBy?: string | null
  convertedToTenantId?: string | null
  createdAt: string
  updatedAt: string
  unit: {
    id: string
    unitNumber: string
    marketRent: number
    property: {
      id: string
      name: string
      addressLine1: string
      city?: string
      state?: string
    }
  }
  screeningResult?: {
    id: string
    status: string
    creditScore?: number
    backgroundCheckStatus?: string
    completedAt?: string
  } | null
}

export interface ApplicationAnalysis {
  score: number
  incomeToRentRatio: string | null
  hasRentalHistory: boolean
  hasReferences: boolean
  hasScreeningConsent: boolean
}

export interface CreateApplicationInput {
  unitId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth?: string
  ssn?: string
  driversLicense?: string
  driversLicenseState?: string
  currentAddress?: string
  currentCity?: string
  currentState?: string
  currentZip?: string
  currentLandlordName?: string
  currentLandlordPhone?: string
  currentRent?: number
  currentMoveInDate?: string
  reasonForMoving?: string
  employmentStatus?: string
  employerName?: string
  employerPhone?: string
  employerAddress?: string
  jobTitle?: string
  monthlyIncome?: number
  additionalIncome?: number
  additionalIncomeSource?: string
  rentalHistory?: Array<{
    address: string
    landlordName?: string
    landlordPhone?: string
    rent?: number
    moveInDate?: string
    moveOutDate?: string
    reasonForLeaving?: string
  }>
  additionalOccupants?: Array<{
    name: string
    relationship: string
    age?: number
    occupation?: string
  }>
  hasPets?: boolean
  pets?: Array<{
    type: string
    breed?: string
    weight?: number
    age?: number
  }>
  hasVehicles?: boolean
  vehicles?: Array<{
    make: string
    model: string
    year?: number
    color?: string
    licensePlate?: string
    state?: string
  }>
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelation?: string
  references?: Array<{
    name: string
    relationship: string
    phone?: string
    email?: string
  }>
  consentToBackgroundCheck?: boolean
  consentToCreditCheck?: boolean
  desiredMoveInDate?: string
  desiredLeaseTerm?: number
  howDidYouHear?: string
  additionalComments?: string
}

export interface UpdateApplicationInput {
  status?: ApplicationStatus
  reviewNotes?: string
  denialReason?: string
  conditionalApprovalTerms?: string
  applicationFeeReceived?: boolean
  applicationFeePaidAt?: string
}

// API Functions
async function fetchApplications(filters?: {
  status?: string
  propertyId?: string
  unitId?: string
  search?: string
}): Promise<{ applications: Application[] }> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.propertyId) params.set('propertyId', filters.propertyId)
  if (filters?.unitId) params.set('unitId', filters.unitId)
  if (filters?.search) params.set('search', filters.search)

  const response = await fetch(`/api/applications?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch applications')
  }
  return response.json()
}

async function fetchApplication(id: string): Promise<{
  application: Application
  analysis: ApplicationAnalysis
}> {
  const response = await fetch(`/api/applications/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch application')
  }
  return response.json()
}

async function createApplication(data: CreateApplicationInput): Promise<{ application: Application }> {
  const response = await fetch('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create application')
  }
  return response.json()
}

async function updateApplication(
  id: string,
  data: UpdateApplicationInput
): Promise<{ application: Application }> {
  const response = await fetch(`/api/applications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update application')
  }
  return response.json()
}

async function deleteApplication(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/applications/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete application')
  }
  return response.json()
}

// Query Keys
export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (filters?: { status?: string; propertyId?: string; unitId?: string; search?: string }) =>
    [...applicationKeys.lists(), filters] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
}

// Hooks
export function useApplications(filters?: {
  status?: string
  propertyId?: string
  unitId?: string
  search?: string
}) {
  return useQuery({
    queryKey: applicationKeys.list(filters),
    queryFn: () => fetchApplications(filters),
  })
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => fetchApplication(id),
    enabled: !!id,
  })
}

export function useCreateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() })
      // Also invalidate units since creating an application can change unit status
      queryClient.invalidateQueries({ queryKey: ['units'] })
    },
  })
}

export function useUpdateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApplicationInput }) =>
      updateApplication(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(id) })
      // Also invalidate units and tenants since status changes can affect them
      queryClient.invalidateQueries({ queryKey: ['units'] })
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
  })
}

export function useDeleteApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() })
      // Also invalidate units since deleting an application can change unit status
      queryClient.invalidateQueries({ queryKey: ['units'] })
    },
  })
}

// Utility functions
export function getApplicationStatusColor(status: ApplicationStatus): string {
  const colors: Record<ApplicationStatus, string> = {
    SUBMITTED: 'bg-blue-100 text-blue-800',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
    PENDING_SCREENING: 'bg-purple-100 text-purple-800',
    SCREENING_COMPLETE: 'bg-indigo-100 text-indigo-800',
    APPROVED: 'bg-green-100 text-green-800',
    CONDITIONALLY_APPROVED: 'bg-lime-100 text-lime-800',
    DENIED: 'bg-red-100 text-red-800',
    WITHDRAWN: 'bg-gray-100 text-gray-800',
    LEASE_OFFERED: 'bg-teal-100 text-teal-800',
    LEASE_SIGNED: 'bg-emerald-100 text-emerald-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getApplicationStatusLabel(status: ApplicationStatus): string {
  const labels: Record<ApplicationStatus, string> = {
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    PENDING_SCREENING: 'Pending Screening',
    SCREENING_COMPLETE: 'Screening Complete',
    APPROVED: 'Approved',
    CONDITIONALLY_APPROVED: 'Conditionally Approved',
    DENIED: 'Denied',
    WITHDRAWN: 'Withdrawn',
    LEASE_OFFERED: 'Lease Offered',
    LEASE_SIGNED: 'Lease Signed',
  }
  return labels[status] || status
}

export function formatApplicantName(application: Application): string {
  return `${application.firstName} ${application.lastName}`
}

export function formatApplicationAddress(application: Application): string {
  const { unit } = application
  return `${unit.property.name} - Unit ${unit.unitNumber}`
}
