import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { mockTenants, mockLeases, getTenantById, getLeaseByTenantId } from '@/data/mock-data';

// Types for mutations
interface CreateTenantData {
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'pending' | 'past';
  moveInDate?: string;
}

interface UpdateTenantData extends Partial<CreateTenantData> {
  id: string;
}

// Simulated API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API functions - easily replaceable with real API calls
const fetchTenants = async () => {
  await delay(500);
  return mockTenants;
};

const fetchTenant = async (id: string) => {
  await delay(300);
  const tenant = getTenantById(id);
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  return tenant;
};

const fetchTenantLease = async (tenantId: string) => {
  await delay(300);
  const lease = getLeaseByTenantId(tenantId);
  return lease || null;
};

const createTenant = async (data: CreateTenantData) => {
  await delay(800);
  // In real implementation, this would call the API
  const newTenant = {
    id: `tenant-${Date.now()}`,
    organizationId: 'org-1',
    ...data,
    avatarUrl: undefined,
  };
  return newTenant;
};

const updateTenant = async (data: UpdateTenantData) => {
  await delay(800);
  const { id, ...updates } = data;
  const tenant = getTenantById(id);
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  // In real implementation, this would call the API
  return { ...tenant, ...updates };
};

const deleteTenant = async (id: string) => {
  await delay(800);
  const tenant = getTenantById(id);
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  // In real implementation, this would call the API
  return { success: true };
};

// Hooks

/**
 * Fetch all tenants
 */
export function useTenants() {
  return useQuery({
    queryKey: queryKeys.tenants,
    queryFn: fetchTenants,
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

// Example of how to switch to real API:
//
// Replace the mock functions with:
//
// const fetchTenants = async () => {
//   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants`);
//   if (!response.ok) throw new Error('Failed to fetch tenants');
//   return response.json();
// };
