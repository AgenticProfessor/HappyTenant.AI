'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * SkipLink component
 *
 * Provides a "Skip to main content" link for keyboard users.
 * This link is hidden until focused, allowing users to bypass
 * repetitive navigation and jump straight to the main content.
 *
 * WCAG 2.1 Success Criterion 2.4.1 (Bypass Blocks) - Level A
 *
 * @example
 * <SkipLink href="#main-content" />
 */
export function SkipLink({
  href = '#main-content',
  children = 'Skip to main content',
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only',
        'fixed top-4 left-4 z-[9999]',
        'bg-primary text-primary-foreground',
        'px-4 py-2 rounded-md',
        'font-medium text-sm',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'transition-all',
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}

SkipLink.displayName = 'SkipLink';
