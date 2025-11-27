# Mobile Implementation Guide

Complete guide for implementing the mobile-responsive components and patterns in Happy Tenant.

## Overview

This guide covers the new mobile-responsive components and utilities created to enhance the mobile experience of the Happy Tenant property management application.

## New Components

### 1. ResponsiveTable Component

**Location:** `/src/components/ui/responsive-table.tsx`

**Purpose:** Automatically switches between table view (desktop) and card view (mobile).

**Usage:**

```tsx
import { ResponsiveTable } from '@/components/ui/responsive-table';

const columns = [
  {
    key: 'name',
    label: 'Name',
    mobileLabel: 'Tenant', // Optional: different label for mobile
    render: (item) => <strong>{item.name}</strong>,
  },
  {
    key: 'email',
    label: 'Email',
    hideOnMobile: true, // Hide this column on mobile card view
  },
  {
    key: 'status',
    label: 'Status',
    render: (item) => <Badge>{item.status}</Badge>,
  },
];

<ResponsiveTable
  data={tenants}
  columns={columns}
  onRowClick={(tenant) => handleTenantClick(tenant)}
  emptyState={<EmptyState message="No tenants found" />}
/>
```

**Custom Mobile Card Rendering:**

```tsx
<ResponsiveTable
  data={tenants}
  columns={columns}
  mobileCardRender={(tenant) => (
    <TenantCardMobile tenant={tenant} />
  )}
/>
```

### 2. PropertyCardMobile Component

**Location:** `/src/components/properties/PropertyCardMobile.tsx`

**Purpose:** Mobile-optimized property card for list view.

**Usage:**

```tsx
import { PropertyCardMobile } from '@/components/properties/PropertyCardMobile';

<PropertyCardMobile
  property={property}
  units={property.units.length}
  occupancy={calculateOccupancy(property)}
  monthlyRevenue={calculateRevenue(property)}
  onEdit={() => handleEdit(property.id)}
  onDelete={() => handleDelete(property.id)}
/>
```

**Features:**
- Touch-optimized (44x44px minimum touch targets)
- Responsive image placeholder
- Dropdown menu for actions
- Stats grid with icons
- Proper text truncation

### 3. TenantCardMobile Component

**Location:** `/src/components/tenants/TenantCardMobile.tsx`

**Purpose:** Mobile-optimized tenant card for list view.

**Usage:**

```tsx
import { TenantCardMobile } from '@/components/tenants/TenantCardMobile';

<TenantCardMobile
  tenant={tenant}
  unit={{
    name: 'Unit 2A',
    property: 'Sunset Apartments'
  }}
  rentAmount={1200}
  onMessage={() => handleMessage(tenant.id)}
  onViewLease={() => handleViewLease(tenant.id)}
  onViewProfile={() => handleViewProfile(tenant.id)}
  onEdit={() => handleEdit(tenant.id)}
  onRecordPayment={() => handleRecordPayment(tenant.id)}
  onRemove={() => handleRemove(tenant.id)}
/>
```

**Features:**
- Avatar display
- Status badge
- Contact information
- Unit information
- Quick action buttons
- Dropdown for additional actions

### 4. Touch Target Components

**Location:** `/src/components/ui/touch-target.tsx`

**Purpose:** Ensure minimum touch target sizes for accessibility.

#### TouchTarget Wrapper

```tsx
import { TouchTarget } from '@/components/ui/touch-target';

// Wrap small interactive elements
<TouchTarget minSize={44}>
  <button className="p-1">
    <X className="h-4 w-4" />
  </button>
</TouchTarget>
```

#### TouchableArea

```tsx
import { TouchableArea } from '@/components/ui/touch-target';

// Add padding around small elements
<TouchableArea>
  <X className="h-4 w-4" />
</TouchableArea>
```

#### MobileTouchButton

```tsx
import { MobileTouchButton } from '@/components/ui/touch-target';

<MobileTouchButton variant="primary" onClick={handleClick}>
  Click Me
</MobileTouchButton>
```

## Responsive Typography

**Location:** `/src/lib/responsive-typography.css`

**Import in:** `/src/app/globals.css`

Add this line to your globals.css:
```css
@import "./lib/responsive-typography.css";
```

### Fluid Headings

```tsx
<h1 className="text-heading-1">Page Title</h1>
<h2 className="text-heading-2">Section Title</h2>
<h3 className="text-heading-3">Subsection</h3>
```

### Body Text

```tsx
<p className="text-body-lg">Large body text</p>
<p className="text-body">Normal body text</p>
<p className="text-body-sm">Small body text</p>
```

### Mobile Card Text

```tsx
<h3 className="card-title-mobile">Card Title</h3>
<p className="card-description-mobile">Card description</p>
```

### Text Truncation

```tsx
<p className="truncate-1">Single line with ellipsis</p>
<p className="truncate-2">Two lines with ellipsis</p>
<p className="truncate-3">Three lines with ellipsis</p>
```

## Layout Improvements

### Mobile-Enhanced Dashboard Layout

**Location:** `/src/app/(dashboard)/layout-mobile-enhanced.tsx`

This is a reference implementation showing all mobile improvements. To apply to your current layout:

1. **Add touch-manipulation class to all interactive elements:**

```tsx
<Button className="touch-manipulation min-h-[44px]">
  Click Me
</Button>
```

2. **Ensure proper spacing and overflow handling:**

```tsx
<div className="flex gap-2 shrink-0">
  {/* Prevents flex items from shrinking too much */}
</div>

<div className="flex-1 min-w-0">
  {/* Allows text truncation in flex containers */}
</div>
```

3. **Responsive search placeholder:**

```tsx
<input
  placeholder="Search..."  // Short on mobile
  className="hidden sm:inline"
/>
<input
  placeholder="Search properties, tenants..."  // Long on desktop
  className="sm:hidden"
/>
```

## Common Patterns

### 1. Mobile-First Card Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id}>
      {/* Card content */}
    </Card>
  ))}
</div>
```

### 2. Responsive Button Groups

```tsx
<div className="flex flex-col sm:flex-row gap-2">
  <Button className="w-full sm:w-auto">Primary Action</Button>
  <Button variant="outline" className="w-full sm:w-auto">
    Secondary Action
  </Button>
</div>
```

### 3. Mobile Action Buttons

```tsx
{/* Full width on mobile, auto on desktop */}
<Button className="w-full sm:w-auto touch-manipulation min-h-[44px]">
  Action
</Button>
```

### 4. Responsive Stats Grid

```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
  {stats.map(stat => (
    <Card key={stat.label}>
      <CardContent className="p-4">
        <div className="text-2xl font-bold">{stat.value}</div>
        <div className="text-xs text-muted-foreground">{stat.label}</div>
      </CardContent>
    </Card>
  ))}
</div>
```

### 5. Mobile-Friendly Forms

```tsx
<form className="space-y-4">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <Label htmlFor="firstName">First Name</Label>
      <Input
        id="firstName"
        className="min-h-[44px]"
        {...register('firstName')}
      />
    </div>
    <div>
      <Label htmlFor="lastName">Last Name</Label>
      <Input
        id="lastName"
        className="min-h-[44px]"
        {...register('lastName')}
      />
    </div>
  </div>

  <Button type="submit" className="w-full sm:w-auto touch-manipulation min-h-[44px]">
    Submit
  </Button>
</form>
```

## Implementing in Existing Pages

### Properties Page

Replace the grid view with PropertyCardMobile on mobile:

```tsx
// In properties/page.tsx
import { PropertyCardMobile } from '@/components/properties/PropertyCardMobile';

// Desktop grid (hidden on mobile)
<div className="hidden md:grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {/* Existing property cards */}
</div>

// Mobile list (hidden on desktop)
<div className="md:hidden space-y-4">
  {filteredProperties.map(property => (
    <PropertyCardMobile
      key={property.id}
      property={property}
      units={getPropertyUnits(property.id).length}
      occupancy={getOccupancyRate(property.id)}
      monthlyRevenue={getMonthlyRevenue(property.id)}
    />
  ))}
</div>
```

### Tenants Page

Replace the table view with TenantCardMobile:

```tsx
// In tenants/page.tsx
import { TenantCardMobile } from '@/components/tenants/TenantCardMobile';

{viewMode === 'table' ? (
  // Desktop table - add lg:block class
  <Card className="hidden lg:block">
    <Table>
      {/* Existing table */}
    </Table>
  </Card>
) : (
  // Mobile cards - show on all sizes when in grid mode
  <div className="space-y-4">
    {filteredTenants.map(tenant => (
      <TenantCardMobile
        key={tenant.id}
        tenant={tenant}
        unit={getUnitInfo(getTenantLease(tenant.id)?.unitId)}
        rentAmount={getTenantLease(tenant.id)?.rentAmount}
      />
    ))}
  </div>
)}
```

### Dashboard Page

Improve mobile grid layouts:

```tsx
// Two-column on mobile, three on desktop
<div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Content */}
</div>

// Stack on mobile, side-by-side on desktop
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    {/* Main content */}
  </div>
  <div>
    {/* Sidebar */}
  </div>
</div>
```

### Messages Page

The messages page is already responsive, but ensure:

```tsx
// Conversation list should be full-width on mobile
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
  <Card className="lg:col-span-1">
    {/* Conversations */}
  </Card>
  <Card className="lg:col-span-2">
    {/* Chat */}
  </Card>
</div>
```

## Best Practices

### 1. Always Use touch-manipulation

```tsx
<button className="touch-manipulation">
  // Improves touch responsiveness
</button>
```

### 2. Minimum Touch Targets

```tsx
// Buttons
<Button className="min-h-[44px] min-w-[44px]">

// Icon buttons
<Button size="icon" className="min-h-[44px] min-w-[44px]">

// Links in navigation
<Link className="min-h-[44px] flex items-center">
```

### 3. Prevent Horizontal Scroll

```tsx
// Container
<div className="max-w-full overflow-x-hidden">

// Images
<img className="max-w-full h-auto" />

// Text
<p className="break-words">
```

### 4. Responsive Spacing

```tsx
// Padding: more on desktop
<div className="p-4 sm:p-6 lg:p-8">

// Gap: adjust with breakpoints
<div className="flex gap-2 sm:gap-4">

// Margin: mobile-first approach
<div className="mb-4 sm:mb-6 lg:mb-8">
```

### 5. Hide/Show Content

```tsx
// Hide on mobile
<div className="hidden sm:block">Desktop only</div>

// Show only on mobile
<div className="sm:hidden">Mobile only</div>

// Different content per breakpoint
<>
  <div className="sm:hidden">Mobile content</div>
  <div className="hidden sm:block">Desktop content</div>
</>
```

## Testing

Use the testing checklist at `/docs/MOBILE_TESTING_CHECKLIST.md` to ensure:

1. All pages tested at 375px, 414px, 768px, 1024px
2. No horizontal scroll
3. All touch targets meet 44x44px minimum
4. Typography is readable
5. Performance is acceptable

## Deployment Checklist

Before deploying mobile improvements:

- [ ] Import responsive-typography.css in globals.css
- [ ] Update all interactive elements with touch-manipulation
- [ ] Add min-h-[44px] to all buttons
- [ ] Test on physical device
- [ ] Run Lighthouse mobile audit (target 90+)
- [ ] Check all pages at 375px width
- [ ] Verify no horizontal scroll
- [ ] Test forms on mobile
- [ ] Verify navigation works
- [ ] Check image loading

## Support

For issues or questions about mobile implementation:
1. Check the Mobile Testing Checklist
2. Review this implementation guide
3. Test on actual devices
4. Use Chrome DevTools device mode
5. Run Lighthouse audits

## Future Enhancements

Consider implementing:
- Progressive Web App (PWA) features
- Offline support
- Pull-to-refresh
- Swipe gestures
- Bottom sheet navigation
- Haptic feedback
- Native app-like transitions
