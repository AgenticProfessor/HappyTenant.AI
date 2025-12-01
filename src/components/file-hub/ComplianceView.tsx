'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Building2,
  FileText,
  ExternalLink,
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getEntityTypeLabel } from '@/lib/schemas/entity';
import type { FileHubEntity } from './FileHubSidebar';

interface ComplianceViewProps {
  entities: FileHubEntity[];
  onSelectEntity?: (entityId: string) => void;
  onUploadDocument?: (entityId: string, documentType: string) => void;
}

interface ComplianceItem {
  id: string;
  entityId: string;
  entityName: string;
  entityType: string;
  type: 'annual_report' | 'good_standing' | 'registered_agent' | 'ein_letter';
  status: 'complete' | 'due_soon' | 'overdue' | 'not_required';
  dueDate?: Date;
  completedDate?: Date;
  documentId?: string;
}

// Mock compliance data
const mockComplianceItems: ComplianceItem[] = [
  {
    id: '1',
    entityId: 'ent-1',
    entityName: 'Sunset Holdings LLC',
    entityType: 'SERIES_LLC',
    type: 'annual_report',
    status: 'complete',
    completedDate: new Date('2024-03-15'),
    dueDate: new Date('2025-03-15'),
    documentId: 'doc-1',
  },
  {
    id: '2',
    entityId: 'ent-1',
    entityName: 'Sunset Holdings LLC',
    entityType: 'SERIES_LLC',
    type: 'good_standing',
    status: 'complete',
    completedDate: new Date('2024-06-01'),
    documentId: 'doc-2',
  },
  {
    id: '3',
    entityId: 'ent-1a',
    entityName: 'Sunset Series A',
    entityType: 'SERIES_LLC_CHILD',
    type: 'annual_report',
    status: 'complete',
    dueDate: new Date('2025-03-15'),
    documentId: 'doc-3',
  },
  {
    id: '4',
    entityId: 'ent-1b',
    entityName: 'Sunset Series B',
    entityType: 'SERIES_LLC_CHILD',
    type: 'annual_report',
    status: 'due_soon',
    dueDate: new Date('2024-12-15'),
  },
  {
    id: '5',
    entityId: 'ent-1b',
    entityName: 'Sunset Series B',
    entityType: 'SERIES_LLC_CHILD',
    type: 'registered_agent',
    status: 'overdue',
    dueDate: new Date('2024-11-01'),
  },
  {
    id: '6',
    entityId: 'ent-2',
    entityName: 'Personal Holdings',
    entityType: 'INDIVIDUAL',
    type: 'annual_report',
    status: 'not_required',
  },
];

function getComplianceTypeLabel(type: ComplianceItem['type']): string {
  const labels: Record<ComplianceItem['type'], string> = {
    annual_report: 'Annual Report',
    good_standing: 'Good Standing Certificate',
    registered_agent: 'Registered Agent',
    ein_letter: 'EIN Letter',
  };
  return labels[type];
}

function getStatusConfig(status: ComplianceItem['status']) {
  switch (status) {
    case 'complete':
      return {
        label: 'Complete',
        color: 'text-success',
        bgColor: 'bg-success/10',
        borderColor: 'border-success/20',
        icon: CheckCircle2,
      };
    case 'due_soon':
      return {
        label: 'Due Soon',
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        borderColor: 'border-warning/20',
        icon: Clock,
      };
    case 'overdue':
      return {
        label: 'Overdue',
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive/20',
        icon: AlertTriangle,
      };
    case 'not_required':
      return {
        label: 'Not Required',
        color: 'text-muted-foreground',
        bgColor: 'bg-muted',
        borderColor: 'border-muted',
        icon: Shield,
      };
  }
}

function ComplianceCard({
  item,
  onSelect,
  onUpload,
}: {
  item: ComplianceItem;
  onSelect?: () => void;
  onUpload?: () => void;
}) {
  const config = getStatusConfig(item.status);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card
        className={cn(
          'transition-all duration-200 hover:shadow-md cursor-pointer',
          item.status === 'overdue' && 'border-destructive/30'
        )}
        onClick={onSelect}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'p-2.5 rounded-xl',
                config.bgColor
              )}
            >
              <Icon className={cn('size-5', config.color)} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{getComplianceTypeLabel(item.type)}</h3>
                <Badge
                  variant="outline"
                  className={cn(config.borderColor, config.color)}
                >
                  {config.label}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="size-3.5" />
                <span>{item.entityName}</span>
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  {getEntityTypeLabel(item.entityType as any)}
                </span>
              </div>

              {item.dueDate && item.status !== 'not_required' && (
                <div className="flex items-center gap-1.5 mt-2 text-sm">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  <span className={item.status === 'overdue' ? 'text-destructive' : ''}>
                    {item.status === 'complete' ? 'Next due: ' : 'Due: '}
                    {item.dueDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {item.documentId && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <FileText className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Document</TooltipContent>
                </Tooltip>
              )}
              {item.status !== 'complete' && item.status !== 'not_required' && (
                <Button
                  size="sm"
                  variant={item.status === 'overdue' ? 'destructive' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpload?.();
                  }}
                >
                  Upload
                </Button>
              )}
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ComplianceSummaryCard({
  title,
  count,
  total,
  icon: Icon,
  color,
  bgColor,
}: {
  title: string;
  count: number;
  total: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={cn('p-2 rounded-lg', bgColor)}>
            <Icon className={cn('size-5', color)} />
          </div>
          <span className={cn('text-2xl font-bold', color)}>{count}</span>
        </div>
        <p className="text-sm font-medium mb-2">{title}</p>
        <Progress value={percentage} className="h-1.5" />
        <p className="text-xs text-muted-foreground mt-1">
          {percentage}% of {total} items
        </p>
      </CardContent>
    </Card>
  );
}

export function ComplianceView({
  entities,
  onSelectEntity,
  onUploadDocument,
}: ComplianceViewProps) {
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');

  // Calculate compliance stats
  const stats = useMemo(() => {
    const items = mockComplianceItems;
    return {
      total: items.length,
      complete: items.filter((i) => i.status === 'complete').length,
      dueSoon: items.filter((i) => i.status === 'due_soon').length,
      overdue: items.filter((i) => i.status === 'overdue').length,
      notRequired: items.filter((i) => i.status === 'not_required').length,
    };
  }, []);

  // Filter compliance items
  const filteredItems = useMemo(() => {
    let items = [...mockComplianceItems];

    if (statusFilter !== 'all') {
      items = items.filter((i) => i.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      items = items.filter((i) => i.type === typeFilter);
    }

    // Sort by urgency: overdue first, then due_soon, then others
    items.sort((a, b) => {
      const order = { overdue: 0, due_soon: 1, complete: 2, not_required: 3 };
      return order[a.status] - order[b.status];
    });

    return items;
  }, [statusFilter, typeFilter]);

  // Calculate overall compliance score
  const complianceScore = useMemo(() => {
    const required = stats.total - stats.notRequired;
    if (required === 0) return 100;
    return Math.round((stats.complete / required) * 100);
  }, [stats]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Shield className="size-6 text-primary" />
              </div>
              Compliance Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Track compliance requirements across all your entities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="size-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline">
              <RefreshCw className="size-4 mr-2" />
              Sync
            </Button>
          </div>
        </div>

        {/* Compliance Score */}
        <Card className="overflow-hidden">
          <div className="relative">
            <div
              className={cn(
                'absolute inset-0',
                complianceScore >= 80
                  ? 'bg-gradient-to-r from-success/20 to-success/5'
                  : complianceScore >= 50
                  ? 'bg-gradient-to-r from-warning/20 to-warning/5'
                  : 'bg-gradient-to-r from-destructive/20 to-destructive/5'
              )}
            />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Overall Compliance Score
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        'text-4xl font-bold',
                        complianceScore >= 80
                          ? 'text-success'
                          : complianceScore >= 50
                          ? 'text-warning'
                          : 'text-destructive'
                      )}
                    >
                      {complianceScore}%
                    </span>
                    <span className="text-muted-foreground">
                      ({stats.complete} of {stats.total - stats.notRequired} complete)
                    </span>
                  </div>
                </div>
                {stats.overdue > 0 && (
                  <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
                    <AlertTriangle className="size-3" />
                    {stats.overdue} overdue
                  </Badge>
                )}
              </div>
              <Progress
                value={complianceScore}
                className={cn(
                  'h-2 mt-4',
                  complianceScore >= 80
                    ? '[&>div]:bg-success'
                    : complianceScore >= 50
                    ? '[&>div]:bg-warning'
                    : '[&>div]:bg-destructive'
                )}
              />
            </CardContent>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ComplianceSummaryCard
            title="Complete"
            count={stats.complete}
            total={stats.total}
            icon={CheckCircle2}
            color="text-success"
            bgColor="bg-success/10"
          />
          <ComplianceSummaryCard
            title="Due Soon"
            count={stats.dueSoon}
            total={stats.total}
            icon={Clock}
            color="text-warning"
            bgColor="bg-warning/10"
          />
          <ComplianceSummaryCard
            title="Overdue"
            count={stats.overdue}
            total={stats.total}
            icon={AlertTriangle}
            color="text-destructive"
            bgColor="bg-destructive/10"
          />
          <ComplianceSummaryCard
            title="Not Required"
            count={stats.notRequired}
            total={stats.total}
            icon={Shield}
            color="text-muted-foreground"
            bgColor="bg-muted"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="size-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="due_soon">Due Soon</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="not_required">Not Required</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="annual_report">Annual Report</SelectItem>
              <SelectItem value="good_standing">Good Standing</SelectItem>
              <SelectItem value="registered_agent">Registered Agent</SelectItem>
              <SelectItem value="ein_letter">EIN Letter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Compliance Items List */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="size-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">
                  No compliance items match your filters
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <ComplianceCard
                  key={item.id}
                  item={item}
                  onSelect={() => onSelectEntity?.(item.entityId)}
                  onUpload={() => onUploadDocument?.(item.entityId, item.type)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
