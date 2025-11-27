# Forms Documentation

This document provides comprehensive documentation for all forms and validation schemas in the Happy Tenant application.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Form Schemas](#form-schemas)
  - [Tenant Schema](#tenant-schema)
  - [Lease Schema](#lease-schema)
  - [Maintenance Request Schema](#maintenance-request-schema)
- [Form Components](#form-components)
  - [TenantEditForm](#tenanteditform)
  - [TenantEditDialog](#tenanteditdialog)
  - [LeaseForm](#leaseform)
  - [CreateLeaseDialog](#createleasedialog)
  - [MaintenanceRequestForm](#maintenancerequestform)
- [Usage Examples](#usage-examples)

## Overview

All forms in the Happy Tenant application use:
- **React Hook Form** for form state management
- **Zod** for schema validation
- **shadcn/ui** components for UI elements
- **TypeScript** for type safety
- **Sonner** for toast notifications

## Installation

All required dependencies are already installed:

```json
{
  "react-hook-form": "^7.66.1",
  "@hookform/resolvers": "^5.2.2",
  "zod": "^4.1.13",
  "sonner": "^2.0.7"
}
```

## Form Schemas

All schemas are located in `/src/lib/schemas/`.

### Tenant Schema

**Location:** `/src/lib/schemas/tenant.ts`

```typescript
import { tenantSchema, type TenantFormData } from '@/lib/schemas/tenant';

// Schema validates:
// - firstName: Required, 2-50 characters
// - lastName: Required, 2-50 characters
// - email: Required, valid email format
// - phone: Optional, valid phone format
// - emergencyContactName: Optional
// - emergencyContactPhone: Optional, valid phone format
// - emergencyContactRelationship: Optional
// - notes: Optional
// - employerName: Optional
// - monthlyIncome: Optional, positive number
```

### Lease Schema

**Location:** `/src/lib/schemas/lease.ts`

```typescript
import { leaseSchema, type LeaseFormData } from '@/lib/schemas/lease';

// Schema validates:
// - tenantId: Required
// - unitId: Required
// - leaseType: 'fixed', 'month_to_month', or 'week_to_week'
// - startDate: Required date
// - endDate: Required for fixed leases, must be after start date
// - rentAmount: Required, positive number up to $999,999
// - rentDueDay: 1-28
// - securityDeposit: Optional, non-negative
// - petDeposit: Optional, non-negative
// - lateFeeAmount: Optional, non-negative
// - lateFeeGraceDays: Optional, 0-30
// - status: draft, pending_signature, active, expired, terminated, renewed
// - terms: Optional text
// - notes: Optional text

// Custom validations:
// - End date must be after start date
// - Fixed leases require end date
// - Fixed leases must be at least 30 days
```

### Maintenance Request Schema

**Location:** `/src/lib/schemas/maintenance.ts`

```typescript
import {
  maintenanceRequestSchema,
  type MaintenanceRequestFormData
} from '@/lib/schemas/maintenance';

// Schema validates:
// - title: Required, 5-100 characters
// - description: Required, 10-2000 characters
// - category: plumbing, electrical, hvac, appliance, structural,
//            pest_control, landscaping, cleaning, other
// - priority: emergency, high, medium, low
// - entryPermissionGranted: Boolean
// - entryInstructions: Optional text
// - preferredContactMethod: phone, email, in_app, sms
// - photos: Optional array of strings
```

## Form Components

### TenantEditForm

**Location:** `/src/components/tenants/TenantEditForm.tsx`

A comprehensive form for editing tenant information.

**Features:**
- Basic contact information (name, email, phone)
- Emergency contact details
- Employment information
- Internal notes
- Full validation with error messages
- Loading states
- Toast notifications

**Props:**

```typescript
interface TenantEditFormProps {
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
    notes?: string;
    employerName?: string;
    monthlyIncome?: number;
  };
  onSave: (data: TenantFormData) => void | Promise<void>;
  onCancel: () => void;
}
```

**Usage:**

```tsx
import { TenantEditForm } from '@/components/tenants';

function MyComponent() {
  const handleSave = async (data: TenantFormData) => {
    await updateTenant(tenant.id, data);
  };

  return (
    <TenantEditForm
      tenant={currentTenant}
      onSave={handleSave}
      onCancel={() => setEditMode(false)}
    />
  );
}
```

### TenantEditDialog

**Location:** `/src/components/tenants/TenantEditDialog.tsx`

Dialog wrapper for the TenantEditForm.

**Features:**
- Modal dialog interface
- Responsive layout
- Auto-closes on save
- Handles all form state

**Props:**

```typescript
interface TenantEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: /* same as TenantEditForm */;
  onSave: (data: TenantFormData) => void | Promise<void>;
}
```

**Usage:**

```tsx
import { TenantEditDialog } from '@/components/tenants';
import { useState } from 'react';

function TenantList() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  return (
    <>
      <Button onClick={() => {
        setSelectedTenant(tenant);
        setIsOpen(true);
      }}>
        Edit
      </Button>

      {selectedTenant && (
        <TenantEditDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          tenant={selectedTenant}
          onSave={async (data) => {
            await updateTenant(selectedTenant.id, data);
            refreshTenants();
          }}
        />
      )}
    </>
  );
}
```

### LeaseForm

**Location:** `/src/components/leases/LeaseForm.tsx`

Comprehensive form for creating and editing leases.

**Features:**
- Tenant and unit selection
- Lease type selection (fixed, month-to-month, week-to-week)
- Date pickers for start/end dates
- Financial terms (rent, deposits, late fees)
- Custom terms and notes
- Auto-fills rent based on unit selection
- Validates date ranges
- Supports both create and edit modes

**Props:**

```typescript
interface LeaseFormProps {
  mode: 'create' | 'edit';
  tenants: Tenant[];
  units: Unit[];
  lease?: Partial<LeaseFormData> & { id?: string };
  preSelectedTenantId?: string;
  preSelectedUnitId?: string;
  onSave: (data: LeaseFormData) => void | Promise<void>;
  onCancel: () => void;
}
```

**Usage:**

```tsx
import { LeaseForm } from '@/components/leases';

function CreateLease() {
  return (
    <LeaseForm
      mode="create"
      tenants={availableTenants}
      units={vacantUnits}
      preSelectedUnitId={unitId}
      onSave={async (data) => {
        await createLease(data);
      }}
      onCancel={() => router.back()}
    />
  );
}
```

### CreateLeaseDialog

**Location:** `/src/components/leases/CreateLeaseDialog.tsx`

Dialog wrapper for creating new leases.

**Features:**
- Modal dialog interface
- Pre-selection support for tenant/unit
- Auto-closes on success
- Dynamic description based on pre-selections

**Props:**

```typescript
interface CreateLeaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenants: Tenant[];
  units: Unit[];
  preSelectedTenantId?: string;
  preSelectedUnitId?: string;
  onSuccess: (data: LeaseFormData) => void | Promise<void>;
}
```

**Usage:**

```tsx
import { CreateLeaseDialog } from '@/components/leases';

function UnitCard({ unit }) {
  const [isCreateLeaseOpen, setIsCreateLeaseOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsCreateLeaseOpen(true)}>
        Create Lease
      </Button>

      <CreateLeaseDialog
        open={isCreateLeaseOpen}
        onOpenChange={setIsCreateLeaseOpen}
        tenants={tenants}
        units={units}
        preSelectedUnitId={unit.id}
        onSuccess={async (data) => {
          await createLease(data);
          refreshData();
        }}
      />
    </>
  );
}
```

### MaintenanceRequestForm

**Location:** `/src/components/tenant/MaintenanceRequestForm.tsx`

Form for tenants to submit maintenance requests.

**Features:**
- Request details (title, category, priority, description)
- Emergency request highlighting
- Entry permission options
- Contact method preferences
- Photo upload placeholder
- Priority-based UI feedback

**Props:**

```typescript
interface MaintenanceRequestFormProps {
  unitId: string;
  tenantId: string;
  onSubmit: (data: MaintenanceRequestFormData) => void | Promise<void>;
  onCancel?: () => void;
}
```

**Usage:**

```tsx
import { MaintenanceRequestForm } from '@/components/tenant';

function TenantPortal() {
  const { tenant, unit } = useAuth();

  return (
    <MaintenanceRequestForm
      unitId={unit.id}
      tenantId={tenant.id}
      onSubmit={async (data) => {
        await submitMaintenanceRequest({
          ...data,
          unitId: unit.id,
          tenantId: tenant.id,
        });
      }}
    />
  );
}
```

## Usage Examples

### Example 1: Edit Tenant from Details Page

```tsx
'use client';

import { useState } from 'react';
import { TenantEditDialog } from '@/components/tenants';
import { Button } from '@/components/ui/button';

export default function TenantDetailsPage({ params }: { params: { id: string } }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tenant, setTenant] = useState(/* fetch tenant */);

  const handleUpdate = async (data: TenantFormData) => {
    const response = await fetch(`/api/tenants/${params.id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const updated = await response.json();
      setTenant(updated);
    }
  };

  return (
    <div>
      <Button onClick={() => setIsEditOpen(true)}>Edit Tenant</Button>

      <TenantEditDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        tenant={tenant}
        onSave={handleUpdate}
      />
    </div>
  );
}
```

### Example 2: Create Lease from Unit Page

```tsx
'use client';

import { useState } from 'react';
import { CreateLeaseDialog } from '@/components/leases';
import { Button } from '@/components/ui/button';

export default function UnitPage({ unit, tenants, units }) {
  const [isCreateLeaseOpen, setIsCreateLeaseOpen] = useState(false);

  const handleCreateLease = async (data: LeaseFormData) => {
    const response = await fetch('/api/leases', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // Refresh unit data
      router.refresh();
    }
  };

  return (
    <div>
      {unit.status === 'vacant' && (
        <Button onClick={() => setIsCreateLeaseOpen(true)}>
          Create Lease
        </Button>
      )}

      <CreateLeaseDialog
        open={isCreateLeaseOpen}
        onOpenChange={setIsCreateLeaseOpen}
        tenants={tenants}
        units={units}
        preSelectedUnitId={unit.id}
        onSuccess={handleCreateLease}
      />
    </div>
  );
}
```

### Example 3: Maintenance Request in Tenant Portal

```tsx
'use client';

import { MaintenanceRequestForm } from '@/components/tenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MaintenanceRequestPage() {
  const { tenant, unit } = useAuth();

  const handleSubmit = async (data: MaintenanceRequestFormData) => {
    const response = await fetch('/api/maintenance-requests', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        unitId: unit.id,
        tenantId: tenant.id,
      }),
    });

    if (response.ok) {
      router.push('/tenant/maintenance');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Maintenance Request</CardTitle>
      </CardHeader>
      <CardContent>
        <MaintenanceRequestForm
          unitId={unit.id}
          tenantId={tenant.id}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </CardContent>
    </Card>
  );
}
```

### Example 4: Inline Lease Form (Non-Dialog)

```tsx
'use client';

import { LeaseForm } from '@/components/leases';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateLeasePage({ tenants, units }) {
  const router = useRouter();

  const handleSave = async (data: LeaseFormData) => {
    const response = await fetch('/api/leases', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.ok) {
      router.push('/dashboard/leases');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Lease</CardTitle>
      </CardHeader>
      <CardContent>
        <LeaseForm
          mode="create"
          tenants={tenants}
          units={units}
          onSave={handleSave}
          onCancel={() => router.back()}
        />
      </CardContent>
    </Card>
  );
}
```

## Validation Examples

### Custom Validation with Zod

You can extend the schemas for custom validation:

```typescript
import { z } from 'zod';
import { tenantSchema } from '@/lib/schemas/tenant';

// Add custom validation
const customTenantSchema = tenantSchema.extend({
  customField: z.string().min(1, 'Custom field is required'),
}).refine(
  (data) => {
    // Custom validation logic
    return data.monthlyIncome ? data.monthlyIncome > data.rentAmount * 3 : true;
  },
  {
    message: 'Monthly income should be at least 3x the rent amount',
    path: ['monthlyIncome'],
  }
);
```

### Form-Level Validation

```typescript
const form = useForm<TenantFormData>({
  resolver: zodResolver(tenantSchema),
  mode: 'onChange', // Validate on change
  reValidateMode: 'onChange', // Re-validate on change
});
```

## Accessibility

All forms are built with accessibility in mind:

- Proper label associations
- ARIA attributes on form controls
- Keyboard navigation support
- Error message announcements
- Focus management
- Screen reader friendly

## Styling

All components use Tailwind CSS and respect the application's theme:

- Light/dark mode support
- Responsive layouts
- Consistent spacing and typography
- Proper color contrast
- Mobile-friendly inputs

## Testing

Example test for form validation:

```typescript
import { describe, it, expect } from 'vitest';
import { tenantSchema } from '@/lib/schemas/tenant';

describe('tenantSchema', () => {
  it('validates correct tenant data', () => {
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '(512) 555-1234',
    };

    expect(() => tenantSchema.parse(validData)).not.toThrow();
  });

  it('rejects invalid email', () => {
    const invalidData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid-email',
    };

    expect(() => tenantSchema.parse(invalidData)).toThrow();
  });
});
```

## Best Practices

1. **Always use TypeScript types** from the schemas for type safety
2. **Handle loading states** to prevent duplicate submissions
3. **Show toast notifications** for user feedback
4. **Reset forms** after successful submission
5. **Provide clear error messages** for validation failures
6. **Use proper form modes** (onChange, onBlur, onSubmit)
7. **Handle API errors** gracefully with try-catch
8. **Pre-populate forms** when editing existing data
9. **Disable inputs** appropriately (e.g., can't change tenant in edit mode)
10. **Validate on both client and server** for security

## Troubleshooting

### Form not submitting
- Check that all required fields are filled
- Look for validation errors in the console
- Ensure the onSubmit handler is properly connected

### Validation not working
- Verify the resolver is configured correctly
- Check that the schema is imported properly
- Ensure field names match schema definition

### Date picker issues
- Verify date-fns is installed
- Check that date values are Date objects, not strings
- Ensure proper timezone handling

### TypeScript errors
- Make sure to import types from schemas
- Verify all component props are properly typed
- Check that form values match schema types
