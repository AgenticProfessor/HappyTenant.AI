'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  supabaseId: string;
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
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch user data from database
  const fetchUserData = async (supabaseUserId: string) => {
    try {
      const supabase = createClient();

      // Fetch user with organization
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select(`
          id,
          supabaseId,
          email,
          firstName,
          lastName,
          profileImageUrl,
          role,
          organizationId,
          Organization:organizationId (
            id,
            name,
            slug,
            type,
            subscriptionTier
          )
        `)
        .eq('supabaseId', supabaseUserId)
        .single();

      if (userError) {
        // User doesn't exist in database yet (new user)
        console.log('User not found in database, may need onboarding');
        return;
      }

      if (userData) {
        const fullName = [userData.firstName, userData.lastName].filter(Boolean).join(' ') || userData.email;

        setUser({
          id: userData.id,
          supabaseId: userData.supabaseId,
          email: userData.email,
          name: fullName,
          avatarUrl: userData.profileImageUrl || undefined,
          role: userData.role?.toLowerCase() as 'landlord' | 'tenant' | 'admin' || 'landlord',
        });

        // Set organization if available
        if (userData.Organization) {
          // Supabase returns related data - could be single object or array
          const orgData = Array.isArray(userData.Organization)
            ? userData.Organization[0]
            : userData.Organization;

          if (orgData) {
            const org = orgData as {
              id: string;
              name: string;
              slug: string;
              type: string;
              subscriptionTier: string;
            };
            setOrganization({
              id: org.id,
              name: org.name,
              slug: org.slug,
              type: org.type as 'individual' | 'company',
              subscriptionTier: org.subscriptionTier?.toLowerCase() as 'free' | 'pro' | 'enterprise' || 'free',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (initialSession?.user) {
          setSession(initialSession);
          setSupabaseUser(initialSession.user);
          await fetchUserData(initialSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setSupabaseUser(newSession?.user ?? null);

        if (event === 'SIGNED_IN' && newSession?.user) {
          await fetchUserData(newSession.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setOrganization(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setOrganization(null);
      setSession(null);
      setSupabaseUser(null);
      router.push('/sign-in');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshUser = async () => {
    if (supabaseUser) {
      await fetchUserData(supabaseUser.id);
    }
  };

  const hasRole = (role: string | string[]) => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };

  const hasPermission = (permission: string) => {
    // Basic permission check based on role
    // Can be expanded with more granular permissions
    if (!user) return false;

    const rolePermissions: Record<string, string[]> = {
      admin: ['*'], // Admin has all permissions
      landlord: [
        'properties:read', 'properties:write',
        'tenants:read', 'tenants:write',
        'leases:read', 'leases:write',
        'payments:read', 'payments:write',
        'maintenance:read', 'maintenance:write',
        'reports:read',
      ],
      tenant: [
        'properties:read',
        'leases:read',
        'payments:read', 'payments:write',
        'maintenance:read', 'maintenance:write',
      ],
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  };

  const value: AuthContextType = {
    user,
    supabaseUser,
    session,
    organization,
    isAuthenticated: !!session && !!supabaseUser,
    isLoading,
    logout,
    hasRole,
    hasPermission,
    refreshUser,
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
