import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';

// Types based on Prisma schema
export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  floorPlan?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  squareFeet?: number | null;
  marketRent?: number | null;
  depositAmount?: number | null;
  features: string[];
  photos: string[];
  status: 'VACANT' | 'OCCUPIED' | 'NOTICE_GIVEN' | 'UNDER_RENOVATION' | 'UNDER_APPLICATION' | 'UNLISTED';
  isListed: boolean;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  property?: {
    id: string;
    name: string;
    addressLine1: string;
    city: string;
    state: string;
  };
  leases?: Lease[];
  _count?: {
    leases: number;
    maintenanceRequests: number;
  };
}

export interface Lease {
  id: string;
  status: string;
  startDate: Date;
  endDate?: Date | null;
  rentAmount: number;
  leaseTenants?: {
    tenant: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }[];
}

// Types for mutations
interface CreateUnitData {
  propertyId: string;
  unitNumber: string;
  floorPlan?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  marketRent?: number;
  depositAmount?: number;
  features?: string[];
  photos?: string[];
  notes?: string;
}

interface UpdateUnitData extends Partial<Omit<CreateUnitData, 'propertyId'>> {
  id: string;
  status?: Unit['status'];
  isListed?: boolean;
}

// API functions
const fetchUnits = async (params?: {
  propertyId?: string;
  status?: string;
  search?: string;
}): Promise<Unit[]> => {
  const searchParams = new URLSearchParams();
  if (params?.propertyId) searchParams.set('propertyId', params.propertyId);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.search) searchParams.set('search', params.search);

  const url = `/api/units${searchParams.toString() ? `?${searchParams}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch units' }));
    throw new Error(error.error || 'Failed to fetch units');
  }

  const data = await response.json();
  return data.units;
};

const fetchUnit = async (id: string): Promise<Unit> => {
  const response = await fetch(`/api/units/${id}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch unit' }));
    throw new Error(error.error || 'Failed to fetch unit');
  }

  const data = await response.json();
  return data.unit;
};

const createUnit = async (data: CreateUnitData): Promise<Unit> => {
  // Create unit through property units endpoint
  const response = await fetch(`/api/properties/${data.propertyId}/units`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create unit' }));
    throw new Error(error.error || 'Failed to create unit');
  }

  const result = await response.json();
  return result.unit;
};

const updateUnit = async ({ id, ...data }: UpdateUnitData): Promise<Unit> => {
  const response = await fetch(`/api/units/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update unit' }));
    throw new Error(error.error || 'Failed to update unit');
  }

  const result = await response.json();
  return result.unit;
};

const deleteUnit = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetch(`/api/units/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete unit' }));
    throw new Error(error.error || 'Failed to delete unit');
  }

  return response.json();
};

// Hooks

/**
 * Fetch all units with optional filters
 */
export function useUnits(params?: {
  propertyId?: string;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.units, params],
    queryFn: () => fetchUnits(params),
  });
}

/**
 * Fetch a single unit by ID
 */
export function useUnit(id: string) {
  return useQuery({
    queryKey: queryKeys.unit(id),
    queryFn: () => fetchUnit(id),
    enabled: !!id,
  });
}

/**
 * Create a new unit
 */
export function useCreateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUnit,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units });
      queryClient.invalidateQueries({ queryKey: queryKeys.property(data.propertyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.propertyUnits(data.propertyId) });
    },
  });
}

/**
 * Update an existing unit
 */
export function useUpdateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUnit,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.unit(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.units });
      if (data.property?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.propertyUnits(data.property.id) });
      }
    },
  });
}

/**
 * Delete a unit
 */
export function useDeleteUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties });
    },
  });
}
