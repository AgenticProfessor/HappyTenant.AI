import { QueryClient, DefaultOptions } from '@tanstack/react-query';

const queryConfig: DefaultOptions = {
  queries: {
    // Stale time: How long data is considered fresh (5 minutes)
    staleTime: 5 * 60 * 1000,

    // Cache time: How long inactive data stays in cache (10 minutes)
    gcTime: 10 * 60 * 1000,

    // Retry failed requests
    retry: 3,

    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Don't refetch on window focus in development
    refetchOnWindowFocus: process.env.NODE_ENV === 'production',

    // Refetch on reconnect
    refetchOnReconnect: true,

    // Don't refetch on mount if data is still fresh
    refetchOnMount: false,
  },
  mutations: {
    // Retry mutations once
    retry: 1,

    // Retry delay for mutations
    retryDelay: 1000,
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

// Query keys for consistent caching
export const queryKeys = {
  // Properties
  properties: ['properties'] as const,
  property: (id: string) => ['properties', id] as const,
  propertyUnits: (id: string) => ['properties', id, 'units'] as const,

  // Tenants
  tenants: ['tenants'] as const,
  tenant: (id: string) => ['tenants', id] as const,

  // Units
  units: ['units'] as const,
  unit: (id: string) => ['units', id] as const,

  // Leases
  leases: ['leases'] as const,
  lease: (id: string) => ['leases', id] as const,
  leaseByTenant: (tenantId: string) => ['leases', 'tenant', tenantId] as const,

  // Transactions
  transactions: ['transactions'] as const,
  transaction: (id: string) => ['transactions', id] as const,

  // Maintenance
  maintenanceRequests: ['maintenance-requests'] as const,
  maintenanceRequest: (id: string) => ['maintenance-requests', id] as const,
  maintenanceByUnit: (unitId: string) => ['maintenance-requests', 'unit', unitId] as const,

  // Messages
  conversations: ['conversations'] as const,
  conversation: (id: string) => ['conversations', id] as const,
  messages: (conversationId: string) => ['conversations', conversationId, 'messages'] as const,

  // Documents
  documents: ['documents'] as const,
  document: (id: string) => ['documents', id] as const,

  // Dashboard
  dashboardStats: ['dashboard', 'stats'] as const,
  aiInsights: ['dashboard', 'ai-insights'] as const,
};
