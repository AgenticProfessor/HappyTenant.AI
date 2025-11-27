import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Modals
  modals: {
    addProperty: boolean;
    addTenant: boolean;
    addLease: boolean;
    recordPayment: boolean;
    sendMessage: boolean;
    uploadDocument: boolean;
  };
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  closeAllModals: () => void;

  // Filters
  propertyFilters: {
    type: string[];
    status: string[];
    search: string;
  };
  tenantFilters: {
    status: string[];
    search: string;
  };
  transactionFilters: {
    type: string[];
    status: string[];
    dateRange: { from: Date | null; to: Date | null };
    search: string;
  };
  setPropertyFilters: (filters: Partial<UIState['propertyFilters']>) => void;
  setTenantFilters: (filters: Partial<UIState['tenantFilters']>) => void;
  setTransactionFilters: (filters: Partial<UIState['transactionFilters']>) => void;
  resetPropertyFilters: () => void;
  resetTenantFilters: () => void;
  resetTransactionFilters: () => void;

  // Sort preferences
  propertiesSort: {
    field: string;
    direction: 'asc' | 'desc';
  };
  tenantsSort: {
    field: string;
    direction: 'asc' | 'desc';
  };
  transactionsSort: {
    field: string;
    direction: 'asc' | 'desc';
  };
  setPropertiesSort: (field: string, direction: 'asc' | 'desc') => void;
  setTenantsSort: (field: string, direction: 'asc' | 'desc') => void;
  setTransactionsSort: (field: string, direction: 'asc' | 'desc') => void;

  // View preferences
  propertyView: 'grid' | 'list';
  setPropertyView: (view: 'grid' | 'list') => void;

  // Theme (managed by next-themes, but we can store preference)
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const initialFilters = {
  propertyFilters: {
    type: [],
    status: [],
    search: '',
  },
  tenantFilters: {
    status: [],
    search: '',
  },
  transactionFilters: {
    type: [],
    status: [],
    dateRange: { from: null, to: null },
    search: '',
  },
};

const initialSort = {
  propertiesSort: {
    field: 'name',
    direction: 'asc' as const,
  },
  tenantsSort: {
    field: 'name',
    direction: 'asc' as const,
  },
  transactionsSort: {
    field: 'date',
    direction: 'desc' as const,
  },
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar state
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Modal state
      modals: {
        addProperty: false,
        addTenant: false,
        addLease: false,
        recordPayment: false,
        sendMessage: false,
        uploadDocument: false,
      },
      openModal: (modal) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: true },
        })),
      closeModal: (modal) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: false },
        })),
      closeAllModals: () =>
        set({
          modals: {
            addProperty: false,
            addTenant: false,
            addLease: false,
            recordPayment: false,
            sendMessage: false,
            uploadDocument: false,
          },
        }),

      // Filter state
      ...initialFilters,
      setPropertyFilters: (filters) =>
        set((state) => ({
          propertyFilters: { ...state.propertyFilters, ...filters },
        })),
      setTenantFilters: (filters) =>
        set((state) => ({
          tenantFilters: { ...state.tenantFilters, ...filters },
        })),
      setTransactionFilters: (filters) =>
        set((state) => ({
          transactionFilters: { ...state.transactionFilters, ...filters },
        })),
      resetPropertyFilters: () =>
        set({ propertyFilters: initialFilters.propertyFilters }),
      resetTenantFilters: () =>
        set({ tenantFilters: initialFilters.tenantFilters }),
      resetTransactionFilters: () =>
        set({ transactionFilters: initialFilters.transactionFilters }),

      // Sort state
      ...initialSort,
      setPropertiesSort: (field, direction) =>
        set({ propertiesSort: { field, direction } }),
      setTenantsSort: (field, direction) =>
        set({ tenantsSort: { field, direction } }),
      setTransactionsSort: (field, direction) =>
        set({ transactionsSort: { field, direction } }),

      // View preferences
      propertyView: 'grid',
      setPropertyView: (view) => set({ propertyView: view }),

      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'happy-tenant-ui-storage',
      // Only persist certain fields
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        propertyFilters: state.propertyFilters,
        tenantFilters: state.tenantFilters,
        transactionFilters: state.transactionFilters,
        propertiesSort: state.propertiesSort,
        tenantsSort: state.tenantsSort,
        transactionsSort: state.transactionsSort,
        propertyView: state.propertyView,
        theme: state.theme,
      }),
    }
  )
);
