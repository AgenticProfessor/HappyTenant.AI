'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { ReportListItem } from '@/lib/reports/types';

interface ReportCardProps {
  report: ReportListItem;
  onToggleFavorite?: (reportType: string) => void;
  isTogglingFavorite?: boolean;
}

export function ReportCard({ report, onToggleFavorite, isTogglingFavorite }: ReportCardProps) {
  // Get the icon component dynamically
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  const IconComponent = icons[report.icon] || LucideIcons.FileText;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(report.type);
  };

  return (
    <Link
      href={`/dashboard/reports/${report.type}`}
      className={cn(
        'group flex items-center justify-between px-4 py-3 rounded-lg',
        'bg-white hover:bg-slate-50 border border-slate-200',
        'transition-all duration-200 hover:shadow-sm hover:border-slate-300'
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
          <IconComponent className="h-5 w-5 text-indigo-600" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
            {report.name}
          </h3>
          <p className="text-xs text-slate-500 truncate hidden sm:block">
            {report.description}
          </p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'flex-shrink-0 h-8 w-8 ml-2',
          report.isFavorite
            ? 'text-yellow-500 hover:text-yellow-600'
            : 'text-slate-300 hover:text-yellow-500'
        )}
        onClick={handleFavoriteClick}
        disabled={isTogglingFavorite}
        aria-label={report.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star
          className={cn(
            'h-4 w-4 transition-all',
            report.isFavorite && 'fill-current'
          )}
        />
      </Button>
    </Link>
  );
}

// Compact version for the favorites section
export function ReportCardCompact({ report, onToggleFavorite, isTogglingFavorite }: ReportCardProps) {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  const IconComponent = icons[report.icon] || LucideIcons.FileText;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(report.type);
  };

  return (
    <Link
      href={`/dashboard/reports/${report.type}`}
      className={cn(
        'group flex items-center justify-between px-3 py-2.5 rounded-md',
        'hover:bg-slate-100 transition-colors'
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <IconComponent className="h-4 w-4 text-slate-500 group-hover:text-indigo-600 flex-shrink-0" />
        <span className="text-sm text-slate-700 group-hover:text-indigo-600 truncate">
          {report.name}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0 h-6 w-6 text-yellow-500 hover:text-yellow-600"
        onClick={handleFavoriteClick}
        disabled={isTogglingFavorite}
        aria-label="Remove from favorites"
      >
        <Star className="h-3.5 w-3.5 fill-current" />
      </Button>
    </Link>
  );
}
