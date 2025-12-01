'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  PenTool,
  ClipboardCheck,
  FileStack,
  LayoutTemplate,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Eye,
  Download,
  Trash2,
  Sparkles,
  Building2,
  Home,
  Upload,
  FolderOpen,
  Shield,
  FileCheck,
  ChevronRight,
  X,
  Grid3X3,
  List,
  SortAsc,
  Calendar,
  AlertTriangle,
  ExternalLink,
  Copy,
  Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { ESignWizard } from '@/components/esign';
import { FileHubSidebar, type FileHubEntity } from '@/components/file-hub';
import { cn } from '@/lib/utils';
import { getEntityTypeLabel } from '@/lib/schemas/entity';

// Mock data for entities with hierarchy
const mockEntities: FileHubEntity[] = [
  {
    id: 'ent-1',
    name: 'Sunset Holdings LLC',
    legalName: 'Sunset Holdings Limited Liability Company',
    entityType: 'SERIES_LLC',
    status: 'ACTIVE',
    isDefault: true,
    documentCount: 12,
    propertyCount: 2,
    complianceStatus: 'good',
    childEntities: [
      {
        id: 'ent-1a',
        name: 'Sunset Series A',
        entityType: 'SERIES_LLC_CHILD',
        status: 'ACTIVE',
        parentEntityId: 'ent-1',
        documentCount: 5,
        propertyCount: 1,
        complianceStatus: 'good',
        properties: [
          {
            id: 'prop-1',
            name: 'Sunset Apartments',
            addressLine1: '123 Sunset Blvd',
            city: 'Los Angeles',
            state: 'CA',
            documentCount: 8,
            unitCount: 12,
            leases: [
              { id: 'lease-1', tenantName: 'Sarah Johnson', unitNumber: '3B', documentCount: 4, status: 'active' },
              { id: 'lease-2', tenantName: 'Michael Chen', unitNumber: '5A', documentCount: 3, status: 'active' },
            ],
          },
        ],
      },
      {
        id: 'ent-1b',
        name: 'Sunset Series B',
        entityType: 'SERIES_LLC_CHILD',
        status: 'ACTIVE',
        parentEntityId: 'ent-1',
        documentCount: 3,
        propertyCount: 1,
        complianceStatus: 'warning',
        annualReportDue: new Date('2024-12-15'),
        properties: [
          {
            id: 'prop-2',
            name: 'Oak Grove Homes',
            addressLine1: '456 Oak Street',
            city: 'Pasadena',
            state: 'CA',
            documentCount: 6,
            unitCount: 4,
            leases: [
              { id: 'lease-3', tenantName: 'Emily Rodriguez', unitNumber: '1', documentCount: 2, status: 'active' },
            ],
          },
        ],
      },
    ],
    properties: [],
  },
  {
    id: 'ent-2',
    name: 'Personal Holdings',
    entityType: 'INDIVIDUAL',
    status: 'ACTIVE',
    documentCount: 4,
    propertyCount: 1,
    complianceStatus: 'good',
    properties: [
      {
        id: 'prop-3',
        name: 'Beach House',
        addressLine1: '789 Ocean Drive',
        city: 'Santa Monica',
        state: 'CA',
        documentCount: 3,
        unitCount: 1,
        leases: [],
      },
    ],
  },
];

// Mock documents
const mockDocuments = [
  {
    id: '1',
    name: 'Operating Agreement',
    type: 'OPERATING_AGREEMENT',
    status: 'FINAL',
    entityId: 'ent-1',
    uploadedAt: '2024-01-15',
    fileSize: '2.4 MB',
    fileType: 'PDF',
  },
  {
    id: '2',
    name: 'Certificate of Formation',
    type: 'CERTIFICATE_OF_FORMATION',
    status: 'FINAL',
    entityId: 'ent-1',
    uploadedAt: '2024-01-10',
    fileSize: '156 KB',
    fileType: 'PDF',
  },
  {
    id: '3',
    name: 'EIN Letter',
    type: 'EIN_LETTER',
    status: 'FINAL',
    entityId: 'ent-1',
    uploadedAt: '2024-01-20',
    fileSize: '89 KB',
    fileType: 'PDF',
  },
  {
    id: '4',
    name: 'Lease Agreement - Unit 3B',
    type: 'LEASE',
    status: 'SIGNED',
    propertyId: 'prop-1',
    leaseId: 'lease-1',
    uploadedAt: '2024-11-15',
    fileSize: '1.8 MB',
    fileType: 'PDF',
    signers: [
      { name: 'Sarah Johnson', signed: true, color: '#3B82F6' },
      { name: 'John Smith', signed: true, color: '#F97316' },
    ],
  },
  {
    id: '5',
    name: 'Pet Addendum - Unit 12',
    type: 'ADDENDUM',
    status: 'PENDING_SIGNATURES',
    propertyId: 'prop-2',
    uploadedAt: '2024-11-20',
    fileSize: '540 KB',
    fileType: 'PDF',
    signers: [
      { name: 'Emily Rodriguez', signed: true, color: '#10B981' },
      { name: 'John Smith', signed: false, color: '#F97316' },
    ],
  },
  {
    id: '6',
    name: 'Deed - Sunset Apartments',
    type: 'DEED',
    status: 'FINAL',
    propertyId: 'prop-1',
    uploadedAt: '2024-03-01',
    fileSize: '3.2 MB',
    fileType: 'PDF',
  },
  {
    id: '7',
    name: 'Annual Report 2024',
    type: 'ANNUAL_REPORT',
    status: 'DRAFT',
    entityId: 'ent-1b',
    uploadedAt: '2024-11-25',
    fileSize: '890 KB',
    fileType: 'PDF',
  },
];

// Document type categories
const documentCategories = {
  entity: ['OPERATING_AGREEMENT', 'CERTIFICATE_OF_FORMATION', 'EIN_LETTER', 'ANNUAL_REPORT', 'RESOLUTION', 'AMENDMENT', 'BYLAWS'],
  property: ['DEED', 'TITLE_INSURANCE', 'SURVEY', 'APPRAISAL', 'PROPERTY_TAX_RECORD', 'HOA_DOCUMENTS'],
  lease: ['LEASE', 'ADDENDUM', 'MOVE_IN_CHECKLIST', 'MOVE_OUT_CHECKLIST', 'NOTICE'],
  compliance: ['LEAD_PAINT_DISCLOSURE', 'FAIR_HOUSING_NOTICE', 'MOLD_DISCLOSURE', 'BED_BUG_POLICY'],
};

function getDocumentTypeIcon(type: string) {
  if (documentCategories.entity.includes(type)) return Building2;
  if (documentCategories.property.includes(type)) return Home;
  if (documentCategories.lease.includes(type)) return FileCheck;
  if (documentCategories.compliance.includes(type)) return Shield;
  return FileText;
}

function getDocumentTypeLabel(type: string) {
  return type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'SIGNED':
    case 'FINAL':
      return (
        <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">
          <CheckCircle2 className="size-3 mr-1" />
          {status === 'SIGNED' ? 'Signed' : 'Final'}
        </Badge>
      );
    case 'PENDING_SIGNATURES':
      return (
        <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20">
          <Clock className="size-3 mr-1" />
          Awaiting Signatures
        </Badge>
      );
    case 'DRAFT':
      return (
        <Badge variant="secondary">
          <FileText className="size-3 mr-1" />
          Draft
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// Breadcrumb component
function Breadcrumb({
  items,
  onNavigate,
}: {
  items: { id: string; label: string; type: 'entity' | 'property' | 'lease' }[];
  onNavigate: (id: string, type: 'entity' | 'property' | 'lease') => void;
}) {
  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => onNavigate('', 'entity')}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        All Files
      </button>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <ChevronRight className="size-4 text-muted-foreground" />
          <button
            onClick={() => onNavigate(item.id, item.type)}
            className={cn(
              'transition-colors',
              index === items.length - 1
                ? 'font-medium text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

// Document card component
function DocumentCard({
  document,
  viewMode,
}: {
  document: (typeof mockDocuments)[0];
  viewMode: 'grid' | 'list';
}) {
  const Icon = getDocumentTypeIcon(document.type);

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="group"
      >
        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/5 transition-colors">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{document.name}</span>
              {getStatusBadge(document.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              {getDocumentTypeLabel(document.type)} • {document.fileSize}
            </p>
          </div>
          {document.signers && document.signers.length > 0 && (
            <div className="flex -space-x-2">
              {document.signers.map((signer, i) => (
                <Avatar
                  key={i}
                  className={cn(
                    'size-7 border-2 border-background',
                    !signer.signed && 'opacity-50'
                  )}
                >
                  <AvatarFallback
                    style={{ backgroundColor: signer.color }}
                    className="text-white text-[10px]"
                  >
                    {signer.name.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(document.uploadedAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <Eye className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <Download className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Copy className="size-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="size-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="size-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer">
        <div className="aspect-[4/3] bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center relative">
          <Icon className="size-12 text-muted-foreground/50" />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="size-7">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="size-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="size-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="size-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Badge className="absolute bottom-2 left-2" variant="secondary">
            {document.fileType}
          </Badge>
        </div>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm line-clamp-2">{document.name}</h3>
          </div>
          <div className="flex items-center justify-between">
            {getStatusBadge(document.status)}
            <span className="text-xs text-muted-foreground">{document.fileSize}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Main content area component
function FileHubContent({
  selectedId,
  selectedType,
  entities,
  onNavigate,
  onUpload,
  onNewESign,
}: {
  selectedId: string | null;
  selectedType: 'entity' | 'property' | 'lease' | null;
  entities: FileHubEntity[];
  onNavigate: (id: string, type: 'entity' | 'property' | 'lease') => void;
  onUpload: () => void;
  onNewESign: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date');
  const [filterType, setFilterType] = useState<string>('all');

  // Build breadcrumb path
  const breadcrumbItems = useMemo(() => {
    const items: { id: string; label: string; type: 'entity' | 'property' | 'lease' }[] = [];

    if (!selectedId) return items;

    // Find the selected item in the hierarchy
    const findInEntities = (
      entities: FileHubEntity[],
      targetId: string,
      path: typeof items = []
    ): typeof items | null => {
      for (const entity of entities) {
        if (entity.id === targetId) {
          return [...path, { id: entity.id, label: entity.name, type: 'entity' as const }];
        }

        // Check properties
        for (const prop of entity.properties || []) {
          if (prop.id === targetId) {
            return [
              ...path,
              { id: entity.id, label: entity.name, type: 'entity' as const },
              { id: prop.id, label: prop.name, type: 'property' as const },
            ];
          }

          // Check leases
          for (const lease of prop.leases || []) {
            if (lease.id === targetId) {
              return [
                ...path,
                { id: entity.id, label: entity.name, type: 'entity' as const },
                { id: prop.id, label: prop.name, type: 'property' as const },
                { id: lease.id, label: `${lease.unitNumber} - ${lease.tenantName}`, type: 'lease' as const },
              ];
            }
          }
        }

        // Check child entities
        if (entity.childEntities) {
          const result = findInEntities(entity.childEntities, targetId, [
            ...path,
            { id: entity.id, label: entity.name, type: 'entity' as const },
          ]);
          if (result) return result;
        }
      }
      return null;
    };

    return findInEntities(entities, selectedId) || [];
  }, [selectedId, entities]);

  // Get the selected item's details
  const selectedItem = useMemo(() => {
    if (!selectedId) return null;

    const findItem = (entities: FileHubEntity[]): any => {
      for (const entity of entities) {
        if (entity.id === selectedId) return { ...entity, itemType: 'entity' };

        for (const prop of entity.properties || []) {
          if (prop.id === selectedId) return { ...prop, itemType: 'property' };
          for (const lease of prop.leases || []) {
            if (lease.id === selectedId) return { ...lease, itemType: 'lease' };
          }
        }

        if (entity.childEntities) {
          const result = findItem(entity.childEntities);
          if (result) return result;
        }
      }
      return null;
    };

    return findItem(entities);
  }, [selectedId, entities]);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let docs = [...mockDocuments];

    // Filter by selection
    if (selectedId && selectedType) {
      docs = docs.filter((doc) => {
        if (selectedType === 'entity') return doc.entityId === selectedId;
        if (selectedType === 'property') return doc.propertyId === selectedId;
        if (selectedType === 'lease') return doc.leaseId === selectedId;
        return true;
      });
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      docs = docs.filter(
        (doc) =>
          doc.name.toLowerCase().includes(query) ||
          doc.type.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      docs = docs.filter((doc) => {
        if (filterType === 'entity') return documentCategories.entity.includes(doc.type);
        if (filterType === 'property') return documentCategories.property.includes(doc.type);
        if (filterType === 'lease') return documentCategories.lease.includes(doc.type);
        if (filterType === 'compliance') return documentCategories.compliance.includes(doc.type);
        return true;
      });
    }

    // Sort
    docs.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return a.type.localeCompare(b.type);
    });

    return docs;
  }, [selectedId, selectedType, searchQuery, filterType, sortBy]);

  // Render header info based on selection
  const renderHeader = () => {
    if (!selectedItem) {
      return (
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">File Hub</h1>
          <p className="text-muted-foreground">
            All documents across your entities and properties
          </p>
        </div>
      );
    }

    if (selectedItem.itemType === 'entity') {
      return (
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Building2 className="size-8 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{selectedItem.name}</h1>
              <Badge variant="outline">{getEntityTypeLabel(selectedItem.entityType)}</Badge>
              {selectedItem.complianceStatus === 'warning' && (
                <Badge className="bg-warning/10 text-warning border-warning/20">
                  <AlertTriangle className="size-3 mr-1" />
                  Compliance Due
                </Badge>
              )}
            </div>
            {selectedItem.legalName && (
              <p className="text-muted-foreground">{selectedItem.legalName}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>{selectedItem.documentCount} documents</span>
              <span>•</span>
              <span>{selectedItem.propertyCount} properties</span>
            </div>
          </div>
        </div>
      );
    }

    if (selectedItem.itemType === 'property') {
      return (
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-accent/10">
            <Home className="size-8 text-accent" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">{selectedItem.name}</h1>
            <p className="text-muted-foreground">
              {selectedItem.addressLine1}, {selectedItem.city}, {selectedItem.state}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>{selectedItem.documentCount} documents</span>
              <span>•</span>
              <span>{selectedItem.unitCount} units</span>
            </div>
          </div>
        </div>
      );
    }

    // Lease
    return (
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-success/10">
          <FileCheck className="size-8 text-success" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Unit {selectedItem.unitNumber} - {selectedItem.tenantName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-success/10 text-success border-success/20">Active Lease</Badge>
            <span className="text-sm text-muted-foreground">
              {selectedItem.documentCount} documents
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex-1 flex flex-col min-h-0 p-6">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb items={breadcrumbItems} onNavigate={onNavigate} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          {renderHeader()}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onUpload}>
              <Upload className="size-4 mr-2" />
              Upload
            </Button>
            <Button onClick={onNewESign}>
              <PenTool className="size-4 mr-2" />
              E-Sign
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <Filter className="size-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="entity">Entity Docs</SelectItem>
              <SelectItem value="property">Property Docs</SelectItem>
              <SelectItem value="lease">Lease Docs</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[130px]">
              <SortAsc className="size-4 mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center border rounded-md">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>List View</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Grid View</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Documents */}
        <ScrollArea className="flex-1">
          {filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="size-16 text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-lg mb-1">No documents found</h3>
              <p className="text-muted-foreground max-w-sm mb-4">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first document to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={onUpload}>
                  <Upload className="size-4 mr-2" />
                  Upload Document
                </Button>
              )}
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-1">
              {filteredDocuments.map((doc) => (
                <DocumentCard key={doc.id} document={doc} viewMode="list" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredDocuments.map((doc) => (
                <DocumentCard key={doc.id} document={doc} viewMode="grid" />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}

export default function FileHubPage() {
  const [isESignWizardOpen, setIsESignWizardOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'entity' | 'property' | 'lease' | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleSelect = (id: string, type: 'entity' | 'property' | 'lease') => {
    setSelectedId(id);
    setSelectedType(type);
  };

  const handleNavigate = (id: string, type: 'entity' | 'property' | 'lease') => {
    if (id === '') {
      setSelectedId(null);
      setSelectedType(null);
    } else {
      setSelectedId(id);
      setSelectedType(type);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {!isSidebarCollapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 overflow-hidden"
          >
            <FileHubSidebar
              entities={mockEntities}
              selectedId={selectedId}
              selectedType={selectedType}
              onSelect={handleSelect}
              onCreateEntity={() => console.log('Create entity')}
              onViewCompliance={() => console.log('View compliance')}
              className="h-full w-80"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <FileHubContent
          selectedId={selectedId}
          selectedType={selectedType}
          entities={mockEntities}
          onNavigate={handleNavigate}
          onUpload={() => console.log('Upload')}
          onNewESign={() => setIsESignWizardOpen(true)}
        />
      </div>

      {/* E-Sign Wizard Dialog - FIXED SIZING */}
      <Dialog open={isESignWizardOpen} onOpenChange={setIsESignWizardOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] h-[800px] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <PenTool className="size-5 text-primary" />
              </div>
              <div>
                <span className="text-lg">Create E-Sign Document</span>
                <p className="text-sm font-normal text-muted-foreground">
                  Upload, add signature fields, and send for signing
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <ESignWizard />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
