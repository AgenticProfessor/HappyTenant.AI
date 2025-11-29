'use client';

import { ReportCard } from './ReportCard';
import type { ReportCategoryGroup } from '@/lib/reports/types';

interface ReportCategorySectionProps {
  category: ReportCategoryGroup;
  onToggleFavorite?: (reportType: string) => void;
  isTogglingFavorite?: string | null;
}

export function ReportCategorySection({
  category,
  onToggleFavorite,
  isTogglingFavorite,
}: ReportCategorySectionProps) {
  if (category.reports.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-slate-900">{category.name}</h2>
        <div className="h-0.5 flex-1 bg-gradient-to-r from-indigo-200 to-transparent rounded-full" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {category.reports.map((report) => (
          <ReportCard
            key={report.type}
            report={report}
            onToggleFavorite={onToggleFavorite}
            isTogglingFavorite={isTogglingFavorite === report.type}
          />
        ))}
      </div>
    </section>
  );
}
