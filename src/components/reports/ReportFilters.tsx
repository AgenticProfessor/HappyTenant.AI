'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Settings2 } from 'lucide-react';
import {
  PERIOD_PRESETS,
  ACCOUNTING_METHODS,
  GROUP_BY_OPTIONS,
  getDateRangeFromPeriod,
} from '@/lib/reports/definitions';
import type { ReportFilters as ReportFiltersType, GroupBy, ReportDefinition } from '@/lib/reports/types';

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onFiltersChange: (filters: ReportFiltersType) => void;
  reportDefinition?: ReportDefinition;
  isLoading?: boolean;
}

export function ReportFilters({
  filters,
  onFiltersChange,
  reportDefinition,
  isLoading,
}: ReportFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ReportFiltersType>(filters);
  const [hasChanges, setHasChanges] = useState(false);

  // Check if filters have changed from applied filters
  useEffect(() => {
    const changed =
      localFilters.period !== filters.period ||
      localFilters.startDate !== filters.startDate ||
      localFilters.endDate !== filters.endDate ||
      localFilters.accountingMethod !== filters.accountingMethod ||
      localFilters.groupBy !== filters.groupBy ||
      localFilters.propertyId !== filters.propertyId;
    setHasChanges(changed);
  }, [localFilters, filters]);

  // Update date range when period changes
  const handlePeriodChange = (period: string) => {
    if (period === 'custom') {
      setLocalFilters((prev) => ({ ...prev, period: 'custom' }));
    } else {
      const dateRange = getDateRangeFromPeriod(period);
      setLocalFilters((prev) => ({
        ...prev,
        period: period as ReportFiltersType['period'],
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }));
    }
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const supportedGroupBy = reportDefinition?.supportedFilters.groupBy || ['none'];

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      {/* Filter Label */}
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Settings2 className="h-4 w-4" />
        <span>Report Period</span>
      </div>

      {/* Filter Controls */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Period Preset */}
        <div className="space-y-1.5">
          <Label htmlFor="period" className="text-xs text-slate-500">
            Period
          </Label>
          <Select
            value={localFilters.period}
            onValueChange={handlePeriodChange}
          >
            <SelectTrigger id="period" className="bg-white">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* From Date */}
        <div className="space-y-1.5">
          <Label htmlFor="startDate" className="text-xs text-slate-500">
            From
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="startDate"
              type="date"
              value={localFilters.startDate}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                  period: 'custom',
                }))
              }
              className="pl-9 bg-white"
            />
          </div>
        </div>

        {/* To Date */}
        <div className="space-y-1.5">
          <Label htmlFor="endDate" className="text-xs text-slate-500">
            To
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="endDate"
              type="date"
              value={localFilters.endDate}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                  period: 'custom',
                }))
              }
              className="pl-9 bg-white"
            />
          </div>
        </div>

        {/* Accounting Method */}
        {reportDefinition?.supportedFilters.accountingMethod !== false && (
          <div className="space-y-1.5">
            <Label htmlFor="accountingMethod" className="text-xs text-slate-500">
              Accounting Method
            </Label>
            <Select
              value={localFilters.accountingMethod}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  accountingMethod: value as 'cash' | 'accrual',
                }))
              }
            >
              <SelectTrigger id="accountingMethod" className="bg-white">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNTING_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Group By */}
        {supportedGroupBy.length > 1 && (
          <div className="space-y-1.5">
            <Label htmlFor="groupBy" className="text-xs text-slate-500">
              Group by
            </Label>
            <Select
              value={localFilters.groupBy}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  groupBy: value as GroupBy,
                }))
              }
            >
              <SelectTrigger id="groupBy" className="bg-white">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                {GROUP_BY_OPTIONS.filter((opt) =>
                  supportedGroupBy.includes(opt.value as GroupBy)
                ).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Apply Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleApply}
          disabled={isLoading || !hasChanges}
          className="min-w-[100px]"
        >
          {isLoading ? 'Loading...' : 'Apply Filters'}
        </Button>
      </div>
    </div>
  );
}

// Compact inline filters for smaller screens or simpler views
export function ReportFiltersInline({
  filters,
  onFiltersChange,
  isLoading,
}: Omit<ReportFiltersProps, 'reportDefinition'>) {
  const handlePeriodChange = (period: string) => {
    const dateRange = getDateRangeFromPeriod(period);
    onFiltersChange({
      ...filters,
      period: period as ReportFiltersType['period'],
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.period}
        onValueChange={handlePeriodChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[160px] bg-white">
          <SelectValue placeholder="Period" />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_PRESETS.slice(0, -1).map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.accountingMethod}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            accountingMethod: value as 'cash' | 'accrual',
          })
        }
        disabled={isLoading}
      >
        <SelectTrigger className="w-[120px] bg-white">
          <SelectValue placeholder="Method" />
        </SelectTrigger>
        <SelectContent>
          {ACCOUNTING_METHODS.map((method) => (
            <SelectItem key={method.value} value={method.value}>
              {method.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.groupBy}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            groupBy: value as GroupBy,
          })
        }
        disabled={isLoading}
      >
        <SelectTrigger className="w-[120px] bg-white">
          <SelectValue placeholder="Group by" />
        </SelectTrigger>
        <SelectContent>
          {GROUP_BY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
