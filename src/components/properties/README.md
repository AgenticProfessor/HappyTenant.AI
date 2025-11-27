# Property and Unit Forms

This directory contains form components for managing properties and units in the Happy Tenant application.

## Components

### Property Components

#### PropertyEditForm
A comprehensive form component for editing existing property details.

**Props:**
- `property: Property` - The property to edit
- `onSuccess?: (property: Property) => void` - Callback after successful save
- `onCancel?: () => void` - Callback when cancel is clicked

**Features:**
- Full validation using Zod schema
- Address fields (street, city, state, ZIP)
- Property type selection
- Optional fields (year built, square feet, purchase price, current value)
- Status selection
- Loading states
- Toast notifications

**Example:**
```tsx
import { PropertyEditForm } from '@/components/properties';

<PropertyEditForm
  property={myProperty}
  onSuccess={(updatedProperty) => {
    console.log('Property updated:', updatedProperty);
  }}
  onCancel={() => {
    console.log('Edit cancelled');
  }}
/>
```

#### PropertyEditDialog
Dialog wrapper for the PropertyEditForm component.

**Props:**
- `open: boolean` - Whether the dialog is open
- `onOpenChange: (open: boolean) => void` - Callback to change dialog state
- `property: Property` - The property to edit
- `onPropertyUpdated?: (property: Property) => void` - Callback after update

**Example:**
```tsx
import { PropertyEditDialog } from '@/components/properties';

const [isOpen, setIsOpen] = useState(false);

<PropertyEditDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  property={myProperty}
  onPropertyUpdated={(property) => {
    // Refresh property list or update state
  }}
/>
```

### Unit Components

#### UnitForm
A comprehensive form for adding or editing units. Supports two modes: 'add' and 'edit'.

**Props:**
- `mode: 'add' | 'edit'` - Form mode
- `propertyId: string` - ID of the property this unit belongs to
- `unit?: Unit` - The unit to edit (required in edit mode)
- `onSuccess?: (unit: Unit) => void` - Callback after successful save
- `onCancel?: () => void` - Callback when cancel is clicked

**Features:**
- Unit number/name input
- Bedrooms and bathrooms (supports half baths like 1.5, 2.5)
- Square footage and floor number
- Currency-formatted rent and deposit fields
- Status selection (vacant, occupied, maintenance, reserved)
- Amenities multi-select with 18+ common amenities
- Listing description textarea
- Form validation with real-time error display

**Example:**
```tsx
import { UnitForm } from '@/components/properties';

// Add mode
<UnitForm
  mode="add"
  propertyId="prop-123"
  onSuccess={(newUnit) => {
    console.log('Unit added:', newUnit);
  }}
/>

// Edit mode
<UnitForm
  mode="edit"
  propertyId="prop-123"
  unit={existingUnit}
  onSuccess={(updatedUnit) => {
    console.log('Unit updated:', updatedUnit);
  }}
/>
```

#### AddUnitDialog
Dialog wrapper for adding a new unit.

**Props:**
- `open: boolean` - Whether the dialog is open
- `onOpenChange: (open: boolean) => void` - Callback to change dialog state
- `propertyId: string` - ID of the property
- `propertyName?: string` - Name of the property (for display)
- `onUnitAdded?: (unit: Unit) => void` - Callback after unit creation

**Example:**
```tsx
import { AddUnitDialog } from '@/components/properties';

const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>Add Unit</Button>

<AddUnitDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  propertyId="prop-123"
  propertyName="Sunset Apartments"
  onUnitAdded={(unit) => {
    // Add unit to state or refresh list
  }}
/>
```

#### EditUnitDialog
Dialog wrapper for editing an existing unit.

**Props:**
- `open: boolean` - Whether the dialog is open
- `onOpenChange: (open: boolean) => void` - Callback to change dialog state
- `unit: Unit` - The unit to edit
- `onUnitUpdated?: (unit: Unit) => void` - Callback after update

**Example:**
```tsx
import { EditUnitDialog } from '@/components/properties';

const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>Edit Unit</Button>

<EditUnitDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  unit={myUnit}
  onUnitUpdated={(unit) => {
    // Update state or refresh list
  }}
/>
```

## Validation Schemas

### Property Schema
Located at `/src/lib/schemas/property.ts`

**Required fields:**
- `name` - Property name (1-100 characters)
- `type` - Property type enum
- `addressLine1` - Street address (1-200 characters)
- `city` - City name (1-100 characters)
- `state` - US state (2-letter code)
- `postalCode` - ZIP code (format: 12345 or 12345-6789)
- `status` - Property status enum

**Optional fields:**
- `addressLine2` - Additional address info
- `yearBuilt` - Year property was built (1800-current year)
- `squareFeet` - Total square footage
- `purchasePrice` - Original purchase price
- `currentValue` - Current market value
- `photos` - Array of photo URLs

### Unit Schema
Located at `/src/lib/schemas/unit.ts`

**Required fields:**
- `unitNumber` - Unit identifier (1-50 characters)
- `bedrooms` - Number of bedrooms (0-20)
- `bathrooms` - Number of bathrooms (0-20, increments of 0.5)
- `marketRent` - Monthly rent amount ($0-$1,000,000)
- `status` - Unit status enum

**Optional fields:**
- `name` - Display/marketing name
- `squareFeet` - Unit square footage
- `floorNumber` - Floor number
- `depositAmount` - Security deposit amount
- `features` - Array of amenity strings
- `isListed` - Whether unit is listed for rent
- `listingDescription` - Description for prospective tenants

## Available Amenities

The unit form includes 18 predefined amenities:
- Dishwasher
- Washer/Dryer
- Air Conditioning
- Heating
- Parking
- Balcony
- Patio
- Pool Access
- Gym Access
- Pet Friendly
- Hardwood Floors
- Carpet
- Tile Floors
- Updated Kitchen
- Updated Bathroom
- Walk-in Closet
- Storage
- Elevator Access

## Usage Tips

1. **Import centrally**: Use the index file for cleaner imports
   ```tsx
   import { PropertyEditDialog, AddUnitDialog } from '@/components/properties';
   ```

2. **Currency formatting**: The UnitForm automatically formats currency values for display

3. **Form state**: All forms use React Hook Form with Zod validation for robust error handling

4. **Loading states**: Forms show loading spinners during async operations

5. **Toast notifications**: Success and error messages use Sonner toast notifications

6. **Accessibility**: All forms include proper labels and ARIA attributes

## Integration Example

Here's a complete example of using these components in a property details page:

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  PropertyEditDialog,
  AddUnitDialog,
  EditUnitDialog,
} from '@/components/properties';
import type { Property, Unit } from '@/types';

export function PropertyDetailsPage({ property }: { property: Property }) {
  const [isEditPropertyOpen, setIsEditPropertyOpen] = useState(false);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  return (
    <div>
      <Button onClick={() => setIsEditPropertyOpen(true)}>
        Edit Property
      </Button>

      <Button onClick={() => setIsAddUnitOpen(true)}>
        Add Unit
      </Button>

      <PropertyEditDialog
        open={isEditPropertyOpen}
        onOpenChange={setIsEditPropertyOpen}
        property={property}
        onPropertyUpdated={(updated) => {
          // Update your state
        }}
      />

      <AddUnitDialog
        open={isAddUnitOpen}
        onOpenChange={setIsAddUnitOpen}
        propertyId={property.id}
        propertyName={property.name}
        onUnitAdded={(unit) => {
          // Add to your units list
        }}
      />

      {editingUnit && (
        <EditUnitDialog
          open={!!editingUnit}
          onOpenChange={(open) => !open && setEditingUnit(null)}
          unit={editingUnit}
          onUnitUpdated={(unit) => {
            // Update your units list
          }}
        />
      )}
    </div>
  );
}
```

## Dependencies

These components require:
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Zod resolver for React Hook Form
- `zod` - Schema validation
- `sonner` - Toast notifications
- `lucide-react` - Icons
- `@radix-ui/*` - UI primitives (via shadcn/ui)

All shadcn/ui components are already installed in `/src/components/ui/`.
