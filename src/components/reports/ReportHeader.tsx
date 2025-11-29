'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Pencil } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReportDefinition } from '@/lib/reports/types';

interface ReportHeaderProps {
  title: string;
  subtitle?: string;
  dateRange?: string;
  reportDefinition?: ReportDefinition;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isTogglingFavorite?: boolean;
}

export function ReportHeader({
  title,
  subtitle,
  dateRange,
  reportDefinition,
  isFavorite,
  onToggleFavorite,
  isTogglingFavorite,
}: ReportHeaderProps) {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  const IconComponent = reportDefinition?.icon
    ? icons[reportDefinition.icon] || LucideIcons.FileText
    : LucideIcons.FileText;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        {/* Back Link */}
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Link>

        {/* Title Row */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <IconComponent className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {title}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-7 w-7',
                  isFavorite
                    ? 'text-yellow-500 hover:text-yellow-600'
                    : 'text-slate-300 hover:text-yellow-500'
                )}
                onClick={onToggleFavorite}
                disabled={isTogglingFavorite}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  className={cn('h-4 w-4', isFavorite && 'fill-current')}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-400 hover:text-slate-600"
                aria-label="Edit report name"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
            {dateRange && (
              <p className="text-sm text-slate-500">{dateRange}</p>
            )}
          </div>
        </div>

        {/* Subtitle/Description */}
        {subtitle && (
          <p className="text-sm text-slate-500 mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
