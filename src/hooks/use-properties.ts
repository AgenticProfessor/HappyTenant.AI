import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';

// Types based on Prisma schema
export interface Property {
  id: string;
  organizationId: string;
  name: string;
  type: 'SINGLE_FAMILY' | 'MULTI_FAMILY' | 'APARTMENT' | 'CONDO' | 'TOWNHOUSE' | 'COMMERCIAL';
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  yearBuilt?: number | null;
  squareFeet?: number | null;
  lotSize?: number | null;
  parkingSpaces?: number | null;
  purchasePrice?: number | null;
  purchaseDate?: Date | null;
  currentValue?: number | null;
  photos: string[];
  notes?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SOLD';
  createdAt: Date;
  updatedAt: Date;
  units?: Unit[];
  _count?: {
    units: number;
  };
}

export interface Unit {
  id: string;
  unitNumber: string;
  status: string;
  marketRent?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
}

// Types for mutations
interface CreatePropertyData {
  name: string;
  type: Property['type'];
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  yearBuilt?: number;
  squareFeet?: number;
  lotSize?: number;
  parkingSpaces?: number;
  purchasePrice?: number;
  purchaseDate?: string;
  currentValue?: number;
  photos?: string[];
  notes?: string;
}

interface UpdatePropertyData extends Partial<CreatePropertyData> {
  id: string;
  status?: Property['status'];
}

// API functions
const fetchProperties = async (params?: {
  status?: string;
  type?: string;
  search?: string;
}): Promise<Property[]> => {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.type) searchParams.set('type', params.type);
  if (params?.search) searchParams.set('search', params.search);

  const url = `/api/properties${searchParams.toString() ? `?${searchParams}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch properties' }));
    throw new Error(error.error || 'Failed to fetch properties');
  }

  const data = await response.json();
  return data.properties;
};

const fetchProperty = async (id: string): Promise<Property> => {
  const response = await fetch(`/api/properties/${id}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch property' }));
    throw new Error(error.error || 'Failed to fetch property');
  }

  const data = await response.json();
  return data.property;
};

const fetchPropertyUnits = async (propertyId: string): Promise<Unit[]> => {
  const response = await fetch(`/api/properties/${propertyId}/units`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch units' }));
    throw new Error(error.error || 'Failed to fetch units');
  }

  const data = await response.json();
  return data.units || [];
};

const createProperty = async (data: CreatePropertyData): Promise<Property> => {
  const response = await fetch('/api/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create property' }));
    throw new Error(error.error || 'Failed to create property');
  }

  const result = await response.json();
  return result.property;
};

const updateProperty = async ({ id, ...data }: UpdatePropertyData): Promise<Property> => {
  const response = await fetch(`/api/properties/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update property' }));
    throw new Error(error.error || 'Failed to update property');
  }

  const result = await response.json();
  return result.property;
};

const deleteProperty = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetch(`/api/properties/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete property' }));
    throw new Error(error.error || 'Failed to delete property');
  }

  return response.json();
};

// Hooks

/**
 * Fetch all properties with optional filters
 */
export function useProperties(params?: {
  status?: string;
  type?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.properties, params],
    queryFn: () => fetchProperties(params),
  });
}

/**
 * Fetch a single property by ID
 */
export function useProperty(id: string) {
  return useQuery({
    queryKey: queryKeys.property(id),
    queryFn: () => fetchProperty(id),
    enabled: !!id,
  });
}

/**
 * Fetch units for a specific property
 */
export function usePropertyUnits(propertyId: string) {
  return useQuery({
    queryKey: queryKeys.propertyUnits(propertyId),
    queryFn: () => fetchPropertyUnits(propertyId),
    enabled: !!propertyId,
  });
}

/**
 * Create a new property
 */
export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      // Invalidate and refetch properties list
      queryClient.invalidateQueries({ queryKey: queryKeys.properties });
    },
  });
}

/**
 * Update an existing property
 */
export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProperty,
    onSuccess: (data) => {
      // Invalidate the specific property and the list
      queryClient.invalidateQueries({ queryKey: queryKeys.property(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties });
    },
  });
}

/**
 * Delete a property
 */
export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      // Invalidate the properties list
      queryClient.invalidateQueries({ queryKey: queryKeys.properties });
    },
  });
}
