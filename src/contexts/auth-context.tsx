'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useUser, useClerk } from '@clerk/nextjs';

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
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
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

  // Sync Clerk user with our auth store
  useEffect(() => {
    const syncUser = async () => {
      if (!clerkLoaded) return;

      if (isSignedIn && clerkUser) {
        setLoading(true);
        try {
          // Fetch user and organization from our API
          const response = await fetch('/api/auth/me');

          if (response.ok) {
            const data = await response.json();
            storeLogin(
              {
                id: clerkUser.id,
                email: clerkUser.primaryEmailAddress?.emailAddress || '',
                name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
                avatarUrl: clerkUser.imageUrl,
                role: data.user?.role?.toLowerCase() || 'landlord',
              },
              data.organization ? {
                id: data.organization.id,
                name: data.organization.name,
                slug: data.organization.slug,
                type: data.organization.type?.toLowerCase() || 'individual',
                subscriptionTier: data.organization.subscriptionTier?.toLowerCase() || 'free',
              } : {
                id: 'temp',
                name: `${clerkUser.firstName || 'My'}'s Properties`,
                slug: clerkUser.id,
                type: 'individual' as const,
                subscriptionTier: 'free' as const,
              }
            );
          } else {
            // If API fails, use Clerk data directly
            storeLogin(
              {
                id: clerkUser.id,
                email: clerkUser.primaryEmailAddress?.emailAddress || '',
                name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
                avatarUrl: clerkUser.imageUrl,
                role: 'landlord',
              },
              {
                id: 'temp',
                name: `${clerkUser.firstName || 'My'}'s Properties`,
                slug: clerkUser.id,
                type: 'individual' as const,
                subscriptionTier: 'free' as const,
              }
            );
          }
        } catch (error) {
          console.error('Error syncing user:', error);
          // Fallback to Clerk data
          storeLogin(
            {
              id: clerkUser.id,
              email: clerkUser.primaryEmailAddress?.emailAddress || '',
              name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
              avatarUrl: clerkUser.imageUrl,
              role: 'landlord',
            },
            {
              id: 'temp',
              name: `${clerkUser.firstName || 'My'}'s Properties`,
              slug: clerkUser.id,
              type: 'individual' as const,
              subscriptionTier: 'free' as const,
            }
          );
        } finally {
          setLoading(false);
        }
      } else if (clerkLoaded && !isSignedIn) {
        storeLogout();
        setLoading(false);
      }
    };

    syncUser();
  }, [clerkUser, clerkLoaded, isSignedIn, storeLogin, storeLogout, setLoading]);

  // Logout using Clerk
  const logout = async () => {
    try {
      setLoading(true);
      await signOut();
      storeLogout();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    organization,
    isAuthenticated: isSignedIn || isAuthenticated,
    isLoading: !clerkLoaded || isLoading,
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
