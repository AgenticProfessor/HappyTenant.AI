# Property & Unit Forms - Quick Start Guide

## Installation
No additional installation required. All dependencies are already installed.

## Import Components

```tsx
// Import individual components
import {
  PropertyEditForm,
  PropertyEditDialog,
  UnitForm,
  AddUnitDialog,
  EditUnitDialog,
} from '@/components/properties';

// Import schemas
import {
  propertySchema,
  unitSchema,
  type PropertyFormValues,
  type UnitFormValues,
} from '@/lib/schemas';

// Import types
import type { Property, Unit } from '@/types';
```

## Quick Examples

### 1. Edit Property Dialog

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PropertyEditDialog } from '@/components/properties';

export function MyComponent({ property }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Edit Property</Button>

      <PropertyEditDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        property={property}
        onPropertyUpdated={(updated) => {
          console.log('Updated:', updated);
          // Your update logic here
        }}
      />
    </>
  );
}
```

### 2. Add Unit Dialog

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AddUnitDialog } from '@/components/properties';

export function MyComponent({ propertyId, propertyName }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Unit</Button>

      <AddUnitDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        propertyId={propertyId}
        propertyName={propertyName}
        onUnitAdded={(newUnit) => {
          console.log('Added:', newUnit);
          // Your add logic here
        }}
      />
    </>
  );
}
```

### 3. Edit Unit Dialog

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EditUnitDialog } from '@/components/properties';

export function MyComponent({ unit }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Edit Unit</Button>

      <EditUnitDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        unit={unit}
        onUnitUpdated={(updated) => {
          console.log('Updated:', updated);
          // Your update logic here
        }}
      />
    </>
  );
}
```

### 4. Standalone Property Form

```tsx
'use client';

import { PropertyEditForm } from '@/components/properties';

export function MyPage({ property }) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1>Edit Property</h1>

      <PropertyEditForm
        property={property}
        onSuccess={(updated) => {
          console.log('Success:', updated);
          // Navigate or update state
        }}
        onCancel={() => {
          console.log('Cancelled');
          // Navigate back
        }}
      />
    </div>
  );
}
```

### 5. Standalone Unit Form (Add Mode)

```tsx
'use client';

import { UnitForm } from '@/components/properties';

export function AddUnitPage({ propertyId }) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1>Add New Unit</h1>

      <UnitForm
        mode="add"
        propertyId={propertyId}
        onSuccess={(newUnit) => {
          console.log('Added:', newUnit);
          // Navigate to unit page or property page
        }}
        onCancel={() => {
          console.log('Cancelled');
          // Navigate back
        }}
      />
    </div>
  );
}
```

### 6. Standalone Unit Form (Edit Mode)

```tsx
'use client';

import { UnitForm } from '@/components/properties';

export function EditUnitPage({ unit }) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1>Edit Unit {unit.unitNumber}</h1>

      <UnitForm
        mode="edit"
        propertyId={unit.propertyId}
        unit={unit}
        onSuccess={(updated) => {
          console.log('Updated:', updated);
          // Navigate or update state
        }}
        onCancel={() => {
          console.log('Cancelled');
          // Navigate back
        }}
      />
    </div>
  );
}
```

## Common Patterns

### Pattern 1: Multiple Dialogs on One Page

```tsx
'use client';

import { useState } from 'react';
import {
  PropertyEditDialog,
  AddUnitDialog,
  EditUnitDialog,
} from '@/components/properties';

export function PropertyDetailsPage({ property, units }) {
  const [editPropertyOpen, setEditPropertyOpen] = useState(false);
  const [addUnitOpen, setAddUnitOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  return (
    <div>
      {/* Your page content */}

      {/* Dialogs */}
      <PropertyEditDialog
        open={editPropertyOpen}
        onOpenChange={setEditPropertyOpen}
        property={property}
        onPropertyUpdated={(updated) => {
          // Handle update
        }}
      />

      <AddUnitDialog
        open={addUnitOpen}
        onOpenChange={setAddUnitOpen}
        propertyId={property.id}
        propertyName={property.name}
        onUnitAdded={(unit) => {
          // Handle new unit
        }}
      />

      {editingUnit && (
        <EditUnitDialog
          open={!!editingUnit}
          onOpenChange={(open) => !open && setEditingUnit(null)}
          unit={editingUnit}
          onUnitUpdated={(updated) => {
            // Handle update
            setEditingUnit(null);
          }}
        />
      )}
    </div>
  );
}
```

### Pattern 2: With State Management (Optimistic Updates)

```tsx
'use client';

import { useState } from 'react';
import { AddUnitDialog } from '@/components/properties';

export function UnitsSection({ propertyId, initialUnits }) {
  const [units, setUnits] = useState(initialUnits);
  const [isAddingUnit, setIsAddingUnit] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {units.map((unit) => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </div>

      <AddUnitDialog
        open={isAddingUnit}
        onOpenChange={setIsAddingUnit}
        propertyId={propertyId}
        onUnitAdded={(newUnit) => {
          // Optimistically add to local state
          setUnits((prev) => [...prev, newUnit]);
          setIsAddingUnit(false);

          // Then sync with backend if needed
          // await syncWithBackend(newUnit);
        }}
      />
    </>
  );
}
```

### Pattern 3: Form Validation Access

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { unitSchema } from '@/lib/schemas';

export function CustomUnitForm() {
  const form = useForm({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      unitNumber: '',
      bedrooms: 1,
      bathrooms: 1,
      marketRent: 0,
      status: 'vacant',
      features: [],
    },
  });

  // Access form state
  const { formState: { errors, isValid, isDirty } } = form;

  // Your custom form implementation
}
```

## Available Amenities

Use these strings in the `features` array:

```typescript
const availableAmenities = [
  'dishwasher',
  'washer_dryer',
  'air_conditioning',
  'heating',
  'parking',
  'balcony',
  'patio',
  'pool_access',
  'gym_access',
  'pet_friendly',
  'hardwood_floors',
  'carpet',
  'tile_floors',
  'updated_kitchen',
  'updated_bathroom',
  'walk_in_closet',
  'storage',
  'elevator_access',
];
```

## Property Types

```typescript
const propertyTypes = [
  'single_family',
  'multi_family',
  'apartment',
  'condo',
  'townhouse',
  'commercial',
];
```

## Status Values

```typescript
// Property statuses
const propertyStatuses = ['active', 'inactive', 'maintenance'];

// Unit statuses
const unitStatuses = ['vacant', 'occupied', 'maintenance', 'reserved'];
```

## Tips & Best Practices

1. **Always handle callbacks**: Implement `onSuccess` and `onCancel` handlers
2. **Use TypeScript**: Import and use the provided types
3. **State management**: Consider using optimistic updates for better UX
4. **Error handling**: Forms handle validation, but implement error boundaries for runtime errors
5. **Loading states**: Forms show loading spinners automatically
6. **Accessibility**: All forms are accessible by default, maintain this in your implementation

## Troubleshooting

### Form not validating
- Ensure Zod schema is imported correctly
- Check that form values match schema structure
- Verify required fields are filled

### Dialog not opening
- Check `open` state is being set correctly
- Ensure `onOpenChange` updates state
- Verify dialog component is rendered

### Currency values not formatting
- Currency formatting happens automatically in UnitForm
- For custom implementations, use: `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`

### TypeScript errors
- Ensure all types are imported from `@/types`
- Check that form values match schema types
- Verify prop types match component interfaces

## Next Steps

- See `README.md` in `/src/components/properties/` for detailed component documentation
- See `IMPLEMENTATION_SUMMARY.md` for technical implementation details
- Check existing components for usage examples

## Support

For issues or questions:
1. Check the README documentation
2. Review the implementation summary
3. Examine the component source code for inline documentation
