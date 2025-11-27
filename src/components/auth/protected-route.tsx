'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('landlord' | 'tenant' | 'admin')[];
  requirePermission?: string;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requirePermission,
  redirectTo = '/sign-in',
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, hasRole, hasPermission } = useAuth();

  useEffect(() => {
    // If still loading, wait
    if (isLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
      // Store the attempted URL to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', pathname);
      router.push(redirectTo);
      return;
    }

    // Check role-based access
    if (allowedRoles && allowedRoles.length > 0) {
      if (!hasRole(allowedRoles)) {
        // Redirect to appropriate dashboard based on user role
        const dashboardPath = user.role === 'tenant' ? '/tenant' : '/dashboard';
        router.push(dashboardPath);
        return;
      }
    }

    // Check permission-based access
    if (requirePermission && !hasPermission(requirePermission)) {
      // Redirect to dashboard if user doesn't have required permission
      const dashboardPath = user.role === 'tenant' ? '/tenant' : '/dashboard';
      router.push(dashboardPath);
      return;
    }
  }, [
    isLoading,
    isAuthenticated,
    user,
    allowedRoles,
    requirePermission,
    hasRole,
    hasPermission,
    router,
    pathname,
    redirectTo,
  ]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check role authorization before rendering
  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return null;
  }

  // Check permission authorization before rendering
  if (requirePermission && !hasPermission(requirePermission)) {
    return null;
  }

  // Render children if all checks pass
  return <>{children}</>;
}

// Higher-order component version for easier use
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Convenience components for specific roles
export function LandlordRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['landlord', 'admin']}>
      {children}
    </ProtectedRoute>
  );
}

export function TenantRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute allowedRoles={['tenant']}>{children}</ProtectedRoute>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>;
}
