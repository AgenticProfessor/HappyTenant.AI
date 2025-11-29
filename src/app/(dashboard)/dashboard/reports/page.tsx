'use client';

import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ReportCategorySection } from '@/components/reports/ReportCategorySection';
import { ReportCardCompact } from '@/components/reports/ReportCard';
import { getReportsByCategory } from '@/lib/reports/definitions';
import { Search, Star, FileBarChart } from 'lucide-react';
import { toast } from 'sonner';
import type { ReportListItem } from '@/lib/reports/types';

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState<string | null>(null);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

  // Fetch favorites on mount
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/reports/favorites');
        if (response.ok) {
          const data = await response.json();
          setFavorites(data.favorites || []);
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      } finally {
        setIsLoadingFavorites(false);
      }
    };

    fetchFavorites();
  }, []);

  // Get all report categories
  const categories = useMemo(() => {
    const cats = getReportsByCategory();
    // Add favorite status to each report
    return cats.map((cat) => ({
      ...cat,
      reports: cat.reports.map((report) => ({
        ...report,
        isFavorite: favorites.includes(report.type),
      })),
    }));
  }, [favorites]);

  // Filter reports by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }

    const query = searchQuery.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        reports: cat.reports.filter(
          (report) =>
            report.name.toLowerCase().includes(query) ||
            report.description.toLowerCase().includes(query)
        ),
      }))
      .filter((cat) => cat.reports.length > 0);
  }, [categories, searchQuery]);

  // Get favorite reports
  const favoriteReports = useMemo(() => {
    const allReports: ReportListItem[] = [];
    categories.forEach((cat) => {
      cat.reports.forEach((report) => {
        if (report.isFavorite) {
          allReports.push(report);
        }
      });
    });
    return allReports;
  }, [categories]);

  const handleToggleFavorite = async (reportType: string) => {
    setIsTogglingFavorite(reportType);
    const isFavorite = favorites.includes(reportType);

    // Optimistic update
    if (isFavorite) {
      setFavorites((prev) => prev.filter((f) => f !== reportType));
    } else {
      setFavorites((prev) => [...prev, reportType]);
    }

    try {
      const response = await fetch('/api/reports/favorites', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType }),
      });

      if (response.ok) {
        toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
      } else {
        // Revert on error
        if (isFavorite) {
          setFavorites((prev) => [...prev, reportType]);
        } else {
          setFavorites((prev) => prev.filter((f) => f !== reportType));
        }
        toast.error('Failed to update favorite');
      }
    } catch (error) {
      // Revert on error
      if (isFavorite) {
        setFavorites((prev) => [...prev, reportType]);
      } else {
        setFavorites((prev) => prev.filter((f) => f !== reportType));
      }
      toast.error('Failed to update favorite');
    } finally {
      setIsTogglingFavorite(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports</h1>
          <p className="text-slate-500 mt-1">
            Generate financial reports for your properties
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="search"
          placeholder="Search for a report (Ctrl+F)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Favorites Section */}
      {favoriteReports.length > 0 && !searchQuery && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <h2 className="text-sm font-semibold text-slate-900">Favorites</h2>
            </div>
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteReports.map((report) => (
                <ReportCardCompact
                  key={report.type}
                  report={report}
                  onToggleFavorite={handleToggleFavorite}
                  isTogglingFavorite={isTogglingFavorite === report.type}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Categories */}
      {filteredCategories.length > 0 ? (
        <div className="space-y-8">
          {filteredCategories.map((category) => (
            <ReportCategorySection
              key={category.category}
              category={category}
              onToggleFavorite={handleToggleFavorite}
              isTogglingFavorite={isTogglingFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-slate-100 p-4 mb-4">
            <FileBarChart className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No reports found</h3>
          <p className="text-slate-500 max-w-sm">
            No reports match your search. Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
}
