'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ReportHeader } from '@/components/reports/ReportHeader';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { HierarchicalTable, TableControls } from '@/components/reports/HierarchicalTable';
import { ReportExportMenu } from '@/components/reports/ReportExportMenu';
import { StewardInsightsPanel } from '@/components/reports/StewardInsightsPanel';
import { TransactionDrawer } from '@/components/reports/TransactionDrawer';
import { getReportDefinition, getDefaultFilters } from '@/lib/reports/definitions';
import { toast } from 'sonner';
import type { ReportData, ReportFilters as ReportFiltersType, ReportRow, ReportType } from '@/lib/reports/types';

export default function ReportViewerPage() {
  const params = useParams();
  const reportType = params.type as ReportType;

  const [filters, setFilters] = useState<ReportFiltersType>(() => getDefaultFilters(reportType));
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Drill-down state
  const [drilldownRow, setDrilldownRow] = useState<ReportRow | null>(null);
  const [drilldownColumn, setDrilldownColumn] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const reportDefinition = useMemo(() => getReportDefinition(reportType), [reportType]);

  // Fetch report data
  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        period: filters.period,
        startDate: filters.startDate,
        endDate: filters.endDate,
        accountingMethod: filters.accountingMethod,
        groupBy: filters.groupBy,
      });

      if (filters.propertyId) {
        params.set('propertyId', filters.propertyId);
      }

      const response = await fetch(`/api/reports/${reportType}?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch report');
      }

      const data = await response.json();
      setReportData(data.report);
    } catch (err) {
      setError('Could not load report. Please try again.');
      console.error('Error fetching report:', err);
    } finally {
      setIsLoading(false);
    }
  }, [reportType, filters]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: ReportFiltersType) => {
    setFilters(newFilters);
  };

  // Handle cell click for drill-down
  const handleCellClick = (row: ReportRow, columnKey: string) => {
    setDrilldownRow(row);
    setDrilldownColumn(columnKey);
    setIsDrawerOpen(true);
  };

  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    setIsTogglingFavorite(true);

    try {
      const response = await fetch('/api/reports/favorites', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
        toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
      }
    } catch (err) {
      toast.error('Failed to update favorite');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // Format date range for display
  const formatDateRange = () => {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  if (!reportDefinition) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-lg font-medium text-slate-900 mb-2">Report not found</h2>
        <p className="text-slate-500">The requested report type does not exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ReportHeader
        title={reportData?.title || reportDefinition.name}
        subtitle={reportDefinition.description}
        dateRange={formatDateRange()}
        reportDefinition={reportDefinition}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
        isTogglingFavorite={isTogglingFavorite}
      />

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        reportDefinition={reportDefinition}
        isLoading={isLoading}
      />

      {/* Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <TableControls
          onExpandAll={() => {
            // Handled within HierarchicalTable
          }}
          onCollapseAll={() => {
            // Handled within HierarchicalTable
          }}
        />

        <div className="flex items-center gap-3">
          <StewardInsightsPanel reportData={reportData} isReportLoading={isLoading} />
          <ReportExportMenu
            reportType={reportType}
            filters={filters}
            disabled={isLoading || !reportData}
          />
        </div>
      </div>

      {/* Report Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <ReportTableSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <p className="text-slate-500 mb-4">{error}</p>
              <button
                onClick={fetchReport}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Try again
              </button>
            </div>
          ) : reportData ? (
            <HierarchicalTable
              report={reportData}
              onCellClick={handleCellClick}
              className="min-h-[400px]"
            />
          ) : null}
        </CardContent>
      </Card>

      {/* Transaction Drill-down Drawer */}
      <TransactionDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setDrilldownRow(null);
          setDrilldownColumn(null);
        }}
        reportType={reportType}
        row={drilldownRow}
        columnKey={drilldownColumn}
        filters={filters}
      />
    </div>
  );
}

// Loading skeleton for the report table
function ReportTableSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {/* Header Row */}
      <div className="flex gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Data Rows */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex gap-4" style={{ paddingLeft: `${(i % 3) * 20}px` }}>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
}
