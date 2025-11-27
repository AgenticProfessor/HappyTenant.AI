'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface ResponsiveTableProps<T> {
  data: T[];
  columns: {
    key: string;
    label: string;
    mobileLabel?: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
    hideOnMobile?: boolean;
  }[];
  mobileCardRender?: (item: T, index: number) => React.ReactNode;
  onRowClick?: (item: T) => void;
  className?: string;
  emptyState?: React.ReactNode;
}

export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  mobileCardRender,
  onRowClick,
  className,
  emptyState,
}: ResponsiveTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <>
      {/* Desktop Table View - hidden on mobile */}
      <div className="hidden lg:block">
        <div className="relative w-full overflow-x-auto">
          <table className={cn('w-full caption-bottom text-sm', className)}>
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {data.map((item, index) => (
                <tr
                  key={index}
                  className={cn(
                    'border-b transition-colors hover:bg-muted/50',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'p-2 align-middle whitespace-nowrap',
                        column.className
                      )}
                    >
                      {column.render
                        ? column.render(item)
                        : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View - hidden on desktop */}
      <div className="lg:hidden space-y-3">
        {data.map((item, index) => (
          <Card
            key={index}
            className={cn(
              'overflow-hidden',
              onRowClick && 'cursor-pointer active:scale-[0.98] transition-transform'
            )}
            onClick={() => onRowClick?.(item)}
          >
            <CardContent className="p-4">
              {mobileCardRender ? (
                mobileCardRender(item, index)
              ) : (
                <div className="space-y-3">
                  {columns
                    .filter((col) => !col.hideOnMobile)
                    .map((column) => (
                      <div key={column.key} className="flex justify-between items-start gap-4">
                        <span className="text-sm font-medium text-muted-foreground min-w-[80px]">
                          {column.mobileLabel || column.label}
                        </span>
                        <span className="text-sm text-right flex-1">
                          {column.render
                            ? column.render(item)
                            : item[column.key]}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
