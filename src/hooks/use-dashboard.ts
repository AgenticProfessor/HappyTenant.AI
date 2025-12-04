import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';

export interface DashboardStats {
  totalRevenue: number;
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  activeTenants: number;
  collectionRate: number;
  collectedRent: number;
  outstandingRent: number;
  openMaintenanceRequests: number;
}

export interface DashboardProperty {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  units: number;
}

export interface DashboardTenant {
  id: string;
  name: string;
  email: string;
  status: string;
  avatarUrl?: string;
}

export interface DashboardTransaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  status: string;
}

export interface DashboardMaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  unitId: string;
  property: string;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  properties: DashboardProperty[];
  tenants: DashboardTenant[];
  transactions: DashboardTransaction[];
  maintenanceRequests: DashboardMaintenanceRequest[];
}

// API function
const fetchDashboard = async (): Promise<DashboardData> => {
  const response = await fetch('/api/dashboard');

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch dashboard data' }));
    throw new Error(error.error || 'Failed to fetch dashboard data');
  }

  return response.json();
};

/**
 * Fetch dashboard data including stats, properties, tenants, transactions, and maintenance requests
 */
export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: fetchDashboard,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}
