# Mobile Improvements - Quick Start Guide

This guide will help you quickly implement the mobile improvements in your pages.

## 1. Add Mobile-Friendly Buttons (5 minutes)

### Before:
```tsx
<Button variant="outline" size="icon">
  <Settings className="h-4 w-4" />
</Button>
```

### After:
```tsx
<Button
  variant="outline"
  size="icon"
  className="touch-manipulation min-h-[44px] min-w-[44px]"
>
  <Settings className="h-4 w-4" />
</Button>
```

**Apply to:** All buttons, especially icon buttons and navigation items

## 2. Fix Horizontal Scroll (10 minutes)

### Common Issues:

#### Fixed-width containers
```tsx
// Before ❌
<div className="w-[800px]">

// After ✅
<div className="w-full max-w-[800px]">
```

#### Long text without truncation
```tsx
// Before ❌
<p>{longText}</p>

// After ✅
<p className="truncate">{longText}</p>
// or
<p className="truncate-2">{longText}</p> // 2 lines with ellipsis
```

#### Tables
```tsx
// Before ❌
<Table>
  {/* Many columns */}
</Table>

// After ✅ - Use ResponsiveTable component
import { ResponsiveTable } from '@/components/ui/responsive-table';

<ResponsiveTable
  data={data}
  columns={columns}
/>
```

#### Images
```tsx
// Before ❌
<img src="..." />

// After ✅
<img src="..." className="max-w-full h-auto" />
```

## 3. Make Grids Responsive (5 minutes)

### Before:
```tsx
<div className="grid grid-cols-4 gap-4">
  {/* Cards */}
</div>
```

### After:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Cards */}
</div>
```

**Common Patterns:**
- Stats: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`
- Cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Form fields: `grid-cols-1 sm:grid-cols-2`

## 4. Use Mobile Card Components (15 minutes)

### For Properties Page:

```tsx
import { PropertyCardMobile } from '@/components/properties/PropertyCardMobile';

// Hide desktop grid on mobile
<div className="hidden md:grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {/* Existing property cards */}
</div>

// Show mobile cards on small screens
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

### For Tenants Page:

```tsx
import { TenantCardMobile } from '@/components/tenants/TenantCardMobile';

<div className="space-y-4">
  {filteredTenants.map(tenant => (
    <TenantCardMobile
      key={tenant.id}
      tenant={tenant}
      unit={getUnitInfo(tenant.id)}
      rentAmount={getRentAmount(tenant.id)}
      onMessage={() => handleMessage(tenant.id)}
      onViewLease={() => handleViewLease(tenant.id)}
    />
  ))}
</div>
```

## 5. Update Forms (10 minutes)

### Before:
```tsx
<form className="space-y-4">
  <Input placeholder="Name" />
  <Input placeholder="Email" />
  <Button type="submit">Submit</Button>
</form>
```

### After:
```tsx
<form className="space-y-4">
  <Input
    placeholder="Name"
    className="min-h-[44px]"
  />
  <Input
    placeholder="Email"
    type="email"
    className="min-h-[44px]"
  />
  <Button
    type="submit"
    className="w-full sm:w-auto touch-manipulation min-h-[44px]"
  >
    Submit
  </Button>
</form>
```

**Key Changes:**
- Add `min-h-[44px]` to inputs
- Add `touch-manipulation` to buttons
- Make submit button full-width on mobile: `w-full sm:w-auto`
- Use proper input types (`type="email"`, `type="tel"`, etc.)

## 6. Responsive Typography (5 minutes)

### Before:
```tsx
<h1 className="text-4xl font-bold">Page Title</h1>
<p className="text-lg">Description</p>
```

### After:
```tsx
<h1 className="text-heading-1 font-bold">Page Title</h1>
<p className="text-body-lg">Description</p>
```

**Or stick with Tailwind but make it responsive:**
```tsx
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Page Title</h1>
```

## 7. Navigation Links (5 minutes)

### Before:
```tsx
<Link
  href="/path"
  className="flex items-center gap-2 px-3 py-2"
>
  <Icon /> Label
</Link>
```

### After:
```tsx
<Link
  href="/path"
  className="flex items-center gap-2 px-3 py-2 touch-manipulation min-h-[44px]"
>
  <Icon /> Label
</Link>
```

## 8. Hide/Show Content (5 minutes)

### Desktop Only:
```tsx
<div className="hidden md:block">
  Desktop only content
</div>
```

### Mobile Only:
```tsx
<div className="md:hidden">
  Mobile only content
</div>
```

### Different Content Per Breakpoint:
```tsx
{/* Short text on mobile */}
<span className="sm:hidden">Search...</span>
{/* Full text on desktop */}
<span className="hidden sm:inline">Search properties, tenants...</span>
```

## 9. Responsive Spacing (5 minutes)

### Padding:
```tsx
// Before
<div className="p-6">

// After - Less on mobile, more on desktop
<div className="p-4 sm:p-6 lg:p-8">
```

### Gaps:
```tsx
// Before
<div className="flex gap-4">

// After
<div className="flex gap-2 sm:gap-4">
```

### Margins:
```tsx
// Before
<div className="mb-8">

// After
<div className="mb-4 sm:mb-6 lg:mb-8">
```

## 10. Test Your Changes (5 minutes)

1. Open Chrome DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Set to "iPhone SE" (375px)
4. Check:
   - [ ] No horizontal scroll
   - [ ] All buttons are easy to tap
   - [ ] Text is readable
   - [ ] Images fit properly
   - [ ] Forms work well

## Common Tailwind Classes for Mobile

```tsx
// Responsive Display
hidden sm:block          // Hide on mobile, show on desktop
sm:hidden                // Show on mobile, hide on desktop

// Responsive Grid
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3

// Responsive Flex
flex-col sm:flex-row     // Stack on mobile, row on desktop

// Responsive Width
w-full sm:w-auto         // Full width on mobile, auto on desktop

// Responsive Text Size
text-sm sm:text-base lg:text-lg

// Responsive Spacing
p-4 sm:p-6 lg:p-8       // Padding
gap-2 sm:gap-4          // Gap
mb-4 sm:mb-6 lg:mb-8    // Margin bottom

// Touch Targets
touch-manipulation      // Improves touch responsiveness
min-h-[44px]           // Minimum touch height
min-w-[44px]           // Minimum touch width

// Text Overflow
truncate               // Single line ellipsis
line-clamp-2          // Two lines with ellipsis
break-words           // Break long words
```

## Checklist for Each Page

Before marking a page as mobile-ready:

- [ ] No horizontal scroll at 375px width
- [ ] All buttons have min-h-[44px]
- [ ] Grid layouts stack on mobile
- [ ] Text is readable (min 14px)
- [ ] Images scale properly
- [ ] Forms have proper input heights
- [ ] Navigation works smoothly
- [ ] Touch targets are easy to tap
- [ ] No overlapping elements
- [ ] Proper spacing on all screen sizes

## Need Help?

- Check `/docs/MOBILE_IMPLEMENTATION_GUIDE.md` for detailed examples
- See `/docs/MOBILE_TESTING_CHECKLIST.md` for comprehensive testing
- Review `/docs/MOBILE_IMPROVEMENTS_SUMMARY.md` for overview

## Priority Order

1. **Fix horizontal scroll** (Critical)
2. **Add touch targets to buttons** (Critical)
3. **Make grids responsive** (High)
4. **Update forms** (High)
5. **Add mobile card views** (Medium)
6. **Optimize typography** (Medium)
7. **Polish spacing** (Low)

Start with critical items and work your way down!
