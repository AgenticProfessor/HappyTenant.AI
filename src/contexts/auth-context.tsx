'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const {
    user,
    organization,
    isAuthenticated,
    isLoading,
    login: storeLogin,
    logout: storeLogout,
    hasRole,
    hasPermission,
    setLoading,
  } = useAuthStore();

  // Stub login function - replace with real authentication
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      // TODO: Replace with actual API call
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      //
      // if (!response.ok) throw new Error('Login failed');
      //
      // const { user, organization, token } = await response.json();
      //
      // // Store token
      // localStorage.setItem('auth_token', token);
      //
      // storeLogin(user, organization);

      // For now, simulate successful login
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user data
      const mockUser = {
        id: 'user-1',
        email,
        name: 'Sarah Mitchell',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        role: 'landlord' as const,
      };

      const mockOrg = {
        id: 'org-1',
        name: 'Mitchell Properties',
        slug: 'mitchell-properties',
        type: 'individual' as const,
        subscriptionTier: 'pro' as const,
      };

      storeLogin(mockUser, mockOrg);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Stub logout function - replace with real authentication
  const logout = async () => {
    try {
      setLoading(true);

      // TODO: Replace with actual API call
      // await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      //   },
      // });
      //
      // localStorage.removeItem('auth_token');

      // For now, simulate logout
      await new Promise((resolve) => setTimeout(resolve, 500));

      storeLogout();
      router.push('/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Optional: Validate token on mount
  useEffect(() => {
    const validateSession = async () => {
      // TODO: Replace with actual session validation
      // const token = localStorage.getItem('auth_token');
      // if (!token) {
      //   storeLogout();
      //   return;
      // }
      //
      // try {
      //   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //     },
      //   });
      //
      //   if (!response.ok) {
      //     storeLogout();
      //     return;
      //   }
      //
      //   const { user, organization } = await response.json();
      //   storeLogin(user, organization);
      // } catch (error) {
      //   console.error('Session validation error:', error);
      //   storeLogout();
      // }
    };

    // validateSession();
  }, []);

  const value: AuthContextType = {
    user,
    organization,
    isAuthenticated,
    isLoading,
    login,
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
