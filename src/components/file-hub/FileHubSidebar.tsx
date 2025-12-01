'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  Building2,
  Home,
  FileText,
  FolderOpen,
  Folder,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building,
  Briefcase,
  Users,
  FileCheck,
  Scale,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  type EntityType,
  type EntityStatus,
  getEntityTypeLabel,
  getEntityStatusColor,
} from '@/lib/schemas/entity';

// Types for the sidebar data structure
export interface FileHubEntity {
  id: string;
  name: string;
  legalName?: string | null;
  entityType: EntityType;
  status: EntityStatus;
  parentEntityId?: string | null;
  isDefault?: boolean;
  documentCount: number;
  propertyCount: number;
  childEntities?: FileHubEntity[];
  properties?: FileHubProperty[];
  complianceStatus?: 'good' | 'warning' | 'overdue';
  annualReportDue?: Date | null;
}

export interface FileHubProperty {
  id: string;
  name: string;
  addressLine1: string;
  city: string;
  state: string;
  documentCount: number;
  unitCount: number;
  leases?: FileHubLease[];
}

export interface FileHubLease {
  id: string;
  tenantName: string;
  unitNumber: string;
  documentCount: number;
  status: 'active' | 'expired' | 'pending';
}

interface FileHubSidebarProps {
  entities: FileHubEntity[];
  selectedId?: string | null;
  selectedType?: 'entity' | 'property' | 'lease' | null;
  onSelect: (id: string, type: 'entity' | 'property' | 'lease') => void;
  onCreateEntity?: () => void;
  onViewCompliance?: () => void;
  className?: string;
}

// Entity type icon mapping
function getEntityIcon(type: EntityType) {
  switch (type) {
    case 'LLC':
    case 'SERIES_LLC':
    case 'SERIES_LLC_CHILD':
      return Building2;
    case 'S_CORP':
    case 'C_CORP':
      return Briefcase;
    case 'TRUST':
    case 'ESTATE':
      return Scale;
    case 'LP':
    case 'LLP':
      return Users;
    default:
      return Building;
  }
}

// Status indicator component
function StatusIndicator({ status }: { status: EntityStatus }) {
  const color = getEntityStatusColor(status);

  return (
    <span
      className={cn(
        'size-2 rounded-full flex-shrink-0',
        color === 'success' && 'bg-success',
        color === 'warning' && 'bg-warning',
        color === 'destructive' && 'bg-destructive',
        color === 'secondary' && 'bg-muted-foreground/50'
      )}
    />
  );
}

// Compliance badge component
function ComplianceBadge({ status }: { status: 'good' | 'warning' | 'overdue' }) {
  if (status === 'good') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-success">
            <CheckCircle2 className="size-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          In good standing
        </TooltipContent>
      </Tooltip>
    );
  }

  if (status === 'warning') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-warning">
            <Clock className="size-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          Annual report due soon
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-destructive">
          <AlertTriangle className="size-3.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        Compliance action required
      </TooltipContent>
    </Tooltip>
  );
}

// Entity type badge
function EntityTypeBadge({ type }: { type: EntityType }) {
  const label = type === 'SERIES_LLC_CHILD' ? 'Series' : getEntityTypeLabel(type);
  const isChild = type === 'SERIES_LLC_CHILD';

  return (
    <span
      className={cn(
        'text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide',
        isChild
          ? 'bg-accent/20 text-accent'
          : 'bg-primary/10 text-primary'
      )}
    >
      {label}
    </span>
  );
}

// Lease node component
function LeaseNode({
  lease,
  isSelected,
  onSelect,
  depth = 3,
}: {
  lease: FileHubLease;
  isSelected: boolean;
  onSelect: () => void;
  depth?: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-2 py-1.5 px-2 rounded-md text-left text-sm transition-all duration-150',
        'hover:bg-accent/10',
        isSelected && 'bg-accent/15 text-accent font-medium'
      )}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
    >
      <FileCheck className="size-3.5 text-muted-foreground flex-shrink-0" />
      <span className="truncate flex-1">
        {lease.unitNumber} - {lease.tenantName}
      </span>
      {lease.documentCount > 0 && (
        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
          {lease.documentCount}
        </Badge>
      )}
    </motion.button>
  );
}

// Property node component
function PropertyNode({
  property,
  isSelected,
  isExpanded,
  onSelect,
  onToggle,
  selectedLeaseId,
  onSelectLease,
  depth = 2,
}: {
  property: FileHubProperty;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggle: () => void;
  selectedLeaseId?: string | null;
  onSelectLease: (id: string) => void;
  depth?: number;
}) {
  const hasLeases = property.leases && property.leases.length > 0;

  return (
    <div className="relative">
      {/* Tree line connector */}
      <div
        className="absolute left-0 top-0 bottom-0 border-l border-border/50"
        style={{ marginLeft: `${(depth - 1) * 16 + 11}px` }}
      />

      <div className="relative">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            'flex items-center gap-1 py-1.5 px-2 rounded-md transition-all duration-150 group',
            'hover:bg-accent/10',
            isSelected && !selectedLeaseId && 'bg-accent/15'
          )}
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          {hasLeases ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="p-0.5 rounded hover:bg-accent/20 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="size-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="size-3.5 text-muted-foreground" />
              )}
            </button>
          ) : (
            <span className="w-4.5" />
          )}

          <button
            onClick={onSelect}
            className={cn(
              'flex items-center gap-2 flex-1 text-left text-sm',
              isSelected && !selectedLeaseId && 'text-accent font-medium'
            )}
          >
            <Home className="size-3.5 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{property.name}</span>
          </button>

          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {property.documentCount > 0 && (
              <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                {property.documentCount}
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Leases */}
        <AnimatePresence>
          {isExpanded && hasLeases && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {property.leases?.map((lease) => (
                <LeaseNode
                  key={lease.id}
                  lease={lease}
                  isSelected={selectedLeaseId === lease.id}
                  onSelect={() => onSelectLease(lease.id)}
                  depth={depth + 1}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Entity node component
function EntityNode({
  entity,
  isSelected,
  isExpanded,
  onSelect,
  onToggle,
  selectedPropertyId,
  selectedLeaseId,
  onSelectProperty,
  onSelectLease,
  expandedProperties,
  onToggleProperty,
  depth = 0,
}: {
  entity: FileHubEntity;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggle: () => void;
  selectedPropertyId?: string | null;
  selectedLeaseId?: string | null;
  onSelectProperty: (id: string) => void;
  onSelectLease: (id: string) => void;
  expandedProperties: Set<string>;
  onToggleProperty: (id: string) => void;
  depth?: number;
}) {
  const Icon = getEntityIcon(entity.entityType);
  const hasChildren =
    (entity.childEntities && entity.childEntities.length > 0) ||
    (entity.properties && entity.properties.length > 0);
  const isSeriesLLC = entity.entityType === 'SERIES_LLC';
  const isChildSeries = entity.entityType === 'SERIES_LLC_CHILD';

  return (
    <div className="relative">
      {/* Tree line connector for children */}
      {depth > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 border-l border-border/50"
          style={{ marginLeft: `${(depth - 1) * 16 + 11}px` }}
        />
      )}

      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'flex items-center gap-1 py-2 px-2 rounded-lg transition-all duration-150 group',
            'hover:bg-accent/10',
            isSelected &&
              !selectedPropertyId &&
              !selectedLeaseId &&
              'bg-accent/15 shadow-sm'
          )}
          style={{ paddingLeft: `${depth * 16 + 4}px` }}
        >
          {/* Expand/collapse */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="p-0.5 rounded hover:bg-accent/20 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="size-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="size-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}

          {/* Entity button */}
          <button
            onClick={onSelect}
            className={cn(
              'flex items-center gap-2.5 flex-1 text-left min-w-0',
              isSelected && !selectedPropertyId && !selectedLeaseId && 'font-medium'
            )}
          >
            {/* Icon with status ring */}
            <div className="relative flex-shrink-0">
              <div
                className={cn(
                  'size-7 rounded-md flex items-center justify-center transition-colors',
                  isSeriesLLC && 'bg-primary/15',
                  isChildSeries && 'bg-accent/15',
                  !isSeriesLLC && !isChildSeries && 'bg-muted'
                )}
              >
                <Icon
                  className={cn(
                    'size-4',
                    isSeriesLLC && 'text-primary',
                    isChildSeries && 'text-accent',
                    !isSeriesLLC && !isChildSeries && 'text-muted-foreground'
                  )}
                />
              </div>
              {entity.complianceStatus && entity.complianceStatus !== 'good' && (
                <span className="absolute -top-0.5 -right-0.5">
                  {entity.complianceStatus === 'warning' ? (
                    <span className="size-2.5 rounded-full bg-warning block ring-2 ring-background" />
                  ) : (
                    <span className="size-2.5 rounded-full bg-destructive block ring-2 ring-background" />
                  )}
                </span>
              )}
            </div>

            {/* Name and meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm">{entity.name}</span>
                {entity.isDefault && (
                  <Badge
                    variant="secondary"
                    className="text-[9px] h-3.5 px-1 font-medium"
                  >
                    DEFAULT
                  </Badge>
                )}
              </div>
              {isSeriesLLC && entity.childEntities && (
                <p className="text-[10px] text-muted-foreground">
                  {entity.childEntities.length} series
                </p>
              )}
            </div>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {entity.complianceStatus && (
              <ComplianceBadge status={entity.complianceStatus} />
            )}
            {entity.documentCount > 0 && (
              <Badge
                variant="outline"
                className="text-[10px] h-4 px-1.5 opacity-60 group-hover:opacity-100 transition-opacity"
              >
                {entity.documentCount}
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <FileText className="size-4 mr-2" />
                  View Documents
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Shield className="size-4 mr-2" />
                  Compliance Status
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Edit Entity</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Children (series and properties) */}
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* Child entities (Series) */}
              {entity.childEntities?.map((child) => (
                <EntityNode
                  key={child.id}
                  entity={child}
                  isSelected={isSelected && selectedPropertyId === null}
                  isExpanded={expandedProperties.has(child.id)}
                  onSelect={() => onSelectProperty(child.id)}
                  onToggle={() => onToggleProperty(child.id)}
                  selectedPropertyId={selectedPropertyId}
                  selectedLeaseId={selectedLeaseId}
                  onSelectProperty={onSelectProperty}
                  onSelectLease={onSelectLease}
                  expandedProperties={expandedProperties}
                  onToggleProperty={onToggleProperty}
                  depth={depth + 1}
                />
              ))}

              {/* Properties */}
              {entity.properties?.map((property) => (
                <PropertyNode
                  key={property.id}
                  property={property}
                  isSelected={selectedPropertyId === property.id}
                  isExpanded={expandedProperties.has(property.id)}
                  onSelect={() => onSelectProperty(property.id)}
                  onToggle={() => onToggleProperty(property.id)}
                  selectedLeaseId={selectedLeaseId}
                  onSelectLease={onSelectLease}
                  depth={depth + 1}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Main sidebar component
export function FileHubSidebar({
  entities,
  selectedId,
  selectedType,
  onSelect,
  onCreateEntity,
  onViewCompliance,
  className,
}: FileHubSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(
    new Set(entities.filter((e) => e.isDefault).map((e) => e.id))
  );
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(
    new Set()
  );

  // Filter entities based on search
  const filteredEntities = useMemo(() => {
    if (!searchQuery.trim()) return entities;

    const query = searchQuery.toLowerCase();
    return entities.filter((entity) => {
      const matchesEntity =
        entity.name.toLowerCase().includes(query) ||
        entity.legalName?.toLowerCase().includes(query);

      const matchesProperty = entity.properties?.some(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.addressLine1.toLowerCase().includes(query)
      );

      const matchesLease = entity.properties?.some((p) =>
        p.leases?.some((l) => l.tenantName.toLowerCase().includes(query))
      );

      return matchesEntity || matchesProperty || matchesLease;
    });
  }, [entities, searchQuery]);

  const toggleEntity = (id: string) => {
    setExpandedEntities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleProperty = (id: string) => {
    setExpandedProperties((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Calculate compliance stats
  const complianceStats = useMemo(() => {
    let good = 0;
    let warning = 0;
    let overdue = 0;

    entities.forEach((entity) => {
      if (entity.complianceStatus === 'good') good++;
      else if (entity.complianceStatus === 'warning') warning++;
      else if (entity.complianceStatus === 'overdue') overdue++;

      entity.childEntities?.forEach((child) => {
        if (child.complianceStatus === 'good') good++;
        else if (child.complianceStatus === 'warning') warning++;
        else if (child.complianceStatus === 'overdue') overdue++;
      });
    });

    return { good, warning, overdue };
  }, [entities]);

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'flex flex-col h-full bg-card border-r border-border',
          className
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm tracking-tight">File Hub</h2>
            <div className="flex items-center gap-1">
              {onViewCompliance && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onViewCompliance}
                      className="h-7 px-2"
                    >
                      <Shield className="size-4" />
                      {(complianceStats.warning > 0 ||
                        complianceStats.overdue > 0) && (
                        <span className="ml-1 text-xs">
                          {complianceStats.warning + complianceStats.overdue}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Compliance</TooltipContent>
                </Tooltip>
              )}
              {onCreateEntity && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onCreateEntity}
                      className="h-7 px-2"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add Entity</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search entities, properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>

        {/* Entity tree */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {filteredEntities.length === 0 ? (
              <div className="py-8 text-center">
                <FolderOpen className="size-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'No results found' : 'No entities yet'}
                </p>
                {onCreateEntity && !searchQuery && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={onCreateEntity}
                    className="mt-1"
                  >
                    Create your first entity
                  </Button>
                )}
              </div>
            ) : (
              filteredEntities.map((entity) => (
                <EntityNode
                  key={entity.id}
                  entity={entity}
                  isSelected={selectedId === entity.id && selectedType === 'entity'}
                  isExpanded={expandedEntities.has(entity.id)}
                  onSelect={() => onSelect(entity.id, 'entity')}
                  onToggle={() => toggleEntity(entity.id)}
                  selectedPropertyId={
                    selectedType === 'property' ? selectedId : null
                  }
                  selectedLeaseId={selectedType === 'lease' ? selectedId : null}
                  onSelectProperty={(id) => onSelect(id, 'property')}
                  onSelectLease={(id) => onSelect(id, 'lease')}
                  expandedProperties={expandedProperties}
                  onToggleProperty={toggleProperty}
                />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer stats */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{entities.length} entities</span>
            <div className="flex items-center gap-3">
              {complianceStats.good > 0 && (
                <span className="flex items-center gap-1 text-success">
                  <CheckCircle2 className="size-3" />
                  {complianceStats.good}
                </span>
              )}
              {complianceStats.warning > 0 && (
                <span className="flex items-center gap-1 text-warning">
                  <Clock className="size-3" />
                  {complianceStats.warning}
                </span>
              )}
              {complianceStats.overdue > 0 && (
                <span className="flex items-center gap-1 text-destructive">
                  <AlertTriangle className="size-3" />
                  {complianceStats.overdue}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
