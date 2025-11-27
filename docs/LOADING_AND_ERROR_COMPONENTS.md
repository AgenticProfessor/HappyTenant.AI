# Loading Skeletons and Error Handling Components

This document provides a comprehensive guide to the loading skeleton and error handling components implemented for the Happy Tenant property management application.

## Overview

The application now includes:
- Error boundary components for catching runtime errors
- Standalone error display components
- Global error and 404 pages
- Loading skeleton components for all major pages
- Route-level loading states using Next.js App Router

## Error Handling Components

### 1. ErrorBoundary Component

**Location:** `/src/components/ui/error-boundary.tsx`

A React Error Boundary class component that catches JavaScript errors in child components.

**Features:**
- Catches errors anywhere in the component tree
- Displays friendly error UI with retry functionality
- Optional custom fallback UI via props
- Optional error reporting callback
- Automatic error logging to console

**Usage:**

```tsx
import { ErrorBoundary } from '@/components/ui/error-boundary';

// Basic usage with default error UI
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary
  fallback={(error, reset) => (
    <CustomErrorUI error={error} onReset={reset} />
  )}
  onError={(error, errorInfo) => {
    // Send to error reporting service
    console.error('Error occurred:', error, errorInfo);
  }}
>
  <YourComponent />
</ErrorBoundary>
```

**Props:**
- `children`: ReactNode - Components to wrap
- `fallback?`: (error: Error, reset: () => void) => ReactNode - Custom error UI
- `onError?`: (error: Error, errorInfo: React.ErrorInfo) => void - Error callback

### 2. ErrorDisplay Component

**Location:** `/src/components/ui/error-display.tsx`

A standalone, reusable error display component with multiple variants.

**Features:**
- Three display variants: full-page, inline, card
- Customizable title and message
- Optional retry button
- Optional "Go Back" and "Go Home" buttons
- Accessible with proper ARIA attributes
- Fully typed with TypeScript

**Usage:**

```tsx
import { ErrorDisplay } from '@/components/ui/error-display';

// Full-page error
<ErrorDisplay
  variant="full-page"
  title="Something went wrong"
  message="Unable to load data. Please try again."
  onRetry={() => refetch()}
  showGoHome
/>

// Inline error
<ErrorDisplay
  variant="inline"
  title="Failed to load properties"
  message="There was an error loading your properties."
  onRetry={() => retry()}
  showGoBack
/>

// Card error
<ErrorDisplay
  variant="card"
  title="Error"
  message="Unable to save changes"
  onRetry={() => handleSave()}
/>
```

**Props:**
- `title?`: string - Error title (default: "Something went wrong")
- `message?`: string - Error description
- `variant?`: 'full-page' | 'inline' | 'card' - Display variant
- `onRetry?`: () => void - Retry callback
- `showGoBack?`: boolean - Show back button
- `showGoHome?`: boolean - Show home button
- `className?`: string - Additional CSS classes

## Error Pages

### 3. Global Error Page

**Location:** `/src/app/error.tsx`

Next.js global error page for handling runtime errors.

**Features:**
- Clean, centered error UI
- Reset button to attempt recovery
- Link back to dashboard
- Shows error details in development mode only
- Error digest for tracking
- Automatic error logging

**Props (provided by Next.js):**
- `error`: Error & { digest?: string }
- `reset`: () => void

### 4. 404 Not Found Page

**Location:** `/src/app/not-found.tsx`

Custom 404 page for missing routes.

**Features:**
- Friendly "Page not found" message
- Icon illustration
- Link back to dashboard
- Link to browse properties
- Helpful suggestion for user

## Loading Skeleton Components

### 5. DashboardSkeleton

**Location:** `/src/components/skeletons/DashboardSkeleton.tsx`

Loading skeleton matching the dashboard layout.

**Features:**
- 4 KPI cards skeleton
- AI insights banner skeleton
- Rent collection chart skeleton
- Maintenance requests list skeleton
- Properties sidebar skeleton
- Tenants sidebar skeleton
- Quick actions skeleton
- Matches exact dashboard layout

**Usage:**

```tsx
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';

<DashboardSkeleton />
```

### 6. PropertiesListSkeleton

**Location:** `/src/components/skeletons/PropertiesListSkeleton.tsx`

Loading skeleton for the properties list page.

**Features:**
- Search bar skeleton
- Filter buttons skeleton
- 4 stats cards skeleton
- 6 property cards in grid layout
- Matches properties page layout

**Usage:**

```tsx
import { PropertiesListSkeleton } from '@/components/skeletons/PropertiesListSkeleton';

<PropertiesListSkeleton />
```

### 7. TenantsListSkeleton

**Location:** `/src/components/skeletons/TenantsListSkeleton.tsx`

Loading skeleton for the tenants list page.

**Features:**
- Search and filter skeleton
- 4 stats cards skeleton
- 6 tenant cards in grid layout
- Avatar, contact info, and action buttons skeleton
- Matches tenants page layout

**Usage:**

```tsx
import { TenantsListSkeleton } from '@/components/skeletons/TenantsListSkeleton';

<TenantsListSkeleton />
```

### 8. TableSkeleton

**Location:** `/src/components/skeletons/TableSkeleton.tsx`

Reusable table loading skeleton with configurable rows and columns.

**Features:**
- Configurable number of rows and columns
- Table header skeleton
- Varying column widths for realistic appearance
- Optional card wrapper
- Fully accessible

**Usage:**

```tsx
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';

// Basic usage
<TableSkeleton rows={5} columns={4} />

// Without card wrapper
<TableSkeleton rows={10} columns={6} showCard={false} />
```

**Props:**
- `rows?`: number - Number of skeleton rows (default: 5)
- `columns?`: number - Number of skeleton columns (default: 4)
- `showCard?`: boolean - Wrap in card component (default: true)

### 9. FormSkeleton

**Location:** `/src/components/skeletons/FormSkeleton.tsx`

Reusable form loading skeleton with configurable fields.

**Features:**
- Configurable number of fields
- Optional header skeleton
- Optional card wrapper
- 1 or 2 column layout
- Textarea field skeleton
- Submit button skeleton
- Fully accessible

**Usage:**

```tsx
import { FormSkeleton } from '@/components/skeletons/FormSkeleton';

// Basic usage
<FormSkeleton fields={4} />

// Two-column layout
<FormSkeleton fields={6} columns={2} />

// Without card
<FormSkeleton fields={3} showCard={false} showHeader={false} />
```

**Props:**
- `fields?`: number - Number of form fields (default: 4)
- `showCard?`: boolean - Wrap in card component (default: true)
- `showHeader?`: boolean - Show header skeleton (default: true)
- `columns?`: 1 | 2 - Number of columns (default: 1)

## Loading Pages

### 10. Dashboard Loading

**Location:** `/src/app/(dashboard)/dashboard/loading.tsx`

Next.js loading state for the dashboard route.

```tsx
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';

export default function DashboardLoading() {
  return <DashboardSkeleton />;
}
```

### 11. Properties Loading

**Location:** `/src/app/(dashboard)/dashboard/properties/loading.tsx`

Next.js loading state for the properties route.

```tsx
import { PropertiesListSkeleton } from '@/components/skeletons/PropertiesListSkeleton';

export default function PropertiesLoading() {
  return <PropertiesListSkeleton />;
}
```

### 12. Tenants Loading

**Location:** `/src/app/(dashboard)/dashboard/tenants/loading.tsx`

Next.js loading state for the tenants route.

```tsx
import { TenantsListSkeleton } from '@/components/skeletons/TenantsListSkeleton';

export default function TenantsLoading() {
  return <TenantsListSkeleton />;
}
```

## Barrel Export

**Location:** `/src/components/skeletons/index.ts`

Convenient imports for all skeleton components:

```tsx
import {
  DashboardSkeleton,
  PropertiesListSkeleton,
  TenantsListSkeleton,
  TableSkeleton,
  FormSkeleton,
} from '@/components/skeletons';
```

## Accessibility Features

All components include proper accessibility attributes:

- `aria-busy="true"` - Indicates loading state
- `aria-live="polite"` - Announces changes to screen readers
- Semantic HTML structure
- Keyboard navigation support (for interactive elements)
- Proper ARIA labels on buttons

## Styling

All components use:
- Tailwind CSS v4 classes
- shadcn/ui Skeleton component
- Consistent with application theme
- Subtle pulse animation
- Responsive design for all screen sizes

## Best Practices

1. **Always show loading states** for async operations
2. **Match skeleton to actual layout** for smooth transitions
3. **Use error boundaries** around components that fetch data
4. **Provide retry functionality** when appropriate
5. **Log errors** for debugging and monitoring
6. **Keep error messages user-friendly** and actionable
7. **Test error states** during development

## Example: Complete Data Fetching Pattern

```tsx
'use client';

import { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
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
      const response = await fetch('/api/dashboard');
      const data = await response.json();
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

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <ErrorDisplay
        variant="full-page"
        title="Failed to load dashboard"
        message="There was an error loading your dashboard data."
        onRetry={fetchData}
        showGoHome
      />
    );
  }

  return (
    <ErrorBoundary>
      <div>
        {/* Your dashboard content */}
      </div>
    </ErrorBoundary>
  );
}
```

## File Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── error-boundary.tsx
│   │   ├── error-display.tsx
│   │   └── skeleton.tsx (shadcn/ui)
│   └── skeletons/
│       ├── DashboardSkeleton.tsx
│       ├── PropertiesListSkeleton.tsx
│       ├── TenantsListSkeleton.tsx
│       ├── TableSkeleton.tsx
│       ├── FormSkeleton.tsx
│       └── index.ts
└── app/
    ├── error.tsx
    ├── not-found.tsx
    └── (dashboard)/
        └── dashboard/
            ├── loading.tsx
            ├── page.tsx
            ├── properties/
            │   ├── loading.tsx
            │   └── page.tsx
            └── tenants/
                ├── loading.tsx
                └── page.tsx
```

## Next Steps

Consider implementing:
- Error tracking service integration (Sentry, LogRocket, etc.)
- Custom error pages for specific HTTP status codes
- More granular loading states for individual components
- Optimistic UI updates for better UX
- Retry with exponential backoff for failed requests
- Toast notifications for non-critical errors
