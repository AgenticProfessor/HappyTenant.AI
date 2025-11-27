/**
 * Standard icon size constants for consistent sizing across the application.
 *
 * Usage:
 * - Import the size constants and use them in className strings
 * - Use the getIconSize helper for dynamic sizing
 *
 * Examples:
 * ```tsx
 * import { ICON_SIZES, getIconSize } from '@/lib/icon-sizes';
 *
 * // Using constants
 * <Icon className={ICON_SIZES.md} />
 *
 * // Using helper function
 * <Icon className={getIconSize('md')} />
 * ```
 */

export const ICON_SIZES = {
  /** Extra small: 12px (0.75rem) - Use for inline text icons */
  xs: 'h-3 w-3',

  /** Small: 16px (1rem) - Use for compact buttons, inline badges */
  sm: 'h-4 w-4',

  /** Medium: 20px (1.25rem) - Default size for most UI elements */
  md: 'h-5 w-5',

  /** Large: 24px (1.5rem) - Use for prominent buttons, navigation */
  lg: 'h-6 w-6',

  /** Extra large: 32px (2rem) - Use for headers, feature highlights */
  xl: 'h-8 w-8',

  /** 2X large: 40px (2.5rem) - Use for hero sections, empty states */
  '2xl': 'h-10 w-10',
} as const;

export type IconSize = keyof typeof ICON_SIZES;

/**
 * Helper function to get icon size classes dynamically
 * @param size - The icon size key
 * @returns Tailwind classes for the specified icon size
 */
export function getIconSize(size: IconSize = 'md'): string {
  return ICON_SIZES[size];
}

/**
 * Size guidelines:
 *
 * - xs (3): Inline with text, minimal emphasis
 * - sm (4): Buttons (default/sm size), dropdown items, table icons
 * - md (5): Navigation items, cards, primary UI elements (DEFAULT)
 * - lg (6): Page headers, prominent buttons, feature cards
 * - xl (8): Logo sizes, section headers, dashboard stats
 * - 2xl (10): Empty states, hero sections, large feature areas
 *
 * Consistency rules:
 * 1. Match icon size to button size: sm button = sm icon, default button = sm icon, lg button = md icon
 * 2. Navigation items typically use md (5)
 * 3. Dropdown menu items use sm (4)
 * 4. Card action icons use sm (4)
 * 5. Empty states and illustrations use xl or 2xl (8-10)
 */
