'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export type MaintenanceCategory =
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'HVAC'
  | 'APPLIANCE'
  | 'STRUCTURAL'
  | 'PEST_CONTROL'
  | 'LANDSCAPING'
  | 'CLEANING'
  | 'LOCK_KEY'
  | 'GENERAL'
  | 'EMERGENCY'
  | 'OTHER'

export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type MaintenanceStatus =
  | 'SUBMITTED'
  | 'ACKNOWLEDGED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED'

export interface MaintenanceRequest {
  id: string
  unitId: string
  tenantId?: string | null
  category: MaintenanceCategory
  priority: MaintenancePriority
  status: MaintenanceStatus
  title: string
  description: string
  permissionToEnter: boolean
  preferredSchedule?: string | null
  photos: string[]
  scheduledDate?: string | null
  estimatedCost?: number | null
  actualCost?: number | null
  internalNotes?: string | null
  tenantNotes?: string | null
  resolutionNotes?: string | null
  acknowledgedAt?: string | null
  completedAt?: string | null
  createdAt: string
  updatedAt: string
  unit: {
    id: string
    unitNumber: string
    property: {
      id: string
      name: string
      addressLine1: string
    }
  }
  tenant?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
  } | null
  assignedTo?: {
    id: string
    firstName: string
    lastName: string
    email: string
  } | null
  vendor?: {
    id: string
    name: string
    phone?: string | null
    email?: string | null
  } | null
  workOrders?: Array<{
    id: string
    status: string
    createdAt: string
  }>
}

export interface MaintenanceSummary {
  total: number
  open: number
  urgent: number
  completedThisMonth: number
}

export interface CreateMaintenanceInput {
  unitId: string
  tenantId?: string
  category: MaintenanceCategory
  priority?: MaintenancePriority
  title: string
  description: string
  permissionToEnter?: boolean
  preferredSchedule?: string
  photos?: string[]
}

export interface UpdateMaintenanceInput {
  status?: MaintenanceStatus
  priority?: MaintenancePriority
  assignedToId?: string | null
  vendorId?: string | null
  scheduledDate?: string | null
  estimatedCost?: number
  actualCost?: number
  internalNotes?: string
  tenantNotes?: string
  resolutionNotes?: string
}

// API Functions
async function fetchMaintenanceRequests(filters?: {
  status?: string
  priority?: string
  category?: string
  propertyId?: string
  unitId?: string
  tenantId?: string
  assignedTo?: string
}): Promise<{ requests: MaintenanceRequest[]; summary: MaintenanceSummary }> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.priority) params.set('priority', filters.priority)
  if (filters?.category) params.set('category', filters.category)
  if (filters?.propertyId) params.set('propertyId', filters.propertyId)
  if (filters?.unitId) params.set('unitId', filters.unitId)
  if (filters?.tenantId) params.set('tenantId', filters.tenantId)
  if (filters?.assignedTo) params.set('assignedTo', filters.assignedTo)

  const response = await fetch(`/api/maintenance?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch maintenance requests')
  }
  return response.json()
}

async function fetchMaintenanceRequest(id: string): Promise<{
  request: MaintenanceRequest
  metrics: {
    ageInHours: number
    ageInDays: number
    responseTimeHours: number | null
    completionTimeHours: number | null
    isOverdue: boolean
  }
}> {
  const response = await fetch(`/api/maintenance/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch maintenance request')
  }
  return response.json()
}

async function createMaintenanceRequest(
  data: CreateMaintenanceInput
): Promise<{ request: MaintenanceRequest }> {
  const response = await fetch('/api/maintenance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create maintenance request')
  }
  return response.json()
}

async function updateMaintenanceRequest(
  id: string,
  data: UpdateMaintenanceInput
): Promise<{ request: MaintenanceRequest }> {
  const response = await fetch(`/api/maintenance/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update maintenance request')
  }
  return response.json()
}

async function deleteMaintenanceRequest(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/maintenance/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete maintenance request')
  }
  return response.json()
}

// Query Keys
export const maintenanceKeys = {
  all: ['maintenance'] as const,
  lists: () => [...maintenanceKeys.all, 'list'] as const,
  list: (filters?: Record<string, string | undefined>) =>
    [...maintenanceKeys.lists(), filters] as const,
  details: () => [...maintenanceKeys.all, 'detail'] as const,
  detail: (id: string) => [...maintenanceKeys.details(), id] as const,
}

// Hooks
export function useMaintenanceRequests(filters?: {
  status?: string
  priority?: string
  category?: string
  propertyId?: string
  unitId?: string
  tenantId?: string
  assignedTo?: string
}) {
  return useQuery({
    queryKey: maintenanceKeys.list(filters),
    queryFn: () => fetchMaintenanceRequests(filters),
  })
}

export function useMaintenanceRequest(id: string) {
  return useQuery({
    queryKey: maintenanceKeys.detail(id),
    queryFn: () => fetchMaintenanceRequest(id),
    enabled: !!id,
  })
}

export function useCreateMaintenanceRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMaintenanceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() })
    },
  })
}

export function useUpdateMaintenanceRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaintenanceInput }) =>
      updateMaintenanceRequest(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.detail(id) })
    },
  })
}

export function useDeleteMaintenanceRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMaintenanceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() })
    },
  })
}

// Utility functions
export function getMaintenanceStatusColor(status: MaintenanceStatus): string {
  const colors: Record<MaintenanceStatus, string> = {
    SUBMITTED: 'bg-blue-100 text-blue-800',
    ACKNOWLEDGED: 'bg-yellow-100 text-yellow-800',
    SCHEDULED: 'bg-purple-100 text-purple-800',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
    ON_HOLD: 'bg-orange-100 text-orange-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getPriorityColor(priority: MaintenancePriority): string {
  const colors: Record<MaintenancePriority, string> = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
  }
  return colors[priority] || 'bg-gray-100 text-gray-800'
}

export function getCategoryLabel(category: MaintenanceCategory): string {
  const labels: Record<MaintenanceCategory, string> = {
    PLUMBING: 'Plumbing',
    ELECTRICAL: 'Electrical',
    HVAC: 'HVAC',
    APPLIANCE: 'Appliance',
    STRUCTURAL: 'Structural',
    PEST_CONTROL: 'Pest Control',
    LANDSCAPING: 'Landscaping',
    CLEANING: 'Cleaning',
    LOCK_KEY: 'Lock & Key',
    GENERAL: 'General',
    EMERGENCY: 'Emergency',
    OTHER: 'Other',
  }
  return labels[category] || category
}
