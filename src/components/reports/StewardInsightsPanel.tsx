'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import type { ReportData, StewardAnalysis, AnalysisMetric } from '@/lib/reports/types';

interface StewardInsightsPanelProps {
  reportData: ReportData | null;
  isReportLoading?: boolean;
}

export function StewardInsightsPanel({ reportData, isReportLoading }: StewardInsightsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<StewardAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!reportData) return;

    setIsAnalyzing(true);
    setError(null);
    setIsOpen(true);

    try {
      const response = await fetch('/api/steward/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: reportData.type,
          reportData,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError('Could not analyze report. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setAnalysis(null);
    setError(null);
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={handleAnalyze}
        disabled={!reportData || isReportLoading || isAnalyzing}
        className="gap-2"
      >
        {isAnalyzing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 text-indigo-500" />
        )}
        Ask Steward for insights
      </Button>
    );
  }

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 rounded-lg">
              <Sparkles className="h-4 w-4 text-indigo-600" />
            </div>
            <CardTitle className="text-base">Steward AI Insights</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAnalyzing ? (
          <div className="flex items-center justify-center py-8 gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
            <span className="text-sm text-slate-600">Steward is analyzing your numbers...</span>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-slate-600">{error}</p>
            <Button variant="outline" size="sm" onClick={handleAnalyze} className="mt-3">
              Try Again
            </Button>
          </div>
        ) : analysis ? (
          <>
            {/* Summary */}
            <div className="p-4 bg-white rounded-lg border border-slate-200">
              <p className="text-sm text-slate-700 leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Metrics */}
            {analysis.metrics && analysis.metrics.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2">
                {analysis.metrics.map((metric, index) => (
                  <MetricCard key={index} metric={metric} />
                ))}
              </div>
            )}

            {/* Key Findings */}
            {analysis.keyFindings.length > 0 && (
              <InsightSection
                title="Key Findings"
                icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
                items={analysis.keyFindings}
                variant="success"
              />
            )}

            {/* Potential Issues */}
            {analysis.potentialIssues.length > 0 && (
              <InsightSection
                title="Potential Issues"
                icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
                items={analysis.potentialIssues}
                variant="warning"
              />
            )}

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <InsightSection
                title="Suggestions"
                icon={<Lightbulb className="h-4 w-4 text-indigo-600" />}
                items={analysis.suggestions}
                variant="info"
              />
            )}

            {/* Refresh Button */}
            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAnalyze}
                className="text-indigo-600 hover:text-indigo-700"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Refresh Analysis
              </Button>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

// Metric Card Component
function MetricCard({ metric }: { metric: AnalysisMetric }) {
  const getTrendIcon = () => {
    if (metric.trend === 'up') return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (metric.trend === 'down') return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
    return null;
  };

  const getStatusColor = () => {
    if (metric.status === 'good') return 'text-green-600';
    if (metric.status === 'warning') return 'text-amber-600';
    if (metric.status === 'critical') return 'text-red-600';
    return 'text-slate-900';
  };

  return (
    <div className="p-3 bg-white rounded-lg border border-slate-200">
      <p className="text-xs text-slate-500 mb-1">{metric.name}</p>
      <div className="flex items-center justify-between">
        <span className={cn('text-lg font-semibold', getStatusColor())}>
          {metric.value}
        </span>
        {metric.trendValue && (
          <div className="flex items-center gap-1 text-xs">
            {getTrendIcon()}
            <span
              className={cn(
                metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-slate-500'
              )}
            >
              {metric.trendValue}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Insight Section Component
function InsightSection({
  title,
  icon,
  items,
  variant,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  variant: 'success' | 'warning' | 'info';
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const bgColor = {
    success: 'bg-green-50',
    warning: 'bg-amber-50',
    info: 'bg-indigo-50',
  }[variant];

  const borderColor = {
    success: 'border-green-200',
    warning: 'border-amber-200',
    info: 'border-indigo-200',
  }[variant];

  return (
    <div className={cn('rounded-lg border', bgColor, borderColor)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-3 text-left"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-slate-700">{title}</span>
          <Badge variant="secondary" className="text-xs">
            {items.length}
          </Badge>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>
      {isExpanded && (
        <ul className="px-3 pb-3 space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex gap-2 text-sm text-slate-600">
              <span className="text-slate-400 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Compact version for inline display
export function StewardInsightsButton({
  onAnalyze,
  isAnalyzing,
  disabled,
}: {
  onAnalyze: () => void;
  isAnalyzing: boolean;
  disabled: boolean;
}) {
  return (
    <Button
      variant="outline"
      onClick={onAnalyze}
      disabled={disabled || isAnalyzing}
      className="gap-2"
    >
      {isAnalyzing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4 text-indigo-500" />
      )}
      {isAnalyzing ? 'Analyzing...' : 'Ask Steward'}
    </Button>
  );
}
