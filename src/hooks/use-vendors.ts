import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';

// Vendor stats calculated from maintenance requests
export interface VendorStats {
  totalJobs: number;
  completedJobs: number;
  totalSpent: number;
  completionRate: number;
}

// Types based on Prisma schema
export interface Vendor {
  id: string;
  organizationId: string;
  name: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  categories: string[];
  serviceAreas: string[];
  hourlyRate?: number | null;
  minimumCharge?: number | null;
  insuranceExpirationDate?: Date | null;
  licenseNumber?: string | null;
  licenseExpirationDate?: Date | null;
  w9OnFile: boolean;
  rating?: number | null;
  notes?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: Date;
  updatedAt: Date;
  maintenanceRequests?: MaintenanceRequest[];
  _count?: {
    maintenanceRequests: number;
  };
  stats?: VendorStats;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: Date;
}

// Types for mutations
interface CreateVendorData {
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  categories?: string[];
  serviceAreas?: string[];
  hourlyRate?: number;
  minimumCharge?: number;
  insuranceExpirationDate?: string;
  licenseNumber?: string;
  licenseExpirationDate?: string;
  w9OnFile?: boolean;
  notes?: string;
}

interface UpdateVendorData extends Partial<CreateVendorData> {
  id: string;
  status?: Vendor['status'];
  rating?: number;
}

// API functions
const fetchVendors = async (params?: {
  status?: string;
  category?: string;
  search?: string;
}): Promise<Vendor[]> => {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.search) searchParams.set('search', params.search);

  const url = `/api/vendors${searchParams.toString() ? `?${searchParams}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch vendors' }));
    throw new Error(error.error || 'Failed to fetch vendors');
  }

  const data = await response.json();
  return data.vendors;
};

const fetchVendor = async (id: string): Promise<Vendor> => {
  const response = await fetch(`/api/vendors/${id}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch vendor' }));
    throw new Error(error.error || 'Failed to fetch vendor');
  }

  const data = await response.json();
  return data.vendor;
};

const createVendor = async (data: CreateVendorData): Promise<Vendor> => {
  const response = await fetch('/api/vendors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create vendor' }));
    throw new Error(error.error || 'Failed to create vendor');
  }

  const result = await response.json();
  return result.vendor;
};

const updateVendor = async ({ id, ...data }: UpdateVendorData): Promise<Vendor> => {
  const response = await fetch(`/api/vendors/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update vendor' }));
    throw new Error(error.error || 'Failed to update vendor');
  }

  const result = await response.json();
  return result.vendor;
};

const deleteVendor = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetch(`/api/vendors/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete vendor' }));
    throw new Error(error.error || 'Failed to delete vendor');
  }

  return response.json();
};

// Hooks

/**
 * Fetch all vendors with optional filters
 */
export function useVendors(params?: {
  status?: string;
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.vendors, params],
    queryFn: () => fetchVendors(params),
  });
}

/**
 * Fetch a single vendor by ID
 */
export function useVendor(id: string) {
  return useQuery({
    queryKey: queryKeys.vendor(id),
    queryFn: () => fetchVendor(id),
    enabled: !!id,
  });
}

/**
 * Create a new vendor
 */
export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors });
    },
  });
}

/**
 * Update an existing vendor
 */
export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVendor,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors });
    },
  });
}

/**
 * Delete a vendor
 */
export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors });
    },
  });
}
