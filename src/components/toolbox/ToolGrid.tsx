'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ToolGridProps {
  children: ReactNode;
  className?: string;
}

export function ToolGrid({ children, className }: ToolGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        // Responsive: 1 column on mobile, 2 on tablet/desktop
        "grid-cols-1 md:grid-cols-2",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ToolSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function ToolSection({ title, subtitle, children, className }: ToolSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <ToolGrid>{children}</ToolGrid>
    </section>
  );
}
