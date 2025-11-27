# Spacing Guidelines

This document defines the standard spacing patterns and conventions for the Happy Tenant application to ensure visual consistency across all components and pages.

## Table of Contents

- [Spacing Scale](#spacing-scale)
- [When to Use Gap vs Margin vs Padding](#when-to-use-gap-vs-margin-vs-padding)
- [Component Spacing Patterns](#component-spacing-patterns)
- [Layout Patterns](#layout-patterns)
- [Best Practices](#best-practices)

## Spacing Scale

We use Tailwind's standard spacing scale (based on 0.25rem / 4px increments):

| Class | Pixels | Rem   | Usage                           |
|-------|--------|-------|---------------------------------|
| 0     | 0px    | 0     | No spacing                      |
| 0.5   | 2px    | 0.125 | Minimal spacing                 |
| 1     | 4px    | 0.25  | Tight spacing                   |
| 2     | 8px    | 0.5   | Small spacing                   |
| 3     | 12px   | 0.75  | Default small spacing           |
| 4     | 16px   | 1     | **Standard spacing (DEFAULT)**  |
| 5     | 20px   | 1.25  | Medium spacing                  |
| 6     | 24px   | 1.5   | Large spacing                   |
| 8     | 32px   | 2     | Extra large spacing             |
| 10    | 40px   | 2.5   | Section spacing                 |
| 12    | 48px   | 3     | Large section spacing           |
| 16    | 64px   | 4     | Major section spacing           |
| 20    | 80px   | 5     | Hero/landing spacing            |

## When to Use Gap vs Margin vs Padding

### Use `gap` for:

- **Flexbox and Grid layouts** - Modern CSS property, cleaner than margins
- **Lists of items** - Navigation, cards, form fields
- **Component children** - Consistent spacing between child elements

```tsx
// Good - Using gap for consistent spacing
<div className="flex gap-4">
  <Button>Cancel</Button>
  <Button>Save</Button>
</div>

// Good - Grid with gap
<div className="grid grid-cols-3 gap-6">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

### Use `padding` for:

- **Internal spacing** - Space inside containers, cards, buttons
- **Clickable areas** - Buttons, links need comfortable hit targets
- **Content containers** - Separating content from edges

```tsx
// Good - Padding for internal spacing
<Card className="p-6">
  <h3>Title</h3>
  <p>Content</p>
</Card>

// Good - Button with padding for hit target
<Button className="px-4 py-2">Click me</Button>

// Good - Page container padding
<main className="p-4 sm:p-6 lg:p-8">
  {children}
</main>
```

### Use `margin` for:

- **Separating sections** - When gap is not applicable
- **Specific positioning** - One-off spacing adjustments
- **Override spacing** - When you need negative margins

```tsx
// Good - Section separation
<div className="mt-8">
  <h2>New Section</h2>
</div>

// Good - Auto margins for centering
<div className="mx-auto max-w-7xl">
  {content}
</div>

// Acceptable - Specific spacing override
<p className="mb-4 last:mb-0">
  Paragraph with bottom margin, except the last one
</p>
```

## Component Spacing Patterns

### Cards

```tsx
// Standard card spacing
<Card className="p-6">
  <CardHeader className="pb-4">
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Content items with consistent vertical spacing */}
  </CardContent>
  <CardFooter className="pt-4">
    {/* Footer content */}
  </CardFooter>
</Card>
```

**Pattern:**
- Card padding: `p-6` (24px)
- Section spacing: `pb-4`, `pt-4` (16px)
- Content spacing: `space-y-4` (16px between items)

### Forms

```tsx
// Standard form spacing
<form className="space-y-6">
  <div className="space-y-2">
    <Label>Field Label</Label>
    <Input />
    <p className="text-sm text-muted-foreground">Helper text</p>
  </div>

  <div className="space-y-2">
    <Label>Another Field</Label>
    <Input />
  </div>

  <div className="flex gap-3 justify-end">
    <Button variant="outline">Cancel</Button>
    <Button>Submit</Button>
  </div>
</form>
```

**Pattern:**
- Form field groups: `space-y-6` (24px)
- Label to input: `space-y-2` (8px)
- Button groups: `gap-3` (12px)

### Lists and Navigation

```tsx
// Navigation items
<nav className="space-y-1">
  <Link className="px-3 py-2">Item 1</Link>
  <Link className="px-3 py-2">Item 2</Link>
</nav>

// Grid of items
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

**Pattern:**
- Navigation items: `space-y-1` (4px) with `px-3 py-2` padding
- Grid of cards: `gap-6` (24px)
- List items: `space-y-2` to `space-y-4` depending on size

### Dialogs and Modals

```tsx
<DialogContent className="gap-4">
  <DialogHeader className="gap-2">
    <DialogTitle>Title</DialogTitle>
    <DialogDescription>Description</DialogDescription>
  </DialogHeader>

  <div className="space-y-4">
    {/* Main content */}
  </div>

  <DialogFooter className="gap-2">
    <Button variant="outline">Cancel</Button>
    <Button>Confirm</Button>
  </DialogFooter>
</DialogContent>
```

**Pattern:**
- Dialog sections: `gap-4` (16px)
- Header spacing: `gap-2` (8px)
- Footer buttons: `gap-2` (8px)

## Layout Patterns

### Page Layout

```tsx
<main className="p-4 sm:p-6 lg:p-8">
  <div className="max-w-7xl mx-auto space-y-8">
    {/* Page header */}
    <div className="space-y-2">
      <h1 className="text-3xl font-bold">Page Title</h1>
      <p className="text-muted-foreground">Description</p>
    </div>

    {/* Main content sections */}
    <section className="space-y-6">
      {/* Section content */}
    </section>

    <section className="space-y-6">
      {/* Another section */}
    </section>
  </div>
</main>
```

**Pattern:**
- Page padding: Responsive `p-4 sm:p-6 lg:p-8`
- Major sections: `space-y-8` (32px)
- Section internal spacing: `space-y-6` (24px)
- Page header: `space-y-2` (8px)

### Dashboard Widgets

```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <Card className="p-6">
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Label</p>
      <p className="text-2xl font-bold">Value</p>
    </div>
  </Card>
  {/* More stat cards */}
</div>

<div className="mt-8 grid gap-6 md:grid-cols-2">
  <Card className="p-6">
    <h3 className="font-semibold mb-4">Chart Title</h3>
    {/* Chart content */}
  </Card>
  {/* More charts */}
</div>
```

**Pattern:**
- Stat cards grid: `gap-4` (16px)
- Chart cards grid: `gap-6` (24px)
- Section separation: `mt-8` (32px)

### Headers with Actions

```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div className="space-y-1">
    <h2 className="text-2xl font-bold">Section Title</h2>
    <p className="text-muted-foreground">Description</p>
  </div>

  <div className="flex gap-2">
    <Button variant="outline">Secondary</Button>
    <Button>Primary</Button>
  </div>
</div>
```

**Pattern:**
- Header container: `gap-4` (16px)
- Title group: `space-y-1` (4px)
- Action buttons: `gap-2` (8px)

## Best Practices

### 1. Use Consistent Spacing Multipliers

Stick to the spacing scale. Don't use arbitrary values like `p-[13px]`.

```tsx
// Good
<div className="p-4 space-y-6">

// Bad
<div className="p-[13px] space-y-[23px]">
```

### 2. Use space-y/space-x for Vertical/Horizontal Stacks

```tsx
// Good - Automatic spacing between children
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// Bad - Manual margins
<div>
  <div className="mb-4">Item 1</div>
  <div className="mb-4">Item 2</div>
  <div>Item 3</div>
</div>
```

### 3. Responsive Spacing

Use responsive variants for better mobile experience:

```tsx
// Good - Responsive padding
<main className="p-4 sm:p-6 lg:p-8">

// Good - Responsive gaps
<div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### 4. Container Padding Hierarchy

- **Page container**: `p-4 sm:p-6 lg:p-8` (16px → 24px → 32px)
- **Card/Section**: `p-6` (24px)
- **Nested containers**: `p-4` (16px)
- **Small components**: `p-2` or `p-3` (8px or 12px)

### 5. Avoid Double Spacing

Don't add margin/padding to both parent and child if unnecessary:

```tsx
// Good - Spacing in one place
<Card className="p-6">
  <div className="space-y-4">
    <p>Content</p>
    <p>Content</p>
  </div>
</Card>

// Bad - Redundant spacing
<Card className="p-6">
  <div className="p-4 space-y-4">
    <p>Content</p>
    <p>Content</p>
  </div>
</Card>
```

### 6. Use Negative Margins Sparingly

Negative margins can break layouts. Use them only when necessary:

```tsx
// Acceptable use case - Offset container padding
<div className="px-4">
  <div className="-mx-4">
    {/* Full-width element within padded container */}
  </div>
</div>
```

## Quick Reference

Common spacing patterns at a glance:

- **Tight lists**: `space-y-1` (4px)
- **Form fields**: `space-y-2` (8px)
- **Card content**: `space-y-4` (16px)
- **Form sections**: `space-y-6` (24px)
- **Page sections**: `space-y-8` (32px)
- **Button groups**: `gap-2` or `gap-3` (8px or 12px)
- **Card grids**: `gap-4` or `gap-6` (16px or 24px)
- **Card padding**: `p-6` (24px)
- **Page padding**: `p-4 sm:p-6 lg:p-8` (responsive)

## Need Help?

When in doubt:
1. Check existing components for patterns
2. Use `gap` for flex/grid layouts
3. Use `padding` for internal spacing
4. Stick to the spacing scale
5. Test on mobile, tablet, and desktop
