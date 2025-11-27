# Accessibility Documentation

## Overview

This document outlines the accessibility features, standards compliance, and testing procedures for the Happy Tenant property management application. We are committed to making our application usable by everyone, including people with disabilities.

## WCAG 2.1 AA Compliance

We strive to meet WCAG 2.1 Level AA compliance across all pages and components. This includes:

### Perceivable
- **Text Alternatives**: All non-text content has text alternatives
- **Color Contrast**: Minimum contrast ratio of 4.5:1 for normal text
- **Resize Text**: Text can be resized up to 200% without loss of functionality
- **Visual Presentation**: Proper spacing and line height for readability

### Operable
- **Keyboard Navigation**: All functionality is available via keyboard
- **No Keyboard Trap**: Keyboard focus is never trapped in any component
- **Skip Links**: Skip to main content links on all pages
- **Focus Indicators**: Visible focus indicators on all interactive elements
- **Enough Time**: No time limits on user interactions

### Understandable
- **Consistent Navigation**: Navigation is consistent across all pages
- **Predictable**: Components behave consistently
- **Error Prevention**: Clear error messages and validation
- **Labels and Instructions**: All form inputs have associated labels

### Robust
- **Valid HTML**: Semantic HTML5 elements used throughout
- **ARIA Attributes**: Proper use of ARIA roles, states, and properties
- **Screen Reader Compatible**: Tested with NVDA, JAWS, and VoiceOver

## Implemented Features

### 1. Skip Links
Location: `/src/components/ui/skip-link.tsx`

A "Skip to main content" link appears at the top of every page, allowing keyboard users to bypass repetitive navigation.

```tsx
import { SkipLink } from '@/components/ui/skip-link';

// In layout
<SkipLink href="#main-content" />
```

### 2. Visually Hidden Elements
Location: `/src/components/ui/visually-hidden.tsx`

Component for adding screen-reader-only content that is visually hidden.

```tsx
import { VisuallyHidden } from '@/components/ui/visually-hidden';

<Button>
  <SearchIcon />
  <VisuallyHidden>Search</VisuallyHidden>
</Button>
```

### 3. Accessibility Utilities
Location: `/src/lib/accessibility.ts`

Helper functions for common accessibility patterns:

- `generateId()`: Create unique IDs for form elements
- `announceToScreenReader()`: Announce dynamic content changes
- `trapFocus()`: Trap focus within modals and dialogs
- `isReducedMotion()`: Detect user's motion preference
- `checkColorContrast()`: Verify color contrast ratios
- `handleKeyboardNavigation()`: Manage keyboard interactions

Example usage:
```tsx
import { announceToScreenReader } from '@/lib/accessibility';

// Announce to screen reader
announceToScreenReader('Payment recorded successfully', 'polite');
```

### 4. ARIA Landmarks

All pages use proper ARIA landmark regions:

- `<header>`: Page headers and navigation
- `<main>`: Main content area (with `id="main-content"`)
- `<nav>`: Navigation menus (with `aria-label`)
- `<aside>`: Sidebar content
- `<section>`: Thematic grouping (with `aria-labelledby`)

### 5. Form Accessibility

All form inputs follow these patterns:

```tsx
<label htmlFor="property-search" className="sr-only">
  Search properties
</label>
<Input
  id="property-search"
  aria-label="Search properties by name or address"
  // ... other props
/>
```

### 6. Interactive Elements

All interactive elements have:
- Proper `aria-label` or visible text
- `aria-current="page"` for active navigation items
- `aria-pressed` for toggle buttons
- `aria-hidden="true"` for decorative icons

### 7. Heading Hierarchy

Pages maintain proper heading hierarchy:
- One `<h1>` per page
- Sequential heading levels (no skipping from h1 to h3)
- Descriptive heading text

## Known Issues and Limitations

### Current Issues
1. **Color Contrast on Badges**: Some badge color combinations may not meet AA standards in dark mode
   - **Status**: Investigating
   - **Workaround**: Use text alongside badges for important information

2. **Complex Data Tables**: Properties and tenants tables could benefit from additional ARIA attributes
   - **Status**: Planned enhancement
   - **Impact**: Low - basic accessibility is present

3. **Chart Accessibility**: Dashboard charts need alternative text descriptions
   - **Status**: Planned for next sprint
   - **Workaround**: Data is also available in table format

### Resolved Issues
- ✅ Skip link implementation (completed)
- ✅ Search input labels (completed)
- ✅ Icon-only buttons now have accessible labels (completed)
- ✅ Navigation ARIA landmarks (completed)

## Testing Recommendations

### Automated Testing

Run automated accessibility tests using:

```bash
# Install dependencies
npm install -D @axe-core/react eslint-plugin-jsx-a11y

# Run tests
npm run test:a11y
```

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Verify skip link appears on focus
- [ ] Test all forms can be completed with keyboard only
- [ ] Ensure modals/dialogs trap focus correctly
- [ ] Verify dropdown menus work with arrow keys

#### Screen Reader Testing

**NVDA (Windows)**
```
1. Open NVDA
2. Navigate through dashboard
3. Verify all buttons/links are announced
4. Check form labels are read correctly
5. Test table navigation
```

**JAWS (Windows)**
```
1. Open JAWS
2. Use Insert+F7 to list headings
3. Verify heading hierarchy
4. Test forms mode (Enter on input)
5. Verify ARIA live regions announce
```

**VoiceOver (macOS)**
```bash
# Enable VoiceOver
Cmd + F5

# Navigate with:
# VO + Right Arrow - Next item
# VO + Cmd + H - Next heading
# VO + U - Rotor menu
```

#### Visual Testing
- [ ] Zoom page to 200% - verify no content is cut off
- [ ] Test with Windows High Contrast mode
- [ ] Verify focus indicators are visible
- [ ] Check color contrast with browser DevTools

### Browser Testing

Test in these browser/screen reader combinations:
- Chrome + NVDA (Windows)
- Firefox + NVDA (Windows)
- Edge + JAWS (Windows)
- Safari + VoiceOver (macOS)
- Safari + VoiceOver (iOS)
- Chrome + TalkBack (Android)

## Component-Specific Notes

### Dashboard Layout
- Uses semantic landmarks (`<nav>`, `<main>`, `<aside>`)
- Skip link jumps to `#main-content`
- Mobile menu properly announced
- Active nav items use `aria-current="page"`

### Buttons
- All icon-only buttons have `aria-label`
- Decorative icons marked `aria-hidden="true"`
- Loading/disabled states properly communicated

### Forms
- All inputs have associated labels
- Error messages linked with `aria-describedby`
- Required fields marked with `required` attribute
- Form validation provides clear error messages

### Dialogs/Modals
- Use Radix UI Dialog primitive (accessible by default)
- Focus trapped within dialog
- Close button has accessible label
- ESC key closes dialog

### Data Tables
- Proper `<table>`, `<thead>`, `<tbody>` structure
- Column headers use `<th>` elements
- Row headers where appropriate
- Consider `aria-sort` for sortable columns

## Resources

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension for accessibility testing
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation tool
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Built into Chrome DevTools
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - Color contrast verification

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/) - Accessibility resources
- [Deque University](https://dequeuniversity.com/) - Accessibility training

### Screen Readers
- [NVDA](https://www.nvaccess.org/) - Free screen reader for Windows
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) - Popular commercial screen reader
- VoiceOver - Built into macOS and iOS
- [TalkBack](https://support.google.com/accessibility/android/answer/6283677) - Built into Android

## Contributing

When adding new features or components:

1. **Use Semantic HTML**: Use the most appropriate HTML element
2. **Add ARIA Labels**: For custom components and icon-only buttons
3. **Test with Keyboard**: Ensure all functionality works without a mouse
4. **Check Contrast**: Verify text has sufficient contrast
5. **Test with Screen Reader**: At least one screen reader test
6. **Document Issues**: Add any known issues to this document

### Code Review Checklist

- [ ] All images have alt text (or `alt=""` if decorative)
- [ ] All form inputs have associated labels
- [ ] Interactive elements are keyboard accessible
- [ ] ARIA attributes are used correctly
- [ ] Color is not the only means of conveying information
- [ ] Focus indicators are visible
- [ ] Heading hierarchy is maintained
- [ ] Screen reader tested (at minimum VoiceOver on macOS)

## Support

For accessibility-related questions or to report issues:
- Create an issue in the GitHub repository
- Tag with `accessibility` label
- Provide details about the issue and how to reproduce

## Commitment

We are committed to continuous improvement of our application's accessibility. This is an ongoing effort, and we welcome feedback from our users, especially those using assistive technologies.

Last updated: November 2024
