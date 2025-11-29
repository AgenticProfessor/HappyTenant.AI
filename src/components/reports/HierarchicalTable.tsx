'use client';

import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { ReportData, ReportRow, ReportColumn } from '@/lib/reports/types';

interface HierarchicalTableProps {
  report: ReportData;
  onCellClick?: (row: ReportRow, columnKey: string, value: number | string | null) => void;
  className?: string;
}

export function HierarchicalTable({ report, onCellClick, className }: HierarchicalTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(() => {
    // Start with all group rows expanded
    const expanded = new Set<string>();
    const collectGroupIds = (rows: ReportRow[]) => {
      rows.forEach((row) => {
        if (row.isGroup) {
          expanded.add(row.id);
        }
        if (row.children) {
          collectGroupIds(row.children);
        }
      });
    };
    collectGroupIds(report.rows);
    return expanded;
  });

  const toggleRow = useCallback((rowId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }, []);

  // Flatten rows based on expansion state
  const flattenedRows = useMemo(() => {
    const result: ReportRow[] = [];

    const flattenRecursive = (rows: ReportRow[], depth: number = 0) => {
      rows.forEach((row) => {
        result.push({ ...row, depth });

        if (row.children && row.isGroup && expandedRows.has(row.id)) {
          flattenRecursive(row.children, depth + 1);
        }
      });
    };

    flattenRecursive(report.rows);
    return result;
  }, [report.rows, expandedRows]);

  const formatValue = (value: number | string | null, type: ReportColumn['type']): string => {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    switch (type) {
      case 'currency':
        const isNegative = value < 0;
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Math.abs(value));
        return isNegative ? `-${formatted}` : formatted;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return new Intl.NumberFormat('en-US').format(value);
      default:
        return String(value);
    }
  };

  const getValueColor = (value: number | string | null, type: ReportColumn['type']): string => {
    if (typeof value !== 'number' || type !== 'currency') {
      return '';
    }
    if (value < 0) {
      return 'text-red-600';
    }
    return '';
  };

  const handleCellClick = (row: ReportRow, column: ReportColumn, value: number | string | null) => {
    // Only allow clicking on numeric values for drill-down
    if (typeof value === 'number' && value !== 0 && onCellClick) {
      onCellClick(row, column.key, value);
    }
  };

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 sticky left-0 bg-slate-50 min-w-[280px]">
              Account
            </th>
            {report.columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-3 text-sm font-semibold text-slate-700 whitespace-nowrap',
                  column.align === 'right' || column.type === 'currency' || column.type === 'number'
                    ? 'text-right'
                    : column.align === 'center'
                    ? 'text-center'
                    : 'text-left',
                  column.width || 'min-w-[120px]'
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {flattenedRows.map((row, index) => {
            const isExpanded = expandedRows.has(row.id);
            const hasChildren = row.isGroup && row.children && row.children.length > 0;

            return (
              <tr
                key={row.id}
                className={cn(
                  'border-b border-slate-100 transition-colors',
                  row.isTotal
                    ? 'bg-slate-100 font-semibold'
                    : index % 2 === 0
                    ? 'bg-white'
                    : 'bg-slate-50/50',
                  'hover:bg-indigo-50/50'
                )}
              >
                {/* Account Name Column */}
                <td
                  className={cn(
                    'px-4 py-2.5 text-sm sticky left-0',
                    row.isTotal ? 'bg-slate-100 font-semibold text-slate-900' : 'bg-white',
                    'hover:bg-indigo-50/50'
                  )}
                  style={{ paddingLeft: `${16 + row.depth * 20}px` }}
                >
                  <div className="flex items-center gap-1.5">
                    {hasChildren ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0 hover:bg-slate-200"
                        onClick={() => toggleRow(row.id)}
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                        )}
                      </Button>
                    ) : (
                      <span className="w-5" />
                    )}
                    <span
                      className={cn(
                        row.isTotal && 'font-semibold',
                        row.isGroup && !row.isTotal && 'font-medium'
                      )}
                    >
                      {row.name}
                    </span>
                  </div>
                </td>

                {/* Value Columns */}
                {report.columns.map((column) => {
                  const value = row.values[column.key];
                  const isClickable =
                    typeof value === 'number' && value !== 0 && onCellClick;

                  return (
                    <td
                      key={column.key}
                      className={cn(
                        'px-4 py-2.5 text-sm whitespace-nowrap',
                        column.align === 'right' || column.type === 'currency' || column.type === 'number'
                          ? 'text-right'
                          : column.align === 'center'
                          ? 'text-center'
                          : 'text-left',
                        getValueColor(value, column.type),
                        row.isTotal && 'font-semibold',
                        isClickable && 'cursor-pointer hover:underline hover:text-indigo-600'
                      )}
                      onClick={() => handleCellClick(row, column, value)}
                    >
                      {formatValue(value, column.type)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {flattenedRows.length === 0 && (
        <div className="flex items-center justify-center py-12 text-slate-500">
          No data available for the selected filters
        </div>
      )}
    </div>
  );
}

// Expand/Collapse All Controls
interface TableControlsProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export function TableControls({ onExpandAll, onCollapseAll }: TableControlsProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={onExpandAll}
        className="h-7 text-xs text-slate-600 hover:text-slate-900"
      >
        Expand All
      </Button>
      <span className="text-slate-300">|</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCollapseAll}
        className="h-7 text-xs text-slate-600 hover:text-slate-900"
      >
        Collapse All
      </Button>
    </div>
  );
}
