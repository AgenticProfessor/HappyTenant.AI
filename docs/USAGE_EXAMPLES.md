# Loading and Error Handling - Usage Examples

This document provides practical examples of using the loading skeletons and error handling components in the Happy Tenant application.

## Table of Contents

1. [Error Boundary Examples](#error-boundary-examples)
2. [Error Display Examples](#error-display-examples)
3. [Loading Skeleton Examples](#loading-skeleton-examples)
4. [Complete Integration Examples](#complete-integration-examples)

## Error Boundary Examples

### Basic Error Boundary

Wrap any component that might throw an error:

```tsx
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function MyPage() {
  return (
    <ErrorBoundary>
      <ComponentThatMightCrash />
    </ErrorBoundary>
  );
}
```

### Error Boundary with Custom Fallback

Provide your own error UI:

```tsx
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MyPage() {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-2">Oops!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message}
            </p>
            <Button onClick={reset}>Try Again</Button>
          </CardContent>
        </Card>
      )}
    >
      <DataTable data={data} />
    </ErrorBoundary>
  );
}
```

### Error Boundary with Error Reporting

Send errors to your monitoring service:

```tsx
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function MyPage() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Send to Sentry, LogRocket, etc.
        console.error('Error:', error);
        console.error('Component Stack:', errorInfo.componentStack);

        // Example: Send to analytics
        // analytics.track('error', {
        //   message: error.message,
        //   stack: error.stack,
        // });
      }}
    >
      <CriticalComponent />
    </ErrorBoundary>
  );
}
```

## Error Display Examples

### Full-Page Error

For critical errors that prevent the entire page from loading:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { ErrorDisplay } from '@/components/ui/error-display';
import { DashboardSkeleton } from '@/components/skeletons';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setData(data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <ErrorDisplay
        variant="full-page"
        title="Unable to Load Dashboard"
        message="We couldn't load your dashboard data. Please try again."
        onRetry={fetchData}
        showGoHome={false} // Already on dashboard
      />
    );
  }

  return <div>{/* Dashboard content */}</div>;
}
```

### Inline Error

For errors in a specific section of a page:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export function RecentTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  const loadTransactions = async () => {
    try {
      setError(null);
      const res = await fetch('/api/transactions/recent');
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      setError(err);
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <ErrorDisplay
          variant="inline"
          title="Failed to Load Transactions"
          message="There was a problem loading your recent transactions."
          onRetry={loadTransactions}
        />
      </Card>
    );
  }

  return (
    <Card>
      {/* Transaction list */}
    </Card>
  );
}
```

### Card Error

For errors in smaller components or cards:

```tsx
import { ErrorDisplay } from '@/components/ui/error-display';

export function PropertyCard({ propertyId }) {
  const { data, error, refetch } = useQuery(['property', propertyId]);

  if (error) {
    return (
      <ErrorDisplay
        variant="card"
        title="Error Loading Property"
        message="Could not load property details."
        onRetry={refetch}
      />
    );
  }

  return <div>{/* Property card content */}</div>;
}
```

## Loading Skeleton Examples

### Dashboard Loading

```tsx
// In src/app/(dashboard)/dashboard/loading.tsx
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';

export default function Loading() {
  return <DashboardSkeleton />;
}
```

### Properties List Loading

```tsx
// In src/app/(dashboard)/dashboard/properties/loading.tsx
import { PropertiesListSkeleton } from '@/components/skeletons/PropertiesListSkeleton';

export default function Loading() {
  return <PropertiesListSkeleton />;
}
```

### Conditional Loading State

```tsx
'use client';

import { useState, useEffect } from 'react';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';

export function TenantsTable() {
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTenants() {
      const res = await fetch('/api/tenants');
      const data = await res.json();
      setTenants(data);
      setIsLoading(false);
    }
    loadTenants();
  }, []);

  if (isLoading) {
    return <TableSkeleton rows={10} columns={6} />;
  }

  return (
    <table>
      {/* Table content */}
    </table>
  );
}
```

### Form Loading

```tsx
import { FormSkeleton } from '@/components/skeletons/FormSkeleton';

export function EditPropertyDialog({ propertyId }) {
  const { data: property, isLoading } = useQuery(['property', propertyId]);

  if (isLoading) {
    return <FormSkeleton fields={6} columns={2} />;
  }

  return (
    <form>
      {/* Form fields */}
    </form>
  );
}
```

## Complete Integration Examples

### Example 1: Data Fetching with All States

```tsx
'use client';

import { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ErrorDisplay } from '@/components/ui/error-display';
import { PropertiesListSkeleton } from '@/components/skeletons';
import { PropertyCard } from '@/components/PropertyCard';

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/properties');

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      setProperties(data);
    } catch (err) {
      setError(err);
      console.error('Error loading properties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  // Loading state
  if (isLoading) {
    return <PropertiesListSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <ErrorDisplay
        variant="full-page"
        title="Failed to Load Properties"
        message="We couldn't load your properties. Please check your connection and try again."
        onRetry={loadProperties}
        showGoHome
      />
    );
  }

  // Success state - wrapped in ErrorBoundary to catch runtime errors
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Properties</h1>

        {properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No properties yet</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
```

### Example 2: Mutation with Optimistic Updates

```tsx
'use client';

import { useState } from 'react';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Button } from '@/components/ui/button';

export function DeletePropertyButton({ propertyId, onDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete property');
      }

      onDeleted(propertyId);
    } catch (err) {
      setError(err);
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <ErrorDisplay
        variant="card"
        title="Failed to Delete"
        message="Could not delete the property. Please try again."
        onRetry={handleDelete}
      />
    );
  }

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? 'Deleting...' : 'Delete Property'}
    </Button>
  );
}
```

### Example 3: Server Component with Suspense

```tsx
// Server Component
import { Suspense } from 'react';
import { PropertiesListSkeleton } from '@/components/skeletons';
import { ErrorBoundary } from '@/components/ui/error-boundary';

async function PropertiesList() {
  const properties = await fetchProperties(); // This is a server action

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Properties</h1>

      <ErrorBoundary>
        <Suspense fallback={<PropertiesListSkeleton />}>
          <PropertiesList />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
```

### Example 4: Multiple Loading States

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/ui/error-display';

export function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [activityError, setActivityError] = useState(null);

  useEffect(() => {
    // Load stats
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setIsLoadingStats(false);
      })
      .catch(err => {
        setStatsError(err);
        setIsLoadingStats(false);
      });

    // Load activity
    fetch('/api/activity/recent')
      .then(res => res.json())
      .then(data => {
        setRecentActivity(data);
        setIsLoadingActivity(false);
      })
      .catch(err => {
        setActivityError(err);
        setIsLoadingActivity(false);
      });
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingStats ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : statsError ? (
            <ErrorDisplay
              variant="inline"
              title="Failed to Load Stats"
              onRetry={() => window.location.reload()}
            />
          ) : (
            <div>{/* Stats content */}</div>
          )}
        </CardContent>
      </Card>

      {/* Activity Card */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingActivity ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : activityError ? (
            <ErrorDisplay
              variant="inline"
              title="Failed to Load Activity"
              onRetry={() => window.location.reload()}
            />
          ) : (
            <div>{/* Activity content */}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### Example 5: Custom Table Loading

```tsx
'use client';

import { useState, useEffect } from 'react';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';
import { ErrorDisplay } from '@/components/ui/error-display';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

export function PaymentsTable() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/payments');
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  if (isLoading) {
    return <TableSkeleton rows={8} columns={5} />;
  }

  if (error) {
    return (
      <ErrorDisplay
        variant="card"
        title="Failed to Load Payments"
        message="Could not load payment history."
        onRetry={loadPayments}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Tenant</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>{payment.date}</TableCell>
            <TableCell>{payment.tenant}</TableCell>
            <TableCell>${payment.amount}</TableCell>
            <TableCell>{payment.status}</TableCell>
            <TableCell>
              <Button size="sm">View</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## Best Practices

1. **Always show loading states** - Never leave users wondering if something is happening
2. **Provide retry options** - Allow users to recover from errors
3. **Use appropriate variants** - Match the error display to the context
4. **Match skeletons to layouts** - Skeletons should mirror the actual content
5. **Handle all states** - Loading, error, empty, and success states
6. **Log errors** - Always log errors for debugging
7. **Test error states** - Simulate errors during development
8. **Accessibility** - Use proper ARIA attributes
9. **User-friendly messages** - Avoid technical jargon in error messages
10. **Progressive enhancement** - Provide fallbacks for all async operations
