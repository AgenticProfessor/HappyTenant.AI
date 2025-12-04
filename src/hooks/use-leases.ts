import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';

// Types based on Prisma schema
export interface Lease {
  id: string;
  unitId: string;
  leaseType: 'FIXED' | 'MONTH_TO_MONTH' | 'WEEK_TO_WEEK';
  status: 'DRAFT' | 'PENDING_SIGNATURE' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'RENEWED';
  startDate: Date;
  endDate?: Date | null;
  rentAmount: number;
  securityDeposit: number;
  rentDueDay: number;
  lateFeeAmount?: number | null;
  lateFeeType?: 'FLAT' | 'PERCENTAGE' | 'DAILY' | null;
  lateFeeGraceDays: number;
  recurringCharges?: unknown;
  terminationDate?: Date | null;
  terminationReason?: string | null;
  moveOutDate?: Date | null;
  noticeGivenDate?: Date | null;
  noticeGivenBy?: string | null;
  notes?: string | null;
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
  leaseTenants?: LeaseTenant[];
  charges?: Charge[];
  payments?: Payment[];
  _count?: {
    charges: number;
    payments: number;
  };
}

export interface LeaseTenant {
  id: string;
  leaseId: string;
  tenantId: string;
  isPrimary: boolean;
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
}

export interface Charge {
  id: string;
  leaseId: string;
  type: string;
  description: string;
  amount: number;
  dueDate: Date;
  status: string;
}

export interface Payment {
  id: string;
  leaseId: string;
  amount: number;
  method: string;
  status: string;
  receivedAt: Date;
}

// Types for mutations
interface CreateLeaseData {
  unitId: string;
  tenantIds: string[];
  leaseType: Lease['leaseType'];
  startDate: string;
  endDate?: string;
  rentAmount: number;
  securityDeposit: number;
  rentDueDay?: number;
  lateFeeAmount?: number;
  lateFeeType?: 'FLAT' | 'PERCENTAGE' | 'DAILY';
  lateFeeGraceDays?: number;
  recurringCharges?: { name: string; amount: number; frequency: string }[];
  notes?: string;
}

interface UpdateLeaseData {
  id: string;
  leaseType?: Lease['leaseType'];
  endDate?: string;
  rentAmount?: number;
  rentDueDay?: number;
  lateFeeAmount?: number;
  lateFeeType?: 'FLAT' | 'PERCENTAGE' | 'DAILY';
  lateFeeGraceDays?: number;
  recurringCharges?: { name: string; amount: number; frequency: string }[];
  status?: Lease['status'];
  terminationDate?: string;
  terminationReason?: string;
  moveOutDate?: string;
  noticeGivenDate?: string;
  noticeGivenBy?: string;
  notes?: string;
}

// API functions
const fetchLeases = async (params?: {
  status?: string;
  propertyId?: string;
  unitId?: string;
  tenantId?: string;
  search?: string;
}): Promise<Lease[]> => {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.propertyId) searchParams.set('propertyId', params.propertyId);
  if (params?.unitId) searchParams.set('unitId', params.unitId);
  if (params?.tenantId) searchParams.set('tenantId', params.tenantId);
  if (params?.search) searchParams.set('search', params.search);

  const url = `/api/leases${searchParams.toString() ? `?${searchParams}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch leases' }));
    throw new Error(error.error || 'Failed to fetch leases');
  }

  const data = await response.json();
  return data.leases;
};

const fetchLease = async (id: string): Promise<{ lease: Lease; summary: unknown; ledger: unknown[] }> => {
  const response = await fetch(`/api/leases/${id}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch lease' }));
    throw new Error(error.error || 'Failed to fetch lease');
  }

  return response.json();
};

const createLease = async (data: CreateLeaseData): Promise<Lease> => {
  const response = await fetch('/api/leases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create lease' }));
    throw new Error(error.error || 'Failed to create lease');
  }

  const result = await response.json();
  return result.lease;
};

const updateLease = async ({ id, ...data }: UpdateLeaseData): Promise<Lease> => {
  const response = await fetch(`/api/leases/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update lease' }));
    throw new Error(error.error || 'Failed to update lease');
  }

  const result = await response.json();
  return result.lease;
};

const deleteLease = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetch(`/api/leases/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete lease' }));
    throw new Error(error.error || 'Failed to delete lease');
  }

  return response.json();
};

// Hooks

/**
 * Fetch all leases with optional filters
 */
export function useLeases(params?: {
  status?: string;
  propertyId?: string;
  unitId?: string;
  tenantId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.leases, params],
    queryFn: () => fetchLeases(params),
  });
}

/**
 * Fetch a single lease by ID (includes summary and ledger)
 */
export function useLease(id: string) {
  return useQuery({
    queryKey: queryKeys.lease(id),
    queryFn: () => fetchLease(id),
    enabled: !!id,
  });
}

/**
 * Fetch leases for a specific unit
 */
export function useLeasesByUnit(unitId: string) {
  return useQuery({
    queryKey: queryKeys.leaseByUnit(unitId),
    queryFn: () => fetchLeases({ unitId }),
    enabled: !!unitId,
  });
}

/**
 * Create a new lease
 */
export function useCreateLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leases });
      queryClient.invalidateQueries({ queryKey: queryKeys.units });
    },
  });
}

/**
 * Update an existing lease
 */
export function useUpdateLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLease,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lease(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.leases });
    },
  });
}

/**
 * Delete a lease
 */
export function useDeleteLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leases });
      queryClient.invalidateQueries({ queryKey: queryKeys.units });
    },
  });
}
