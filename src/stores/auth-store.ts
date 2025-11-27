import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockUser, mockOrganization } from '@/data/mock-data';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'landlord' | 'tenant' | 'admin';
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  type: 'individual' | 'company';
  subscriptionTier: 'free' | 'pro' | 'enterprise';
}

interface AuthState {
  // Auth state
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (user: User, organization?: Organization) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  updateOrganization: (organization: Partial<Organization>) => void;
  setLoading: (loading: boolean) => void;

  // Helpers
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

// Mock permissions based on roles
const ROLE_PERMISSIONS = {
  admin: [
    'manage:properties',
    'manage:tenants',
    'manage:leases',
    'manage:payments',
    'manage:maintenance',
    'manage:documents',
    'manage:users',
    'manage:organization',
    'view:analytics',
    'send:messages',
  ],
  landlord: [
    'manage:properties',
    'manage:tenants',
    'manage:leases',
    'manage:payments',
    'manage:maintenance',
    'manage:documents',
    'view:analytics',
    'send:messages',
  ],
  tenant: [
    'view:lease',
    'view:payments',
    'create:maintenance',
    'view:documents',
    'send:messages',
  ],
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state - using mock data for development
      user: mockUser as User,
      organization: mockOrganization as Organization,
      isAuthenticated: true,
      isLoading: false,

      // Login action
      login: (user, organization) =>
        set({
          user,
          organization: organization || null,
          isAuthenticated: true,
          isLoading: false,
        }),

      // Logout action
      logout: () =>
        set({
          user: null,
          organization: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      // Update user
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      // Update organization
      updateOrganization: (updates) =>
        set((state) => ({
          organization: state.organization
            ? { ...state.organization, ...updates }
            : null,
        })),

      // Set loading state
      setLoading: (loading) => set({ isLoading: loading }),

      // Check if user has a specific role
      hasRole: (role) => {
        const { user } = get();
        if (!user) return false;

        if (Array.isArray(role)) {
          return role.includes(user.role);
        }

        return user.role === role;
      },

      // Check if user has a specific permission
      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;

        const userPermissions = ROLE_PERMISSIONS[user.role] || [];
        return userPermissions.includes(permission);
      },
    }),
    {
      name: 'happy-tenant-auth-storage',
      // Only persist user and organization
      partialize: (state) => ({
        user: state.user,
        organization: state.organization,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors for better performance
export const selectUser = (state: AuthState) => state.user;
export const selectOrganization = (state: AuthState) => state.organization;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
