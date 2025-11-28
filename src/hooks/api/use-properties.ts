'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface Property {
  id: string
  organizationId: string
  name: string
  type: 'SINGLE_FAMILY' | 'MULTI_FAMILY' | 'APARTMENT' | 'CONDO' | 'TOWNHOUSE' | 'COMMERCIAL'
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
  yearBuilt?: number | null
  squareFeet?: number | null
  lotSize?: number | null
  parkingSpaces?: number | null
  purchasePrice?: number | null
  purchaseDate?: string | null
  currentValue?: number | null
  photos: string[]
  status: 'ACTIVE' | 'INACTIVE' | 'SOLD'
  notes?: string | null
  createdAt: string
  updatedAt: string
  units?: Unit[]
  _count?: {
    units: number
  }
}

export interface Unit {
  id: string
  propertyId: string
  unitNumber: string
  name?: string | null
  bedrooms: number
  bathrooms: number
  squareFeet?: number | null
  floorNumber?: number | null
  amenities: string[]
  marketRent: number
  depositAmount: number
  petsAllowed: boolean
  petDeposit?: number | null
  petRent?: number | null
  smokingAllowed: boolean
  utilitiesIncluded: string[]
  status: 'VACANT' | 'OCCUPIED' | 'NOTICE_GIVEN' | 'UNDER_APPLICATION' | 'MAINTENANCE' | 'OFF_MARKET'
  isListed: boolean
  listingTitle?: string | null
  listingDescription?: string | null
  listingPhotos: string[]
  availableDate?: string | null
  photos: string[]
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePropertyInput {
  name: string
  type: Property['type']
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country?: string
  yearBuilt?: number
  squareFeet?: number
  lotSize?: number
  parkingSpaces?: number
  purchasePrice?: number
  purchaseDate?: string
  currentValue?: number
  photos?: string[]
  notes?: string
}

export interface UpdatePropertyInput extends Partial<CreatePropertyInput> {
  status?: Property['status']
}

export interface CreateUnitInput {
  unitNumber: string
  name?: string
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  floorNumber?: number
  amenities?: string[]
  marketRent: number
  depositAmount: number
  petsAllowed?: boolean
  petDeposit?: number
  petRent?: number
  smokingAllowed?: boolean
  utilitiesIncluded?: string[]
  status?: Unit['status']
  isListed?: boolean
  listingTitle?: string
  listingDescription?: string
  listingPhotos?: string[]
  availableDate?: string
  photos?: string[]
  notes?: string
}

// API Functions
async function fetchProperties(filters?: { status?: string; type?: string; search?: string }): Promise<{ properties: Property[] }> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.type) params.set('type', filters.type)
  if (filters?.search) params.set('search', filters.search)

  const response = await fetch(`/api/properties?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch properties')
  }
  return response.json()
}

async function fetchProperty(id: string): Promise<{ property: Property }> {
  const response = await fetch(`/api/properties/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch property')
  }
  return response.json()
}

async function createProperty(data: CreatePropertyInput): Promise<{ property: Property }> {
  const response = await fetch('/api/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create property')
  }
  return response.json()
}

async function updateProperty(id: string, data: UpdatePropertyInput): Promise<{ property: Property }> {
  const response = await fetch(`/api/properties/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update property')
  }
  return response.json()
}

async function deleteProperty(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/properties/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete property')
  }
  return response.json()
}

async function fetchUnits(propertyId: string, status?: string): Promise<{ units: Unit[] }> {
  const params = new URLSearchParams()
  if (status) params.set('status', status)

  const response = await fetch(`/api/properties/${propertyId}/units?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch units')
  }
  return response.json()
}

async function createUnit(propertyId: string, data: CreateUnitInput): Promise<{ unit: Unit }> {
  const response = await fetch(`/api/properties/${propertyId}/units`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create unit')
  }
  return response.json()
}

// Query Keys
export const propertyKeys = {
  all: ['properties'] as const,
  lists: () => [...propertyKeys.all, 'list'] as const,
  list: (filters?: { status?: string; type?: string; search?: string }) => [...propertyKeys.lists(), filters] as const,
  details: () => [...propertyKeys.all, 'detail'] as const,
  detail: (id: string) => [...propertyKeys.details(), id] as const,
}

export const unitKeys = {
  all: ['units'] as const,
  lists: () => [...unitKeys.all, 'list'] as const,
  list: (propertyId: string, status?: string) => [...unitKeys.lists(), propertyId, status] as const,
}

// Hooks
export function useProperties(filters?: { status?: string; type?: string; search?: string }) {
  return useQuery({
    queryKey: propertyKeys.list(filters),
    queryFn: () => fetchProperties(filters),
  })
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: propertyKeys.detail(id),
    queryFn: () => fetchProperty(id),
    enabled: !!id,
  })
}

export function useCreateProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
    },
  })
}

export function useUpdateProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePropertyInput }) =>
      updateProperty(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(id) })
    },
  })
}

export function useDeleteProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
    },
  })
}

export function useUnits(propertyId: string, status?: string) {
  return useQuery({
    queryKey: unitKeys.list(propertyId, status),
    queryFn: () => fetchUnits(propertyId, status),
    enabled: !!propertyId,
  })
}

export function useCreateUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ propertyId, data }: { propertyId: string; data: CreateUnitInput }) =>
      createUnit(propertyId, data),
    onSuccess: (_, { propertyId }) => {
      queryClient.invalidateQueries({ queryKey: unitKeys.list(propertyId) })
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(propertyId) })
    },
  })
}
