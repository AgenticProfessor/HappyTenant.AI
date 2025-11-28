'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export type VendorType =
  | 'PLUMBER'
  | 'ELECTRICIAN'
  | 'HVAC'
  | 'GENERAL_CONTRACTOR'
  | 'HANDYMAN'
  | 'LANDSCAPER'
  | 'PEST_CONTROL'
  | 'CLEANING'
  | 'LOCKSMITH'
  | 'APPLIANCE_REPAIR'
  | 'PAINTER'
  | 'ROOFER'
  | 'FLOORING'
  | 'INSPECTOR'
  | 'OTHER'

export type VendorStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED'

export interface Vendor {
  id: string
  organizationId: string
  name: string
  type: VendorType
  status: VendorStatus
  contactName?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  website?: string | null
  licenseNumber?: string | null
  insuranceInfo?: string | null
  w9OnFile: boolean
  hourlyRate?: number | null
  rating?: number | null
  notes?: string | null
  isPreferred: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    maintenanceRequests: number
    workOrders: number
  }
}

export interface VendorSummary {
  total: number
  active: number
  preferred: number
}

export interface CreateVendorInput {
  name: string
  type: VendorType
  contactName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  website?: string
  licenseNumber?: string
  insuranceInfo?: string
  w9OnFile?: boolean
  hourlyRate?: number
  notes?: string
  isPreferred?: boolean
}

export interface UpdateVendorInput {
  name?: string
  type?: VendorType
  contactName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  website?: string
  licenseNumber?: string
  insuranceInfo?: string
  w9OnFile?: boolean
  hourlyRate?: number
  notes?: string
  isPreferred?: boolean
  status?: VendorStatus
  rating?: number
}

// API Functions
async function fetchVendors(filters?: {
  type?: string
  status?: string
  search?: string
  isPreferred?: string
}): Promise<{ vendors: Vendor[]; summary: VendorSummary }> {
  const params = new URLSearchParams()
  if (filters?.type) params.set('type', filters.type)
  if (filters?.status) params.set('status', filters.status)
  if (filters?.search) params.set('search', filters.search)
  if (filters?.isPreferred) params.set('isPreferred', filters.isPreferred)

  const response = await fetch(`/api/vendors?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch vendors')
  }
  return response.json()
}

async function fetchVendor(id: string): Promise<{
  vendor: Vendor
  stats: {
    totalJobs: number
    completedJobs: number
    totalSpent: number
    completionRate: number
  }
}> {
  const response = await fetch(`/api/vendors/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch vendor')
  }
  return response.json()
}

async function createVendor(data: CreateVendorInput): Promise<{ vendor: Vendor }> {
  const response = await fetch('/api/vendors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create vendor')
  }
  return response.json()
}

async function updateVendor(id: string, data: UpdateVendorInput): Promise<{ vendor: Vendor }> {
  const response = await fetch(`/api/vendors/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update vendor')
  }
  return response.json()
}

async function deleteVendor(id: string): Promise<{ success: boolean; vendor: Vendor }> {
  const response = await fetch(`/api/vendors/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete vendor')
  }
  return response.json()
}

// Query Keys
export const vendorKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  list: (filters?: Record<string, string | undefined>) =>
    [...vendorKeys.lists(), filters] as const,
  details: () => [...vendorKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
}

// Hooks
export function useVendors(filters?: {
  type?: string
  status?: string
  search?: string
  isPreferred?: string
}) {
  return useQuery({
    queryKey: vendorKeys.list(filters),
    queryFn: () => fetchVendors(filters),
  })
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: vendorKeys.detail(id),
    queryFn: () => fetchVendor(id),
    enabled: !!id,
  })
}

export function useCreateVendor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() })
    },
  })
}

export function useUpdateVendor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVendorInput }) =>
      updateVendor(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() })
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(id) })
    },
  })
}

export function useDeleteVendor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() })
    },
  })
}

// Utility functions
export function getVendorTypeLabel(type: VendorType): string {
  const labels: Record<VendorType, string> = {
    PLUMBER: 'Plumber',
    ELECTRICIAN: 'Electrician',
    HVAC: 'HVAC Technician',
    GENERAL_CONTRACTOR: 'General Contractor',
    HANDYMAN: 'Handyman',
    LANDSCAPER: 'Landscaper',
    PEST_CONTROL: 'Pest Control',
    CLEANING: 'Cleaning Service',
    LOCKSMITH: 'Locksmith',
    APPLIANCE_REPAIR: 'Appliance Repair',
    PAINTER: 'Painter',
    ROOFER: 'Roofer',
    FLOORING: 'Flooring',
    INSPECTOR: 'Inspector',
    OTHER: 'Other',
  }
  return labels[type] || type
}

export function getVendorStatusColor(status: VendorStatus): string {
  const colors: Record<VendorStatus, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    BLOCKED: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}
