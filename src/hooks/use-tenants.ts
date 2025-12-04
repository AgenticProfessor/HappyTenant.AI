import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';

// Types based on Prisma schema
export interface Tenant {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: Date | null;
  driversLicense?: string | null;
  driversLicenseState?: string | null;
  employmentStatus?: string | null;
  employerName?: string | null;
  employerPhone?: string | null;
  jobTitle?: string | null;
  monthlyIncome?: number | null;
  hasPets: boolean;
  petDetails?: string | null;
  hasVehicles: boolean;
  vehicleDetails?: string | null;
  householdMembers?: unknown;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  screeningStatus?: string | null;
  isActive: boolean;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  leaseTenants?: LeaseTenant[];
  _count?: {
    leaseTenants: number;
  };
}

export interface LeaseTenant {
  id: string;
  leaseId: string;
  tenantId: string;
  isPrimary: boolean;
  lease: Lease;
}

export interface Lease {
  id: string;
  unitId: string;
  status: string;
  startDate: Date;
  endDate?: Date | null;
  rentAmount: number;
  unit: {
    id: string;
    unitNumber: string;
    property: {
      id: string;
      name: string;
      addressLine1: string;
    };
  };
}

// Types for mutations
interface CreateTenantData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  driversLicense?: string;
  driversLicenseState?: string;
  employmentStatus?: string;
  employerName?: string;
  employerPhone?: string;
  jobTitle?: string;
  monthlyIncome?: number;
  hasPets?: boolean;
  petDetails?: string;
  hasVehicles?: boolean;
  vehicleDetails?: string;
  householdMembers?: { name: string; relationship: string; age?: number }[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  notes?: string;
}

interface UpdateTenantData extends Partial<CreateTenantData> {
  id: string;
  isActive?: boolean;
}

// API functions
const fetchTenants = async (params?: {
  status?: 'active' | 'inactive' | 'all';
  screeningStatus?: string;
  search?: string;
}): Promise<Tenant[]> => {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.screeningStatus) searchParams.set('screeningStatus', params.screeningStatus);
  if (params?.search) searchParams.set('search', params.search);

  const url = `/api/tenants${searchParams.toString() ? `?${searchParams}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch tenants' }));
    throw new Error(error.error || 'Failed to fetch tenants');
  }

  const data = await response.json();
  return data.tenants;
};

const fetchTenant = async (id: string): Promise<Tenant> => {
  const response = await fetch(`/api/tenants/${id}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch tenant' }));
    throw new Error(error.error || 'Failed to fetch tenant');
  }

  const data = await response.json();
  return data.tenant;
};

const fetchTenantLease = async (tenantId: string): Promise<Lease | null> => {
  // Get tenant with their active lease
  const response = await fetch(`/api/tenants/${tenantId}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch tenant lease' }));
    throw new Error(error.error || 'Failed to fetch tenant lease');
  }

  const data = await response.json();
  const tenant = data.tenant as Tenant;

  // Find active lease from leaseTenants
  const activeLeaseTenant = tenant.leaseTenants?.find(
    lt => lt.lease.status === 'ACTIVE'
  );

  return activeLeaseTenant?.lease || null;
};

const createTenant = async (data: CreateTenantData): Promise<Tenant> => {
  const response = await fetch('/api/tenants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create tenant' }));
    throw new Error(error.error || 'Failed to create tenant');
  }

  const result = await response.json();
  return result.tenant;
};

const updateTenant = async ({ id, ...data }: UpdateTenantData): Promise<Tenant> => {
  const response = await fetch(`/api/tenants/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update tenant' }));
    throw new Error(error.error || 'Failed to update tenant');
  }

  const result = await response.json();
  return result.tenant;
};

const deleteTenant = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetch(`/api/tenants/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete tenant' }));
    throw new Error(error.error || 'Failed to delete tenant');
  }

  return response.json();
};

// Hooks

/**
 * Fetch all tenants with optional filters
 */
export function useTenants(params?: {
  status?: 'active' | 'inactive' | 'all';
  screeningStatus?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.tenants, params],
    queryFn: () => fetchTenants(params),
  });
}

/**
 * Fetch a single tenant by ID
 */
export function useTenant(id: string) {
  return useQuery({
    queryKey: queryKeys.tenant(id),
    queryFn: () => fetchTenant(id),
    enabled: !!id,
  });
}

/**
 * Fetch active lease for a tenant
 */
export function useTenantLease(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.leaseByTenant(tenantId),
    queryFn: () => fetchTenantLease(tenantId),
    enabled: !!tenantId,
  });
}

/**
 * Create a new tenant
 */
export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTenant,
    onSuccess: () => {
      // Invalidate and refetch tenants list
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants });
    },
  });
}

/**
 * Update an existing tenant
 */
export function useUpdateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTenant,
    onSuccess: (data) => {
      // Invalidate the specific tenant and the list
      queryClient.invalidateQueries({ queryKey: queryKeys.tenant(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants });
    },
  });
}

/**
 * Delete a tenant
 */
export function useDeleteTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTenant,
    onSuccess: () => {
      // Invalidate the tenants list
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants });
    },
  });
}
