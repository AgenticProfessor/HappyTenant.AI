'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Search,
  MoreVertical,
  FileText,
  Calendar,
  Building2,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Copy,
  Edit,
  Trash2,
  Eye,
  Download,
  Send,
  RefreshCw,
  PenTool,
  DollarSign,
  Users,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

type LeaseStatus = 'draft' | 'active' | 'expiring' | 'expired' | 'terminated';
type TemplateType = 'residential' | 'commercial' | 'month-to-month' | 'short-term';

interface LeaseTemplate {
  id: string;
  name: string;
  type: TemplateType;
  description: string;
  state: string;
  lastUpdated: string;
  isDefault: boolean;
  sections: string[];
}

interface ActiveLease {
  id: string;
  property: string;
  unit: string;
  tenants: string[];
  startDate: string;
  endDate: string;
  rent: number;
  status: LeaseStatus;
  depositAmount: number;
  signedDate: string;
  templateUsed: string;
}

const mockTemplates: LeaseTemplate[] = [
  {
    id: '1',
    name: 'Standard Residential Lease',
    type: 'residential',
    description: 'Standard 12-month residential lease agreement with all required disclosures',
    state: 'California',
    lastUpdated: '2024-01-15',
    isDefault: true,
    sections: ['Parties', 'Property', 'Term', 'Rent', 'Security Deposit', 'Utilities', 'Maintenance', 'Rules', 'Disclosures'],
  },
  {
    id: '2',
    name: 'Month-to-Month Agreement',
    type: 'month-to-month',
    description: 'Flexible month-to-month rental agreement with 30-day notice requirement',
    state: 'California',
    lastUpdated: '2024-01-10',
    isDefault: false,
    sections: ['Parties', 'Property', 'Term', 'Rent', 'Notice Requirements', 'Termination'],
  },
  {
    id: '3',
    name: 'Short-Term Rental Agreement',
    type: 'short-term',
    description: 'Agreement for furnished short-term rentals under 30 days',
    state: 'California',
    lastUpdated: '2024-01-08',
    isDefault: false,
    sections: ['Parties', 'Property', 'Duration', 'Payment', 'House Rules', 'Cleaning'],
  },
  {
    id: '4',
    name: 'Commercial Lease',
    type: 'commercial',
    description: 'Standard commercial property lease with NNN options',
    state: 'California',
    lastUpdated: '2023-12-20',
    isDefault: false,
    sections: ['Parties', 'Premises', 'Term', 'Base Rent', 'Operating Expenses', 'Use', 'Improvements'],
  },
];

const mockActiveLeases: ActiveLease[] = [
  {
    id: '1',
    property: '123 Oak Street',
    unit: 'Unit 2A',
    tenants: ['Sarah Johnson'],
    startDate: '2023-06-01',
    endDate: '2024-05-31',
    rent: 1800,
    status: 'expiring',
    depositAmount: 3600,
    signedDate: '2023-05-20',
    templateUsed: 'Standard Residential Lease',
  },
  {
    id: '2',
    property: '456 Maple Ave',
    unit: 'Unit 3B',
    tenants: ['Michael Chen', 'Lisa Chen'],
    startDate: '2023-09-01',
    endDate: '2024-08-31',
    rent: 2200,
    status: 'active',
    depositAmount: 4400,
    signedDate: '2023-08-25',
    templateUsed: 'Standard Residential Lease',
  },
  {
    id: '3',
    property: '789 Pine Blvd',
    unit: 'Unit 1C',
    tenants: ['Emily Rodriguez'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    rent: 1650,
    status: 'active',
    depositAmount: 3300,
    signedDate: '2023-12-20',
    templateUsed: 'Standard Residential Lease',
  },
  {
    id: '4',
    property: '321 Elm Court',
    unit: 'Unit 4D',
    tenants: ['David Thompson'],
    startDate: '2022-03-01',
    endDate: '2023-02-28',
    rent: 1400,
    status: 'expired',
    depositAmount: 2800,
    signedDate: '2022-02-15',
    templateUsed: 'Standard Residential Lease',
  },
  {
    id: '5',
    property: '555 Cedar Lane',
    unit: 'Unit 2B',
    tenants: ['Amanda Lee'],
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    rent: 1900,
    status: 'draft',
    depositAmount: 3800,
    signedDate: '',
    templateUsed: 'Standard Residential Lease',
  },
];

const statusConfig: Record<LeaseStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: FileText },
  active: { label: 'Active', color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle2 },
  expiring: { label: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: AlertCircle },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
  terminated: { label: 'Terminated', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: XCircle },
};

const templateTypeConfig: Record<TemplateType, { label: string; color: string }> = {
  residential: { label: 'Residential', color: 'bg-blue-100 text-blue-700' },
  commercial: { label: 'Commercial', color: 'bg-purple-100 text-purple-700' },
  'month-to-month': { label: 'Month-to-Month', color: 'bg-orange-100 text-orange-700' },
  'short-term': { label: 'Short-Term', color: 'bg-teal-100 text-teal-700' },
};

export default function LeaseProfilesPage() {
  const [templates, setTemplates] = useState<LeaseTemplate[]>(mockTemplates);
  const [activeLeases, setActiveLeases] = useState<ActiveLease[]>(mockActiveLeases);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [isCreateLeaseOpen, setIsCreateLeaseOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<LeaseTemplate | null>(null);
  const [selectedLease, setSelectedLease] = useState<ActiveLease | null>(null);

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLeases = activeLeases.filter((lease) =>
    lease.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lease.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lease.tenants.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDuplicateTemplate = (template: LeaseTemplate) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      isDefault: false,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setTemplates([newTemplate, ...templates]);
    toast.success('Template duplicated');
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter((t) => t.id !== templateId));
    toast.success('Template deleted');
  };

  const handleSendForSignature = (lease: ActiveLease) => {
    toast.success('Lease sent for e-signature');
  };

  const handleRenewLease = (lease: ActiveLease) => {
    toast.success('Lease renewal initiated');
  };

  const getExpiringCount = () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return activeLeases.filter((lease) => {
      const endDate = new Date(lease.endDate);
      return endDate <= thirtyDaysFromNow && lease.status === 'active';
    }).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lease Profiles</h1>
          <p className="text-muted-foreground">
            Manage lease templates and active lease agreements
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Lease Template</DialogTitle>
                <DialogDescription>
                  Create a new lease template for your properties
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input placeholder="e.g., Standard Residential Lease" />
                </div>
                <div className="space-y-2">
                  <Label>Template Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="month-to-month">Month-to-Month</SelectItem>
                      <SelectItem value="short-term">Short-Term</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Brief description of this template..." rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateTemplateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setIsCreateTemplateOpen(false);
                  toast.success('Template created');
                }}>
                  Create Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateLeaseOpen} onOpenChange={setIsCreateLeaseOpen}>
            <DialogTrigger asChild>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Create Lease
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Lease</DialogTitle>
                <DialogDescription>
                  Generate a new lease agreement for your tenant
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Property</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="123-oak">123 Oak Street</SelectItem>
                      <SelectItem value="456-maple">456 Maple Ave</SelectItem>
                      <SelectItem value="789-pine">789 Pine Blvd</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1a">Unit 1A</SelectItem>
                      <SelectItem value="1b">Unit 1B</SelectItem>
                      <SelectItem value="2a">Unit 2A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tenant</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sarah">Sarah Johnson</SelectItem>
                      <SelectItem value="michael">Michael Chen</SelectItem>
                      <SelectItem value="emily">Emily Rodriguez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lease Template</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Rent</Label>
                  <Input type="number" placeholder="1800" />
                </div>
                <div className="space-y-2">
                  <Label>Security Deposit</Label>
                  <Input type="number" placeholder="3600" />
                </div>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-medium">AI-Powered Lease Generation</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Our AI will automatically populate state-specific disclosures and ensure compliance with local laws.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateLeaseOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setIsCreateLeaseOpen(false);
                  toast.success('Lease created successfully');
                }}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Lease
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Leases</p>
                <p className="text-2xl font-bold">{activeLeases.filter((l) => l.status === 'active').length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold">{getExpiringCount()}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Draft Leases</p>
                <p className="text-2xl font-bold">{activeLeases.filter((l) => l.status === 'draft').length}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Templates</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <Copy className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leases">Active Leases</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="leases" className="space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {(Object.keys(statusConfig) as LeaseStatus[]).map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusConfig[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Leases Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property / Unit</TableHead>
                  <TableHead>Tenants</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeases.map((lease) => {
                  const StatusIcon = statusConfig[lease.status].icon;
                  return (
                    <TableRow key={lease.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{lease.property}</p>
                            <p className="text-sm text-muted-foreground">{lease.unit}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{lease.tenants.join(', ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(lease.startDate).toLocaleDateString()}</p>
                          <p className="text-muted-foreground">to {new Date(lease.endDate).toLocaleDateString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{lease.rent.toLocaleString()}</span>
                          <span className="text-muted-foreground">/mo</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig[lease.status].color} border`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[lease.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Lease
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            {lease.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handleSendForSignature(lease)}>
                                <Send className="h-4 w-4 mr-2" />
                                Send for Signature
                              </DropdownMenuItem>
                            )}
                            {(lease.status === 'active' || lease.status === 'expiring') && (
                              <DropdownMenuItem onClick={() => handleRenewLease(lease)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Renew Lease
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        {template.isDefault && (
                          <Badge variant="outline" className="mt-1 text-xs">Default</Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Template
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {!template.isDefault && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className={templateTypeConfig[template.type].color}>
                        {templateTypeConfig[template.type].label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{template.state}</span>
                    </div>
                    <CardDescription className="text-sm line-clamp-2">
                      {template.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-1">
                      {template.sections.slice(0, 4).map((section) => (
                        <Badge key={section} variant="outline" className="text-xs">
                          {section}
                        </Badge>
                      ))}
                      {template.sections.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.sections.length - 4} more
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
                      <Clock className="h-3 w-3" />
                      <span>Updated {new Date(template.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
