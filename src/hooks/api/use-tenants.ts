'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface Tenant {
  id: string
  organizationId: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  dateOfBirth?: string | null
  driversLicense?: string | null
  driversLicenseState?: string | null
  employmentStatus?: string | null
  employerName?: string | null
  employerPhone?: string | null
  jobTitle?: string | null
  monthlyIncome?: number | null
  incomeVerified: boolean
  hasPets: boolean
  petDetails?: string | null
  hasVehicles: boolean
  vehicleDetails?: string | null
  householdMembers?: Array<{ name: string; relationship: string; age?: number }> | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelation?: string | null
  screeningStatus: 'NOT_STARTED' | 'PENDING' | 'PASSED' | 'FAILED' | 'REVIEW_NEEDED'
  notes?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  leaseTenants?: Array<{
    lease: {
      id: string
      status: string
      unit: {
        id: string
        unitNumber: string
        property: {
          id: string
          name: string
          addressLine1: string
        }
      }
    }
  }>
  _count?: {
    leaseTenants: number
    payments: number
    maintenanceRequests: number
  }
}

export interface CreateTenantInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  driversLicense?: string
  driversLicenseState?: string
  employmentStatus?: string
  employerName?: string
  employerPhone?: string
  jobTitle?: string
  monthlyIncome?: number
  hasPets?: boolean
  petDetails?: string
  hasVehicles?: boolean
  vehicleDetails?: string
  householdMembers?: Array<{ name: string; relationship: string; age?: number }>
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelation?: string
  notes?: string
}

export interface UpdateTenantInput extends Partial<CreateTenantInput> {
  screeningStatus?: Tenant['screeningStatus']
  isActive?: boolean
  incomeVerified?: boolean
}

// API Functions
async function fetchTenants(filters?: { search?: string; status?: string; screeningStatus?: string }): Promise<{ tenants: Tenant[] }> {
  const params = new URLSearchParams()
  if (filters?.search) params.set('search', filters.search)
  if (filters?.status) params.set('status', filters.status)
  if (filters?.screeningStatus) params.set('screeningStatus', filters.screeningStatus)

  const response = await fetch(`/api/tenants?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch tenants')
  }
  return response.json()
}

async function fetchTenant(id: string): Promise<{ tenant: Tenant; summary: { totalBalance: number; activeLeases: number; totalPayments: number; openMaintenanceRequests: number } }> {
  const response = await fetch(`/api/tenants/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch tenant')
  }
  return response.json()
}

async function createTenant(data: CreateTenantInput): Promise<{ tenant: Tenant }> {
  const response = await fetch('/api/tenants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create tenant')
  }
  return response.json()
}

async function updateTenant(id: string, data: UpdateTenantInput): Promise<{ tenant: Tenant }> {
  const response = await fetch(`/api/tenants/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update tenant')
  }
  return response.json()
}

async function deleteTenant(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/tenants/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete tenant')
  }
  return response.json()
}

// Query Keys
export const tenantKeys = {
  all: ['tenants'] as const,
  lists: () => [...tenantKeys.all, 'list'] as const,
  list: (filters?: { search?: string; status?: string; screeningStatus?: string }) => [...tenantKeys.lists(), filters] as const,
  details: () => [...tenantKeys.all, 'detail'] as const,
  detail: (id: string) => [...tenantKeys.details(), id] as const,
}

// Hooks
export function useTenants(filters?: { search?: string; status?: string; screeningStatus?: string }) {
  return useQuery({
    queryKey: tenantKeys.list(filters),
    queryFn: () => fetchTenants(filters),
  })
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: tenantKeys.detail(id),
    queryFn: () => fetchTenant(id),
    enabled: !!id,
  })
}

export function useCreateTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() })
    },
  })
}

export function useUpdateTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenantInput }) =>
      updateTenant(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tenantKeys.detail(id) })
    },
  })
}

export function useDeleteTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() })
    },
  })
}
