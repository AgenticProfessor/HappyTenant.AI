'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TouchTargetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  minSize?: 44 | 48;
  asChild?: boolean;
}

/**
 * TouchTarget wrapper ensures minimum touch target size for accessibility
 * Follows WCAG 2.1 guidelines (44x44px minimum) and iOS guidelines (48x48px recommended)
 *
 * Usage:
 * <TouchTarget>
 *   <button>Small button</button>
 * </TouchTarget>
 *
 * Or with custom min size:
 * <TouchTarget minSize={48}>
 *   <IconButton />
 * </TouchTarget>
 */
export function TouchTarget({
  children,
  minSize = 44,
  className,
  ...props
}: TouchTargetProps) {
  const minSizeClass = minSize === 48 ? 'min-h-[48px] min-w-[48px]' : 'min-h-[44px] min-w-[44px]';

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center touch-manipulation',
        minSizeClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * TouchableArea adds padding around small interactive elements to meet touch target requirements
 * while maintaining visual size
 *
 * Usage:
 * <TouchableArea>
 *   <X className="h-4 w-4" />
 * </TouchableArea>
 */
export function TouchableArea({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center p-3 -m-3 touch-manipulation',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * MobileTouchButton enhances button component with proper touch targets for mobile
 */
export const MobileTouchButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost';
  }
>(({ children, className, variant = 'primary', ...props }, ref) => {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors',
        'min-h-[44px] px-4 py-2 touch-manipulation',
        'disabled:pointer-events-none disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        // Larger touch targets on mobile
        'md:min-h-[36px]',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

MobileTouchButton.displayName = 'MobileTouchButton';
