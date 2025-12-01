'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Tenant Auth Context
 * Provides tenant-specific authentication and data context
 */

export interface TenantUser {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
}

export interface TenantLease {
  id: string;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED';
  startDate: string;
  endDate: string;
  rentAmount: number;
  securityDeposit: number;
  rentDueDay: number;
  unit: {
    id: string;
    name: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet?: number;
  };
  property: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    managerName: string;
    managerPhone: string;
    managerEmail: string;
    emergencyPhone?: string;
  };
}

export interface TenantBalance {
  currentDue: number;
  pastDue: number;
  totalBalance: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  nextDueDate: string;
  nextDueAmount: number;
}

export interface TenantAuthContextType {
  tenant: TenantUser | null;
  activeLease: TenantLease | null;
  balance: TenantBalance | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const TenantAuthContext = createContext<TenantAuthContextType | undefined>(undefined);

export function TenantAuthProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<TenantUser | null>(null);
  const [activeLease, setActiveLease] = useState<TenantLease | null>(null);
  const [balance, setBalance] = useState<TenantBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenantData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch tenant profile
      const profileRes = await fetch('/api/tenant/profile');
      if (!profileRes.ok) {
        if (profileRes.status === 404) {
          setError('Tenant account not found. Please contact your property manager.');
          return;
        }
        throw new Error('Failed to fetch tenant profile');
      }
      const profileData = await profileRes.json();
      setTenant(profileData.tenant);
      setActiveLease(profileData.activeLease);

      // Fetch balance information
      const balanceRes = await fetch('/api/tenant/payments/balance');
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance(balanceData);
      }
    } catch (err) {
      console.error('Error fetching tenant data:', err);
      setError('Failed to load your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Use mock data for development
    setTenant({
      id: 'tenant-1',
      clerkId: 'mock-clerk-id',
      email: 'tenant@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '(555) 123-4567',
    });
    setActiveLease({
      id: 'lease-1',
      status: 'ACTIVE',
      startDate: '2024-01-01',
      endDate: '2025-01-01',
      rentAmount: 2500,
      securityDeposit: 2500,
      rentDueDay: 1,
      unit: {
        id: 'unit-1',
        name: 'Unit 3B',
        bedrooms: 2,
        bathrooms: 2,
        squareFeet: 1200,
      },
      property: {
        id: 'property-1',
        name: 'The Heights',
        address: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        managerName: 'Sarah Johnson',
        managerPhone: '(555) 987-6543',
        managerEmail: 'sarah@properties.com',
        emergencyPhone: '(555) 999-9999',
      },
    });
    setBalance({
      currentDue: 0,
      pastDue: 0,
      totalBalance: 0,
      lastPaymentDate: '2024-11-01',
      lastPaymentAmount: 2500,
      nextDueDate: '2024-12-01',
      nextDueAmount: 2500,
    });
    setError(null);
    setIsLoading(false);
  }, []);

  const value: TenantAuthContextType = {
    tenant,
    activeLease,
    balance,
    isLoading,
    isAuthenticated: !!tenant,
    error,
    refetch: fetchTenantData,
  };

  return (
    <TenantAuthContext.Provider value={value}>
      {children}
    </TenantAuthContext.Provider>
  );
}

export function useTenantAuth() {
  const context = useContext(TenantAuthContext);
  // Return default context for SSR/prerendering
  if (context === undefined) {
    return {
      tenant: null,
      activeLease: null,
      balance: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,
      refetch: async () => {},
    };
  }
  return context;
}

/**
 * Hook to get calculated values from tenant data
 */
export function useTenantDashboard() {
  const { activeLease, balance } = useTenantAuth();

  const daysUntilRentDue = React.useMemo(() => {
    if (!balance?.nextDueDate) return null;
    const dueDate = new Date(balance.nextDueDate);
    const today = new Date();
    const diff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [balance?.nextDueDate]);

  const leaseProgress = React.useMemo(() => {
    if (!activeLease) return null;
    const start = new Date(activeLease.startDate).getTime();
    const end = new Date(activeLease.endDate).getTime();
    const now = new Date().getTime();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }, [activeLease]);

  const monthsRemaining = React.useMemo(() => {
    if (!activeLease) return null;
    const end = new Date(activeLease.endDate);
    const now = new Date();
    const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
    return Math.max(0, months);
  }, [activeLease]);

  const paymentStatus = React.useMemo(() => {
    if (!balance) return 'unknown';
    if (balance.pastDue > 0) return 'overdue';
    if (balance.currentDue > 0) return 'due';
    return 'current';
  }, [balance]);

  return {
    daysUntilRentDue,
    leaseProgress,
    monthsRemaining,
    paymentStatus,
  };
}
