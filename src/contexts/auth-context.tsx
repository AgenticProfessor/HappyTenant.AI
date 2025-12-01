'use client';

import { createContext, useContext, ReactNode } from 'react';

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

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Mock user data for testing
  const mockUser: User = {
    id: 'mock-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'landlord',
  };

  const mockOrganization: Organization = {
    id: 'mock-org-id',
    name: 'Test Organization',
    slug: 'test-org',
    type: 'individual',
    subscriptionTier: 'pro',
  };

  const logout = async () => {
    console.log('Mock logout');
  };

  const hasRole = (role: string | string[]) => true;
  const hasPermission = (permission: string) => true;

  const value: AuthContextType = {
    user: mockUser,
    organization: mockOrganization,
    isAuthenticated: true,
    isLoading: false,
    logout,
    hasRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
