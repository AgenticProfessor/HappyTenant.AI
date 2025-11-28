'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface LeaseTenant {
  id: string
  leaseId: string
  tenantId: string
  role: 'PRIMARY' | 'CO_TENANT' | 'GUARANTOR' | 'OCCUPANT'
  tenant: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
  }
}

export interface LeaseCharge {
  id: string
  type: string
  description: string
  amount: number
  dueDate: string
  status: 'DUE' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'VOID' | 'WAIVED'
  billingPeriodStart?: string | null
  billingPeriodEnd?: string | null
}

export interface LeasePayment {
  id: string
  amount: number
  method: string
  status: string
  receivedAt: string
}

export interface Lease {
  id: string
  unitId: string
  leaseType: 'FIXED' | 'MONTH_TO_MONTH' | 'WEEK_TO_WEEK'
  status: 'DRAFT' | 'PENDING_SIGNATURE' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'RENEWED'
  startDate: string
  endDate?: string | null
  rentAmount: number
  rentDueDay: number
  rentFrequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY'
  securityDeposit: number
  petDeposit?: number | null
  otherDeposits?: Array<{ name: string; amount: number }> | null
  lateFeeAmount?: number | null
  lateFeeType: 'FLAT' | 'PERCENTAGE' | 'DAILY'
  lateFeeGraceDays: number
  recurringCharges?: Array<{ name: string; amount: number; frequency: string }> | null
  proratedFirstMonth?: number | null
  terminationDate?: string | null
  terminationReason?: string | null
  moveOutDate?: string | null
  noticeGivenDate?: string | null
  noticeGivenBy?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
  unit: {
    id: string
    unitNumber: string
    property: {
      id: string
      name: string
      addressLine1: string
      city?: string
      state?: string
    }
  }
  leaseTenants: LeaseTenant[]
  _count?: {
    charges: number
    payments: number
  }
}

export interface LeaseDetail extends Lease {
  charges: LeaseCharge[]
  payments: LeasePayment[]
  documents: Array<{
    id: string
    name: string
    type: string
    uploadedAt: string
  }>
}

export interface LeaseSummary {
  totalCharges: number
  totalPaid: number
  balance: number
  rentAmount: number
  securityDeposit: number
  daysUntilEnd: number | null
}

export interface LedgerItem {
  type: 'charge' | 'payment'
  id: string
  date: string
  description: string
  amount: number
  status: string
  balance: number
  chargeType?: string
}

export interface CreateLeaseInput {
  unitId: string
  tenantIds: string[]
  primaryTenantId: string
  leaseType?: 'FIXED' | 'MONTH_TO_MONTH' | 'WEEK_TO_WEEK'
  startDate: string
  endDate?: string
  rentAmount: number
  rentDueDay?: number
  rentFrequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY'
  securityDeposit: number
  petDeposit?: number
  otherDeposits?: Array<{ name: string; amount: number }>
  lateFeeAmount?: number
  lateFeeType?: 'FLAT' | 'PERCENTAGE' | 'DAILY'
  lateFeeGraceDays?: number
  recurringCharges?: Array<{ name: string; amount: number; frequency: string }>
  proratedFirstMonth?: number
  notes?: string
  generateInitialCharges?: boolean
}

export interface UpdateLeaseInput {
  leaseType?: 'FIXED' | 'MONTH_TO_MONTH' | 'WEEK_TO_WEEK'
  endDate?: string | null
  rentAmount?: number
  rentDueDay?: number
  lateFeeAmount?: number
  lateFeeType?: 'FLAT' | 'PERCENTAGE' | 'DAILY'
  lateFeeGraceDays?: number
  recurringCharges?: Array<{ name: string; amount: number; frequency: string }>
  status?: 'DRAFT' | 'PENDING_SIGNATURE' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'RENEWED'
  terminationDate?: string | null
  terminationReason?: string | null
  moveOutDate?: string | null
  noticeGivenDate?: string | null
  noticeGivenBy?: string | null
  notes?: string | null
}

// API Functions
async function fetchLeases(filters?: {
  status?: string
  propertyId?: string
  unitId?: string
}): Promise<{ leases: Lease[] }> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.propertyId) params.set('propertyId', filters.propertyId)
  if (filters?.unitId) params.set('unitId', filters.unitId)

  const response = await fetch(`/api/leases?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch leases')
  }
  return response.json()
}

async function fetchLease(id: string): Promise<{
  lease: LeaseDetail
  summary: LeaseSummary
  ledger: LedgerItem[]
}> {
  const response = await fetch(`/api/leases/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch lease')
  }
  return response.json()
}

async function createLease(data: CreateLeaseInput): Promise<{ lease: Lease }> {
  const response = await fetch('/api/leases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create lease')
  }
  return response.json()
}

async function updateLease(id: string, data: UpdateLeaseInput): Promise<{ lease: Lease }> {
  const response = await fetch(`/api/leases/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update lease')
  }
  return response.json()
}

async function deleteLease(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/leases/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete lease')
  }
  return response.json()
}

// Query Keys
export const leaseKeys = {
  all: ['leases'] as const,
  lists: () => [...leaseKeys.all, 'list'] as const,
  list: (filters?: { status?: string; propertyId?: string; unitId?: string }) =>
    [...leaseKeys.lists(), filters] as const,
  details: () => [...leaseKeys.all, 'detail'] as const,
  detail: (id: string) => [...leaseKeys.details(), id] as const,
}

// Hooks
export function useLeases(filters?: { status?: string; propertyId?: string; unitId?: string }) {
  return useQuery({
    queryKey: leaseKeys.list(filters),
    queryFn: () => fetchLeases(filters),
  })
}

export function useLease(id: string) {
  return useQuery({
    queryKey: leaseKeys.detail(id),
    queryFn: () => fetchLease(id),
    enabled: !!id,
  })
}

export function useCreateLease() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createLease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaseKeys.lists() })
      // Also invalidate units since creating a lease changes unit status
      queryClient.invalidateQueries({ queryKey: ['units'] })
    },
  })
}

export function useUpdateLease() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeaseInput }) =>
      updateLease(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: leaseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leaseKeys.detail(id) })
      // Also invalidate units since lease status changes can affect unit status
      queryClient.invalidateQueries({ queryKey: ['units'] })
    },
  })
}

export function useDeleteLease() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteLease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaseKeys.lists() })
      // Also invalidate units since deleting a lease changes unit status
      queryClient.invalidateQueries({ queryKey: ['units'] })
    },
  })
}

// Utility function to get primary tenant from a lease
export function getPrimaryTenant(lease: Lease | LeaseDetail): LeaseTenant['tenant'] | null {
  const primaryLeaseTenant = lease.leaseTenants.find(lt => lt.role === 'PRIMARY')
  return primaryLeaseTenant?.tenant ?? null
}

// Utility function to format lease address
export function formatLeaseAddress(lease: Lease | LeaseDetail): string {
  const { unit } = lease
  return `${unit.property.name} - Unit ${unit.unitNumber}`
}

// Utility function to check if lease is ending soon (within 60 days)
export function isLeaseEndingSoon(lease: Lease | LeaseDetail, daysThreshold = 60): boolean {
  if (!lease.endDate) return false
  const endDate = new Date(lease.endDate)
  const now = new Date()
  const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return daysUntilEnd > 0 && daysUntilEnd <= daysThreshold
}
