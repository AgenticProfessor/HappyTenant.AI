# Theming Guide

Complete guide to theming, colors, and dark mode for the Happy Tenant application.

## Table of Contents

- [Overview](#overview)
- [Color System](#color-system)
- [Using the Theme Toggle](#using-the-theme-toggle)
- [Color Palette Reference](#color-palette-reference)
- [Dark Mode Considerations](#dark-mode-considerations)
- [Customization Guide](#customization-guide)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Happy Tenant uses a comprehensive theming system built on:

- **CSS Variables** - All colors defined as CSS custom properties
- **OKLCH Color Space** - Modern, perceptually uniform colors
- **next-themes** - Seamless dark mode switching
- **Tailwind CSS v4** - Utility-first styling with theme integration

### Key Features

- Automatic system preference detection
- Smooth transitions between themes
- Accessible color contrasts
- Consistent brand colors across themes

## Color System

### Base Colors

Our color system is built on semantic naming for easy theme switching:

```css
/* Light Mode */
:root {
  --background: oklch(0.98 0.002 250);    /* Off-white background */
  --foreground: oklch(0.15 0.02 250);     /* Near-black text */
  --card: oklch(1 0 0);                    /* Pure white cards */
  --primary: oklch(0.35 0.12 250);         /* TurboTenant blue */
  --muted: oklch(0.96 0.01 250);           /* Light gray */
}

/* Dark Mode */
.dark {
  --background: oklch(0.15 0.02 250);     /* Dark background */
  --foreground: oklch(0.95 0.01 250);     /* Light text */
  --card: oklch(0.20 0.02 250);            /* Slightly lighter cards */
  --primary: oklch(0.72 0.15 200);         /* Brighter cyan for dark */
  --muted: oklch(0.25 0.02 250);           /* Dark muted */
}
```

### Why OKLCH?

OKLCH (Oklab Lightness Chroma Hue) provides:

1. **Perceptual uniformity** - Equal changes in values look equally different to the human eye
2. **Better interpolation** - Smooth gradients without muddy midpoints
3. **Wider gamut** - Access to more vibrant colors
4. **Predictable lightness** - Easier to create accessible contrasts

Format: `oklch(lightness chroma hue / alpha)`
- Lightness: 0 (black) to 1 (white)
- Chroma: 0 (gray) to ~0.4 (vibrant)
- Hue: 0 to 360 (degrees)

## Using the Theme Toggle

### User Interface

The theme toggle is available in the dashboard header and provides three options:

1. **Light Mode** - Forces light theme
2. **Dark Mode** - Forces dark theme
3. **System** - Follows OS/browser preference (default)

### Implementation

The theme toggle is already integrated. Users can:

```tsx
// The toggle appears automatically in the dashboard header
// Located next to the "Quick Add" dropdown
```

### Programmatic Access

If you need to access or control the theme in your components:

```tsx
'use client'

import { useTheme } from 'next-themes'

export function YourComponent() {
  const { theme, setTheme, systemTheme } = useTheme()

  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>System theme: {systemTheme}</p>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  )
}
```

## Color Palette Reference

### Semantic Colors

| Variable | Light Mode | Dark Mode | Usage |
|----------|------------|-----------|-------|
| `background` | Off-white | Dark gray | Page background |
| `foreground` | Near-black | Light gray | Primary text |
| `card` | White | Slightly lighter | Card backgrounds |
| `card-foreground` | Near-black | Light gray | Card text |
| `popover` | White | Dark gray | Dropdown/menu backgrounds |
| `primary` | TurboTenant blue | Bright cyan | Primary actions, branding |
| `primary-foreground` | White | Dark | Text on primary |
| `secondary` | Light blue | Dark blue | Secondary actions |
| `muted` | Light gray | Dark gray | Disabled states, subtle bg |
| `muted-foreground` | Medium gray | Medium gray | Secondary text |
| `accent` | Cyan | Bright cyan | Highlights, hover states |
| `destructive` | Red | Brighter red | Errors, delete actions |
| `border` | Light gray | Dark gray | Borders and dividers |
| `input` | Light gray | Dark gray | Input borders |
| `ring` | Primary blue | Bright cyan | Focus rings |

### Status Colors

Custom status colors for application states:

```css
--success: oklch(0.65 0.18 160);   /* Green */
--warning: oklch(0.75 0.15 70);    /* Amber */
```

Use with utility classes:
```tsx
<div className="text-success">Success message</div>
<div className="bg-warning/10 text-warning">Warning banner</div>
```

See `/src/styles/color-utilities.css` for full list of status color utilities.

### Accent Colors

Brand accent colors for special highlighting:

```css
/* Coral - Warmth, energy, youthfulness */
--coral: oklch(0.72 0.15 25);
--coral-light: oklch(0.92 0.05 25);

/* Mint - Freshness, trust, modern */
--mint: oklch(0.75 0.12 175);
--mint-light: oklch(0.94 0.04 175);
```

Usage:
```tsx
<div className="bg-coral-light text-coral">
  Featured property
</div>
```

### Chart Colors

Consistent colors for data visualization:

```css
--chart-1: Primary blue
--chart-2: Accent cyan
--chart-3: Success green
--chart-4: Warning amber
--chart-5: Destructive red
```

## Dark Mode Considerations

### Writing Dark Mode Compatible Code

Always use CSS variables instead of hardcoded colors:

```tsx
// Good - Uses theme variables
<div className="bg-card text-card-foreground border-border">
  Content
</div>

// Bad - Hardcoded colors
<div className="bg-white text-gray-900 border-gray-200">
  Content
</div>
```

### Testing Both Modes

When developing components, always test in both light and dark modes:

1. Click the theme toggle in the dashboard header
2. Switch between Light, Dark, and System
3. Verify:
   - Text is readable
   - Borders are visible
   - Hover states work
   - Focus states are clear
   - Status colors are distinguishable

### Dark Mode Utilities

Use the `dark:` variant for dark mode specific styles:

```tsx
<div className="bg-white dark:bg-gray-900">
  Automatically switches background
</div>

<img
  src="/logo-light.svg"
  className="dark:hidden"
/>
<img
  src="/logo-dark.svg"
  className="hidden dark:block"
/>
```

### Contrast Requirements

Maintain WCAG AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text (18px+): 3:1 contrast ratio
- Interactive elements: 3:1 contrast ratio

Our theme variables are pre-configured to meet these standards.

## Customization Guide

### Changing Brand Colors

To update the primary brand color:

1. Open `/src/app/globals.css`
2. Locate the `:root` section
3. Modify the `--primary` variable:

```css
:root {
  /* Original */
  --primary: oklch(0.35 0.12 250);

  /* Your custom color */
  --primary: oklch(0.40 0.15 280);
}
```

4. Update the dark mode variant in `.dark` section:

```css
.dark {
  --primary: oklch(0.75 0.15 280);
}
```

Tips for choosing OKLCH values:
- Keep lightness between 0.3-0.4 for light mode primary
- Increase to 0.65-0.75 for dark mode primary
- Adjust chroma (0.10-0.20) for saturation
- Change hue (0-360) for different colors

### Adding New Theme Colors

1. Add CSS variables to `globals.css`:

```css
:root {
  --custom-color: oklch(0.60 0.15 150);
}

.dark {
  --custom-color: oklch(0.70 0.15 150);
}
```

2. Add to Tailwind theme in `globals.css`:

```css
@theme inline {
  --color-custom: var(--custom-color);
}
```

3. Use in components:

```tsx
<div className="bg-custom text-custom-foreground">
  Custom colored element
</div>
```

### Creating Custom Status Colors

Add to `/src/styles/color-utilities.css`:

```css
@layer utilities {
  .text-pending {
    color: oklch(0.65 0.15 220);
  }

  .bg-pending {
    background-color: oklch(0.65 0.15 220);
  }

  .bg-pending\/10 {
    background-color: oklch(from oklch(0.65 0.15 220) l c h / 0.1);
  }
}
```

## Best Practices

### 1. Always Use Semantic Colors

```tsx
// Good - Semantic, theme-aware
<Card className="bg-card text-card-foreground">

// Bad - Hardcoded, won't adapt to theme
<div className="bg-white text-gray-900">
```

### 2. Use CSS Variables for Colors

```tsx
// Good
<div className="bg-background text-foreground">

// Avoid
<div className="bg-gray-50 text-gray-900">
```

Exception: Grays can use Tailwind's scale if they don't need theming.

### 3. Test Color Contrast

Use browser DevTools or online tools to verify contrast ratios:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools: Inspect > Accessibility panel

### 4. Use Opacity Variants Wisely

```tsx
// Good - Subtle background with opacity
<div className="bg-primary/10 border-primary/20">

// Good - Status color with transparency
<Alert className="bg-success/10 border-success">
```

### 5. Consistent Hover and Focus States

```tsx
<Button className="bg-primary hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring">
  Click me
</Button>
```

### 6. Avoid Pure Black and White

Our theme uses near-black and off-white for better visual comfort:

```css
/* Instead of #000000 and #FFFFFF */
--foreground: oklch(0.15 0.02 250);  /* Near-black */
--background: oklch(0.98 0.002 250); /* Off-white */
```

### 7. Use Muted for Secondary Content

```tsx
<div>
  <h2 className="text-foreground">Primary heading</h2>
  <p className="text-muted-foreground">Secondary description</p>
</div>
```

### 8. Status Color Guidelines

- **Success** (Green): Completed, approved, active
- **Warning** (Amber): Pending, attention needed, caution
- **Error/Destructive** (Red): Failed, rejected, delete actions
- **Info/Accent** (Cyan): Informational, neutral highlights

## Troubleshooting

### Theme Not Switching

1. Verify ThemeProvider is wrapping your app (check `layout.tsx`)
2. Ensure `suppressHydrationWarning` is on `<html>` tag
3. Check browser console for errors

### Colors Not Updating in Dark Mode

1. Make sure you're using CSS variables (e.g., `bg-card` not `bg-white`)
2. Verify dark mode classes are defined in `globals.css`
3. Check if custom components use the `dark:` variant correctly

### Focus Rings Not Visible

Update button/input components to use theme-aware ring colors:

```tsx
className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
```

### Poor Contrast in Dark Mode

1. Check if custom colors have dark mode variants
2. Increase lightness value for dark mode colors
3. Test with contrast checker tools
4. Adjust `--foreground` and `--background` values

### Colors Look Different in Production

1. Ensure `globals.css` is imported in root layout
2. Check build process includes all CSS files
3. Verify Tailwind config is correct
4. Clear browser cache and hard refresh

## Resources

- [OKLCH Color Picker](https://oklch.com/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [Color Utilities Reference](/src/styles/color-utilities.css)
- [Spacing Guidelines](/docs/SPACING_GUIDELINES.md)

## Quick Reference

### Common Color Classes

```tsx
// Backgrounds
bg-background      // Page background
bg-card            // Card background
bg-muted           // Subtle background
bg-primary         // Primary color
bg-secondary       // Secondary color

// Text
text-foreground    // Primary text
text-muted-foreground  // Secondary text
text-primary       // Primary color text
text-destructive   // Error text

// Borders
border-border      // Standard borders
border-input       // Input borders
border-primary     // Primary color borders

// Status
bg-success/10 text-success
bg-warning/10 text-warning
bg-error/10 text-error
```

### Theme Toggle Locations

- **Dashboard**: Top right header, next to Quick Add button
- **Future**: Can be added to settings page, user menu, etc.

## Need Help?

For questions about theming:
1. Check this documentation
2. Review `/src/app/globals.css` for color definitions
3. Inspect existing components for patterns
4. Test in both light and dark modes before finalizing
