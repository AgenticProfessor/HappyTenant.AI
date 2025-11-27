import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * VisuallyHidden component
 *
 * Hides content visually but keeps it accessible to screen readers.
 * This is useful for:
 * - Adding descriptive text for icon-only buttons
 * - Providing additional context that's visually redundant
 * - Creating screen-reader-only labels
 *
 * @example
 * <Button>
 *   <SearchIcon />
 *   <VisuallyHidden>Search</VisuallyHidden>
 * </Button>
 */
export function VisuallyHidden({
  children,
  asChild = false,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? React.Fragment : 'span';

  if (asChild) {
    return <>{children}</>;
  }

  return (
    <span
      className={cn('sr-only', className)}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
      {...props}
    >
      {children}
    </span>
  );
}

VisuallyHidden.displayName = 'VisuallyHidden';
