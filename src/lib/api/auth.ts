/**
 * Unified Authentication Utilities
 * Single source of truth for API authentication
 */

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApiError } from './handlers';

/**
 * User with organization context
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  organizationId: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  organization: {
    id: string;
    name: string;
    slug: string;
    subscriptionTier: string;
  };
}

/**
 * Tenant with lease context
 */
export interface AuthenticatedTenant {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  activeLeaseIds: string[];
  unitIds: string[];
}

/**
 * Require authentication for landlord/staff users
 * Use this in all /api/* routes (except /api/tenant/*)
 *
 * @returns AuthenticatedUser with full organization context
 * @throws ApiError if not authenticated or user not found
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const session = await auth();

  if (!session.userId) {
    throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          subscriptionTier: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
  }

  if (!user.organization) {
    throw new ApiError('Organization not found', 404, 'ORG_NOT_FOUND');
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    organizationId: user.organizationId,
    role: user.role as 'OWNER' | 'MANAGER' | 'STAFF',
    organization: user.organization,
  };
}

/**
 * Require authentication for tenant portal users
 * Use this in all /api/tenant/* routes
 *
 * @returns AuthenticatedTenant with lease context
 * @throws ApiError if not authenticated or tenant not found
 */
export async function requireTenantAuth(): Promise<AuthenticatedTenant> {
  const session = await auth();

  if (!session.userId) {
    throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  const tenant = await prisma.tenant.findFirst({
    where: {
      userId: session.userId,
    },
    include: {
      leaseTenants: {
        where: {
          lease: { status: 'ACTIVE' },
        },
        include: {
          lease: {
            select: {
              id: true,
              unitId: true,
            },
          },
        },
      },
    },
  });

  if (!tenant) {
    throw new ApiError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  return {
    id: tenant.id,
    email: tenant.email,
    firstName: tenant.firstName,
    lastName: tenant.lastName,
    organizationId: tenant.organizationId,
    activeLeaseIds: tenant.leaseTenants.map(lt => lt.lease.id),
    unitIds: tenant.leaseTenants.map(lt => lt.lease.unitId),
  };
}

/**
 * Verify resource belongs to user's organization
 * Prevents cross-organization data access
 */
export async function requireResourceAccess<T>(
  queryFn: () => Promise<T | null>,
  resourceName: string = 'Resource'
): Promise<T> {
  const resource = await queryFn();

  if (!resource) {
    throw new ApiError(`${resourceName} not found or access denied`, 404, 'NOT_FOUND');
  }

  return resource;
}

/**
 * Check if user has required role
 */
export function requireRole(
  user: AuthenticatedUser,
  allowedRoles: ('OWNER' | 'MANAGER' | 'STAFF')[]
): void {
  if (!allowedRoles.includes(user.role)) {
    throw new ApiError('Insufficient permissions', 403, 'FORBIDDEN');
  }
}

/**
 * Optional authentication - returns user if logged in, null otherwise
 * Use for routes that work for both authenticated and anonymous users
 */
export async function optionalAuth(): Promise<AuthenticatedUser | null> {
  try {
    return await requireAuth();
  } catch {
    return null;
  }
}

/**
 * Get the organization ID for the current request
 * Useful for simpler queries that just need org scoping
 */
export async function getOrganizationId(): Promise<string> {
  const user = await requireAuth();
  return user.organizationId;
}
