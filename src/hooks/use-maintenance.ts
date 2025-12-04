import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';

// Types based on Prisma schema
export interface MaintenanceRequest {
  id: string;
  unitId: string;
  tenantId?: string | null;
  vendorId?: string | null;
  title: string;
  description: string;
  category: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY';
  status: 'SUBMITTED' | 'ACKNOWLEDGED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledDate?: Date | null;
  completedDate?: Date | null;
  estimatedCost?: number | null;
  actualCost?: number | null;
  photos: string[];
  notes?: string | null;
  resolution?: string | null;
  createdAt: Date;
  updatedAt: Date;
  unit?: {
    id: string;
    unitNumber: string;
    property: {
      id: string;
      name: string;
      addressLine1: string;
    };
  };
  tenant?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  vendor?: {
    id: string;
    name: string;
    companyName?: string | null;
    phone?: string | null;
  };
}

// Types for mutations
interface CreateMaintenanceRequestData {
  unitId: string;
  tenantId?: string;
  title: string;
  description: string;
  category: string;
  priority: MaintenanceRequest['priority'];
  photos?: string[];
  notes?: string;
}

interface UpdateMaintenanceRequestData {
  id: string;
  vendorId?: string;
  status?: MaintenanceRequest['status'];
  priority?: MaintenanceRequest['priority'];
  scheduledDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  resolution?: string;
}

// API functions
const fetchMaintenanceRequests = async (params?: {
  status?: string;
  priority?: string;
  propertyId?: string;
  unitId?: string;
  vendorId?: string;
  search?: string;
}): Promise<MaintenanceRequest[]> => {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.priority) searchParams.set('priority', params.priority);
  if (params?.propertyId) searchParams.set('propertyId', params.propertyId);
  if (params?.unitId) searchParams.set('unitId', params.unitId);
  if (params?.vendorId) searchParams.set('vendorId', params.vendorId);
  if (params?.search) searchParams.set('search', params.search);

  const url = `/api/maintenance${searchParams.toString() ? `?${searchParams}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch maintenance requests' }));
    throw new Error(error.error || 'Failed to fetch maintenance requests');
  }

  const data = await response.json();
  return data.maintenanceRequests || data.requests || [];
};

const fetchMaintenanceRequest = async (id: string): Promise<MaintenanceRequest> => {
  const response = await fetch(`/api/maintenance/${id}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch maintenance request' }));
    throw new Error(error.error || 'Failed to fetch maintenance request');
  }

  const data = await response.json();
  return data.maintenanceRequest || data.request;
};

const createMaintenanceRequest = async (data: CreateMaintenanceRequestData): Promise<MaintenanceRequest> => {
  const response = await fetch('/api/maintenance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create maintenance request' }));
    throw new Error(error.error || 'Failed to create maintenance request');
  }

  const result = await response.json();
  return result.maintenanceRequest || result.request;
};

const updateMaintenanceRequest = async ({ id, ...data }: UpdateMaintenanceRequestData): Promise<MaintenanceRequest> => {
  const response = await fetch(`/api/maintenance/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update maintenance request' }));
    throw new Error(error.error || 'Failed to update maintenance request');
  }

  const result = await response.json();
  return result.maintenanceRequest || result.request;
};

const deleteMaintenanceRequest = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetch(`/api/maintenance/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete maintenance request' }));
    throw new Error(error.error || 'Failed to delete maintenance request');
  }

  return response.json();
};

// Hooks

/**
 * Fetch all maintenance requests with optional filters
 */
export function useMaintenanceRequests(params?: {
  status?: string;
  priority?: string;
  propertyId?: string;
  unitId?: string;
  vendorId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.maintenanceRequests, params],
    queryFn: () => fetchMaintenanceRequests(params),
  });
}

/**
 * Fetch a single maintenance request by ID
 */
export function useMaintenanceRequest(id: string) {
  return useQuery({
    queryKey: queryKeys.maintenanceRequest(id),
    queryFn: () => fetchMaintenanceRequest(id),
    enabled: !!id,
  });
}

/**
 * Fetch maintenance requests for a specific unit
 */
export function useMaintenanceByUnit(unitId: string) {
  return useQuery({
    queryKey: queryKeys.maintenanceByUnit(unitId),
    queryFn: () => fetchMaintenanceRequests({ unitId }),
    enabled: !!unitId,
  });
}

/**
 * Fetch maintenance requests for a specific property
 */
export function useMaintenanceByProperty(propertyId: string) {
  return useQuery({
    queryKey: queryKeys.maintenanceByProperty(propertyId),
    queryFn: () => fetchMaintenanceRequests({ propertyId }),
    enabled: !!propertyId,
  });
}

/**
 * Create a new maintenance request
 */
export function useCreateMaintenanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMaintenanceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceRequests });
    },
  });
}

/**
 * Update an existing maintenance request
 */
export function useUpdateMaintenanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMaintenanceRequest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceRequest(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceRequests });
    },
  });
}

/**
 * Delete a maintenance request
 */
export function useDeleteMaintenanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMaintenanceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenanceRequests });
    },
  });
}
