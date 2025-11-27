# State Management Setup Documentation

This document provides an overview of the state management architecture implemented for the Happy Tenant application.

## Overview

The application uses a hybrid approach to state management:
- **React Query** for server state (data fetching and caching)
- **Zustand** for client state (UI preferences and session data)
- **React Context** for authentication state

## Installation

The following packages were installed:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools zustand
```

## Architecture

### 1. React Query (Server State)

**Location**: `/src/lib/query-client.ts`, `/src/providers/query-provider.tsx`

React Query manages all server-side data fetching with intelligent caching and background updates.

**Configuration**:
- Stale time: 5 minutes
- Cache time: 10 minutes
- Retry: 3 attempts with exponential backoff
- Devtools enabled in development

**Query Keys**: Centralized in `query-client.ts` for consistency:
```typescript
queryKeys.properties        // All properties
queryKeys.property(id)      // Single property
queryKeys.tenants          // All tenants
queryKeys.tenant(id)       // Single tenant
// ... and more
```

### 2. Data Fetching Hooks

#### Properties Hook (`/src/hooks/use-properties.ts`)

Provides comprehensive property management:

```typescript
// Queries
useProperties()              // Fetch all properties
useProperty(id)              // Fetch single property
usePropertyUnits(id)         // Fetch units for property

// Mutations
useCreateProperty()          // Create new property
useUpdateProperty()          // Update existing property
useDeleteProperty()          // Delete property
```

**Features**:
- Automatic cache invalidation after mutations
- Loading and error states
- Mock data with simulated API delays
- Easy to swap with real API calls

#### Tenants Hook (`/src/hooks/use-tenants.ts`)

Similar structure for tenant management:

```typescript
// Queries
useTenants()                 // Fetch all tenants
useTenant(id)                // Fetch single tenant
useTenantLease(tenantId)     // Fetch tenant's active lease

// Mutations
useCreateTenant()            // Create new tenant
useUpdateTenant()            // Update existing tenant
useDeleteTenant()            // Delete tenant
```

### 3. Zustand Stores (Client State)

#### UI Store (`/src/stores/ui-store.ts`)

Manages all UI-related state with localStorage persistence:

**Features**:
- Sidebar collapsed state
- Modal open/close states (add property, add tenant, etc.)
- Filter preferences (properties, tenants, transactions)
- Sort preferences
- View preferences (grid/list)
- Theme preference

**Usage Example**:
```typescript
import { useUIStore } from '@/stores/ui-store';

function MyComponent() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <button onClick={toggleSidebar}>
      Toggle Sidebar
    </button>
  );
}
```

#### Auth Store (`/src/stores/auth-store.ts`)

Manages authentication state with role-based access control:

**Features**:
- User session data
- Organization context
- Authentication status
- Role-based permissions
- Permission checking functions

**Roles**: `landlord`, `tenant`, `admin`

**Permissions System**:
```typescript
const { hasRole, hasPermission } = useAuthStore();

if (hasRole('landlord')) {
  // Show landlord-specific UI
}

if (hasPermission('manage:properties')) {
  // Allow property management
}
```

### 4. Authentication Context

**Location**: `/src/contexts/auth-context.tsx`

Provides authentication methods and session management:

**Methods**:
```typescript
const {
  user,
  organization,
  isAuthenticated,
  isLoading,
  login,           // Login function (stub for now)
  logout,          // Logout function (stub for now)
  hasRole,
  hasPermission,
} = useAuth();
```

**Current Implementation**: Uses mock authentication
**Production Ready**: Includes TODOs for real API integration

### 5. Protected Routes

**Location**: `/src/components/auth/protected-route.tsx`

Provides route protection with role and permission checking:

**Basic Usage**:
```typescript
<ProtectedRoute allowedRoles={['landlord', 'admin']}>
  <PropertyManagementPage />
</ProtectedRoute>
```

**Convenience Components**:
```typescript
<LandlordRoute>
  <LandlordDashboard />
</LandlordRoute>

<TenantRoute>
  <TenantPortal />
</TenantRoute>

<AdminRoute>
  <AdminPanel />
</AdminRoute>
```

**Features**:
- Automatic redirects for unauthorized users
- Loading states during authentication check
- Role-based access control
- Permission-based access control
- Stores attempted URL for redirect after login

## Provider Setup

**Location**: `/src/app/layout.tsx`

All providers are configured in the root layout:

```typescript
<QueryProvider>          {/* React Query */}
  <AuthProvider>         {/* Authentication */}
    <ThemeProvider>      {/* Dark/Light theme */}
      {children}
    </ThemeProvider>
  </AuthProvider>
</QueryProvider>
```

## Index Files

Convenient barrel exports for cleaner imports:

- `/src/hooks/index.ts` - All data fetching hooks
- `/src/stores/index.ts` - All Zustand stores
- `/src/providers/index.ts` - All providers

**Usage**:
```typescript
// Instead of multiple imports
import { useProperties } from '@/hooks/use-properties';
import { useTenants } from '@/hooks/use-tenants';

// Use barrel export
import { useProperties, useTenants } from '@/hooks';
```

## Switching from Mock to Real API

The architecture is designed for easy API integration:

1. **Update hooks** (`/src/hooks/use-properties.ts`, etc.):
   ```typescript
   // Replace this:
   const fetchProperties = async () => {
     await delay(500);
     return mockProperties;
   };

   // With this:
   const fetchProperties = async () => {
     const response = await fetch(
       `${process.env.NEXT_PUBLIC_API_URL}/api/properties`
     );
     if (!response.ok) throw new Error('Failed to fetch');
     return response.json();
   };
   ```

2. **Configure environment**:
   Set `NEXT_PUBLIC_API_URL` in `.env.local`

3. **Update auth context**:
   Replace stub functions with real API calls

## Benefits

### React Query
- Automatic caching and background updates
- Deduplication of requests
- Loading and error states
- Optimistic updates
- Request cancellation
- Pagination and infinite scroll support

### Zustand
- Minimal boilerplate
- No providers needed (except for persistence)
- TypeScript friendly
- DevTools support
- localStorage persistence
- Small bundle size (~1KB)

### Combined Approach
- Clear separation of concerns
- Server state vs. client state
- Predictable data flow
- Easy to test
- Great developer experience

## Testing

All state management is testable:

```typescript
// Testing React Query hooks
const { result } = renderHook(() => useProperties(), {
  wrapper: QueryProvider,
});

await waitFor(() => expect(result.current.data).toBeDefined());

// Testing Zustand stores
const { result } = renderHook(() => useUIStore());

act(() => {
  result.current.toggleSidebar();
});

expect(result.current.sidebarCollapsed).toBe(true);
```

## DevTools

### React Query DevTools
Available in development mode:
- Press the React Query icon in bottom-right corner
- View all queries and their states
- Manually refetch or invalidate queries
- Inspect cache data

### Zustand DevTools
Use Redux DevTools extension to inspect Zustand stores:
```typescript
import { devtools } from 'zustand/middleware';

create(devtools(/* your store */));
```

## Performance Considerations

1. **Query Keys**: Use specific query keys for precise cache invalidation
2. **Stale Time**: Adjust based on data freshness requirements
3. **Prefetching**: Use prefetchQuery for better UX
4. **Selective Subscriptions**: Only subscribe to needed Zustand state
5. **Persistence**: Only persist necessary UI state

## Future Enhancements

- [ ] Add infinite query support for lists
- [ ] Implement optimistic updates for mutations
- [ ] Add request cancellation
- [ ] Set up query prefetching on route changes
- [ ] Implement offline support
- [ ] Add undo/redo functionality
- [ ] Real-time subscriptions with WebSockets

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)

---

Last Updated: 2025-11-26
