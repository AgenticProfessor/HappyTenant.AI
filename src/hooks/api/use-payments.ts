'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chargeKeys } from './use-charges'

// Types
export type PaymentMethod =
  | 'CASH'
  | 'CHECK'
  | 'MONEY_ORDER'
  | 'ACH'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'ZELLE'
  | 'VENMO'
  | 'PAYPAL'
  | 'WIRE'
  | 'OTHER'

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED'

export interface ChargeAllocation {
  id: string
  amount: number
  allocatedAt: string
  charge: {
    id: string
    type: string
    description: string
    amount: number
    dueDate: string
  }
}

export interface Payment {
  id: string
  leaseId: string
  tenantId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  receivedAt: string
  processedAt?: string | null
  processedBy?: string | null
  referenceNumber?: string | null
  checkNumber?: string | null
  notes?: string | null
  refundReason?: string | null
  createdAt: string
  updatedAt: string
  lease: {
    id: string
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
  tenant: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  paymentAllocations: ChargeAllocation[]
}

export interface PaymentSummary {
  totalReceived: number
  totalPending: number
  count: number
}

export interface CreatePaymentInput {
  leaseId: string
  tenantId: string
  amount: number
  method: PaymentMethod
  receivedAt: string
  referenceNumber?: string
  checkNumber?: string
  notes?: string
  allocations?: Array<{
    chargeId: string
    amount: number
  }>
  autoAllocate?: boolean
}

export interface UpdatePaymentInput {
  status?: PaymentStatus
  notes?: string
  refundReason?: string
}

// API Functions
async function fetchPayments(filters?: {
  status?: string
  method?: string
  leaseId?: string
  tenantId?: string
  propertyId?: string
  startDate?: string
  endDate?: string
}): Promise<{ payments: Payment[]; summary: PaymentSummary }> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.method) params.set('method', filters.method)
  if (filters?.leaseId) params.set('leaseId', filters.leaseId)
  if (filters?.tenantId) params.set('tenantId', filters.tenantId)
  if (filters?.propertyId) params.set('propertyId', filters.propertyId)
  if (filters?.startDate) params.set('startDate', filters.startDate)
  if (filters?.endDate) params.set('endDate', filters.endDate)

  const response = await fetch(`/api/payments?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch payments')
  }
  return response.json()
}

async function fetchPayment(id: string): Promise<{
  payment: Payment
  allocationSummary: {
    totalAmount: number
    totalAllocated: number
    unallocatedAmount: number
    isFullyAllocated: boolean
    allocationCount: number
  }
}> {
  const response = await fetch(`/api/payments/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch payment')
  }
  return response.json()
}

async function createPayment(data: CreatePaymentInput): Promise<{ payment: Payment }> {
  const response = await fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create payment')
  }
  return response.json()
}

async function updatePayment(id: string, data: UpdatePaymentInput): Promise<{ payment: Payment }> {
  const response = await fetch(`/api/payments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update payment')
  }
  return response.json()
}

async function deletePayment(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/payments/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete payment')
  }
  return response.json()
}

// Query Keys
export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (filters?: Record<string, string | undefined>) =>
    [...paymentKeys.lists(), filters] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
}

// Hooks
export function usePayments(filters?: {
  status?: string
  method?: string
  leaseId?: string
  tenantId?: string
  propertyId?: string
  startDate?: string
  endDate?: string
}) {
  return useQuery({
    queryKey: paymentKeys.list(filters),
    queryFn: () => fetchPayments(filters),
  })
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => fetchPayment(id),
    enabled: !!id,
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: chargeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['leases'] })
    },
  })
}

export function useUpdatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentInput }) =>
      updatePayment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: chargeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['leases'] })
    },
  })
}

export function useDeletePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: chargeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['leases'] })
    },
  })
}

// Utility functions
export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-purple-100 text-purple-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    CASH: 'Cash',
    CHECK: 'Check',
    MONEY_ORDER: 'Money Order',
    ACH: 'ACH Transfer',
    CREDIT_CARD: 'Credit Card',
    DEBIT_CARD: 'Debit Card',
    ZELLE: 'Zelle',
    VENMO: 'Venmo',
    PAYPAL: 'PayPal',
    WIRE: 'Wire Transfer',
    OTHER: 'Other',
  }
  return labels[method] || method
}

// formatCurrency is exported from use-charges.ts to avoid duplicate exports

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}
