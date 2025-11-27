# Forms Quick Reference Guide

Quick reference for all forms in the Happy Tenant application.

## Import Statements

```typescript
// Schemas
import {
  tenantSchema,
  leaseSchema,
  maintenanceRequestSchema,
  type TenantFormData,
  type LeaseFormData,
  type MaintenanceRequestFormData,
} from '@/lib/schemas';

// Components
import { TenantEditDialog } from '@/components/tenants';
import { CreateLeaseDialog } from '@/components/leases';
import { MaintenanceRequestForm } from '@/components/tenant';
```

## Component Quick Reference

### TenantEditDialog

```tsx
<TenantEditDialog
  open={boolean}
  onOpenChange={(open) => void}
  tenant={{
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
  }}
  onSave={async (data: TenantFormData) => {
    // API call
  }}
/>
```

### CreateLeaseDialog

```tsx
<CreateLeaseDialog
  open={boolean}
  onOpenChange={(open) => void}
  tenants={Tenant[]}
  units={Unit[]}
  preSelectedTenantId={string}  // optional
  preSelectedUnitId={string}    // optional
  onSuccess={async (data: LeaseFormData) => {
    // API call
  }}
/>
```

### MaintenanceRequestForm

```tsx
<MaintenanceRequestForm
  unitId={string}
  tenantId={string}
  onSubmit={async (data: MaintenanceRequestFormData) => {
    // API call
  }}
  onCancel={() => void}  // optional
/>
```

## Schema Validation

### Tenant Schema

```typescript
{
  firstName: string;        // Required, 2-50 chars
  lastName: string;         // Required, 2-50 chars
  email: string;           // Required, valid email
  phone?: string;          // Optional, phone format
  emergencyContactName?: string;
  emergencyContactPhone?: string;  // Optional, phone format
  emergencyContactRelationship?: string;
  notes?: string;
  employerName?: string;
  monthlyIncome?: number;  // Optional, positive
}
```

### Lease Schema

```typescript
{
  tenantId: string;                  // Required
  unitId: string;                    // Required
  leaseType: 'fixed' | 'month_to_month' | 'week_to_week';
  startDate: Date;                   // Required
  endDate?: Date;                    // Required for fixed
  rentAmount: number;                // Required, positive
  rentDueDay: number;                // 1-28, default 1
  securityDeposit?: number;          // Optional, non-negative
  petDeposit?: number;               // Optional, non-negative
  lateFeeAmount?: number;            // Optional, non-negative
  lateFeeGraceDays?: number;         // 0-30, default 0
  status: 'draft' | 'pending_signature' | 'active' | 'expired' | 'terminated' | 'renewed';
  terms?: string;
  notes?: string;
}
```

### Maintenance Request Schema

```typescript
{
  title: string;           // Required, 5-100 chars
  description: string;     // Required, 10-2000 chars
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' |
            'structural' | 'pest_control' | 'landscaping' | 'cleaning' | 'other';
  priority: 'emergency' | 'high' | 'medium' | 'low';
  entryPermissionGranted: boolean;
  entryInstructions?: string;
  preferredContactMethod: 'phone' | 'email' | 'in_app' | 'sms';
  photos?: string[];
}
```

## Common Patterns

### Opening a Dialog from a Button

```tsx
const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>Edit Tenant</Button>

<TenantEditDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  tenant={tenant}
  onSave={handleSave}
/>
```

### API Integration

```tsx
const handleSave = async (data: TenantFormData) => {
  try {
    const response = await fetch(`/api/tenants/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to update');

    const updated = await response.json();
    // Update local state
    setTenant(updated);
  } catch (error) {
    console.error(error);
    throw error; // Let form handle error toast
  }
};
```

### Pre-selecting Values

```tsx
// Pre-select a tenant or unit when creating a lease
<CreateLeaseDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  tenants={tenants}
  units={units}
  preSelectedUnitId={currentUnit.id}  // Pre-fill unit
  onSuccess={handleCreate}
/>
```

## Validation Examples

### Using Schema Directly

```typescript
import { tenantSchema } from '@/lib/schemas';

// Validate data
const result = tenantSchema.safeParse(data);
if (!result.success) {
  console.error(result.error.errors);
}
```

### Custom Validation

```typescript
import { z } from 'zod';
import { leaseSchema } from '@/lib/schemas';

// Extend schema
const customLeaseSchema = leaseSchema.extend({
  customField: z.string().optional(),
}).refine(
  (data) => data.rentAmount <= data.securityDeposit * 2,
  {
    message: 'Security deposit should be at least half of rent',
    path: ['securityDeposit'],
  }
);
```

## File Locations

```
/src/lib/schemas/
  ├── tenant.ts          # Tenant validation
  ├── lease.ts           # Lease validation
  ├── maintenance.ts     # Maintenance validation
  └── index.ts           # All exports

/src/components/tenants/
  ├── TenantEditForm.tsx
  ├── TenantEditDialog.tsx
  └── index.ts

/src/components/leases/
  ├── LeaseForm.tsx
  ├── CreateLeaseDialog.tsx
  └── index.ts

/src/components/tenant/
  ├── MaintenanceRequestForm.tsx
  └── index.ts
```

## Features Checklist

### TenantEditDialog
- ✅ Basic info (name, email, phone)
- ✅ Emergency contact
- ✅ Employment info
- ✅ Notes
- ✅ Validation
- ✅ Loading states
- ✅ Toast notifications

### CreateLeaseDialog
- ✅ Tenant/unit selection
- ✅ Lease type
- ✅ Date pickers
- ✅ Financial terms
- ✅ Status
- ✅ Custom terms
- ✅ Pre-selection support
- ✅ Date validation

### MaintenanceRequestForm
- ✅ Title/description
- ✅ Category selection
- ✅ Priority levels
- ✅ Emergency alerts
- ✅ Entry permission
- ✅ Contact method
- ✅ Photo placeholder

## Common Issues & Solutions

### Issue: Form not submitting
**Solution:** Check console for validation errors, ensure all required fields are filled

### Issue: Dates not working
**Solution:** Ensure dates are Date objects, not strings. Use `new Date()` or date-fns

### Issue: TypeScript errors
**Solution:** Import types from schemas, ensure prop types match

### Issue: Dialog not closing
**Solution:** Make sure onOpenChange is called, check for async errors

## Best Practices

1. Always handle errors in onSave/onSubmit handlers
2. Show loading states during API calls
3. Reset forms after successful submission (forms do this automatically)
4. Use TypeScript types from schemas
5. Validate on both client and server
6. Pre-populate forms when editing
7. Disable changing critical fields in edit mode
8. Provide clear error messages
9. Use toast notifications for feedback
10. Test keyboard navigation

## Quick Links

- Full Documentation: `/docs/FORMS_DOCUMENTATION.md`
- Implementation Summary: `/docs/FORMS_IMPLEMENTATION_SUMMARY.md`
- Demo Component: `/src/components/examples/FormsDemo.tsx`
