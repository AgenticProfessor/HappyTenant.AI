'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Plus,
  Search,
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  Building2,
  UserPlus,
  Clock,
  ArrowRight,
  Filter,
  Download,
  Eye,
  Trash2,
  MessageSquare,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';

// Lead status types
type LeadStatus = 'new' | 'contacted' | 'showing' | 'applied' | 'lost';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: string;
  propertyInterest: string;
  moveInDate: string;
  createdAt: string;
  lastContact: string | null;
  notes: string;
  avatar?: string;
}

// Mock data for leads
const mockLeads: Lead[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    status: 'new',
    source: 'Zillow',
    propertyInterest: '123 Oak Street, Unit 2A',
    moveInDate: '2024-02-01',
    createdAt: '2024-01-15',
    lastContact: null,
    notes: 'Looking for a 2BR apartment, has a small dog',
    avatar: '',
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'mchen@email.com',
    phone: '(555) 234-5678',
    status: 'contacted',
    source: 'Website',
    propertyInterest: '456 Maple Ave, Unit 1B',
    moveInDate: '2024-02-15',
    createdAt: '2024-01-14',
    lastContact: '2024-01-16',
    notes: 'Works remotely, needs home office space',
    avatar: '',
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.r@email.com',
    phone: '(555) 345-6789',
    status: 'showing',
    source: 'Apartments.com',
    propertyInterest: '789 Pine Blvd, Unit 3C',
    moveInDate: '2024-03-01',
    createdAt: '2024-01-12',
    lastContact: '2024-01-17',
    notes: 'Relocating for work, budget $1,500-2,000',
    avatar: '',
  },
  {
    id: '4',
    firstName: 'David',
    lastName: 'Thompson',
    email: 'dthompson@email.com',
    phone: '(555) 456-7890',
    status: 'showing',
    source: 'Referral',
    propertyInterest: '123 Oak Street, Unit 4D',
    moveInDate: '2024-02-01',
    createdAt: '2024-01-10',
    lastContact: '2024-01-18',
    notes: 'Current tenant referral, excellent credit',
    avatar: '',
  },
  {
    id: '5',
    firstName: 'Jessica',
    lastName: 'Williams',
    email: 'jwilliams@email.com',
    phone: '(555) 567-8901',
    status: 'applied',
    source: 'Facebook',
    propertyInterest: '456 Maple Ave, Unit 2C',
    moveInDate: '2024-02-15',
    createdAt: '2024-01-08',
    lastContact: '2024-01-19',
    notes: 'Application submitted, pending review',
    avatar: '',
  },
  {
    id: '6',
    firstName: 'Robert',
    lastName: 'Garcia',
    email: 'rgarcia@email.com',
    phone: '(555) 678-9012',
    status: 'lost',
    source: 'Craigslist',
    propertyInterest: '789 Pine Blvd, Unit 1A',
    moveInDate: '2024-01-15',
    createdAt: '2024-01-05',
    lastContact: '2024-01-12',
    notes: 'Found another apartment closer to work',
    avatar: '',
  },
  {
    id: '7',
    firstName: 'Amanda',
    lastName: 'Lee',
    email: 'alee@email.com',
    phone: '(555) 789-0123',
    status: 'new',
    source: 'Zillow',
    propertyInterest: '123 Oak Street, Unit 1A',
    moveInDate: '2024-03-01',
    createdAt: '2024-01-18',
    lastContact: null,
    notes: 'Young professional, first apartment',
    avatar: '',
  },
  {
    id: '8',
    firstName: 'James',
    lastName: 'Brown',
    email: 'jbrown@email.com',
    phone: '(555) 890-1234',
    status: 'contacted',
    source: 'Website',
    propertyInterest: '456 Maple Ave, Unit 3A',
    moveInDate: '2024-02-28',
    createdAt: '2024-01-17',
    lastContact: '2024-01-19',
    notes: 'Couple looking for 2BR, no pets',
    avatar: '',
  },
];

const statusConfig: Record<LeadStatus, { label: string; color: string; bgColor: string }> = {
  new: { label: 'New', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
  contacted: { label: 'Contacted', color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200' },
  showing: { label: 'Showing Scheduled', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
  applied: { label: 'Applied', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
  lost: { label: 'Lost', color: 'text-gray-700', bgColor: 'bg-gray-50 border-gray-200' },
};

const sourceOptions = ['Zillow', 'Apartments.com', 'Website', 'Facebook', 'Craigslist', 'Referral', 'Walk-in', 'Other'];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // New lead form state
  const [newLead, setNewLead] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    source: '',
    propertyInterest: '',
    moveInDate: '',
    notes: '',
  });

  const filteredLeads = leads.filter(
    (lead) =>
      lead.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.propertyInterest.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLeadsByStatus = (status: LeadStatus) =>
    filteredLeads.filter((lead) => lead.status === status);

  const handleAddLead = () => {
    if (!newLead.firstName || !newLead.lastName || !newLead.email) {
      toast.error('Please fill in required fields');
      return;
    }

    const lead: Lead = {
      id: Date.now().toString(),
      ...newLead,
      status: 'new',
      createdAt: new Date().toISOString().split('T')[0],
      lastContact: null,
    };

    setLeads([lead, ...leads]);
    setIsAddDialogOpen(false);
    setNewLead({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      source: '',
      propertyInterest: '',
      moveInDate: '',
      notes: '',
    });
    toast.success('Lead added successfully');
  };

  const handleMoveStatus = (leadId: string, newStatus: LeadStatus) => {
    setLeads(leads.map((lead) =>
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    ));
    toast.success(`Lead moved to ${statusConfig[newStatus].label}`);
  };

  const handleConvertToApplicant = (lead: Lead) => {
    toast.success(`${lead.firstName} ${lead.lastName} converted to applicant`);
    setLeads(leads.filter((l) => l.id !== lead.id));
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads(leads.filter((lead) => lead.id !== leadId));
    toast.success('Lead deleted');
  };

  const LeadCard = ({ lead }: { lead: Lead }) => (
    <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
      setSelectedLead(lead);
      setIsDetailDialogOpen(true);
    }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={lead.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {lead.firstName[0]}{lead.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{lead.firstName} {lead.lastName}</p>
              <p className="text-xs text-muted-foreground">{lead.source}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                setSelectedLead(lead);
                setIsDetailDialogOpen(true);
              }}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Phone className="h-4 w-4 mr-2" />
                Call
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Showing
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {lead.status !== 'applied' && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleConvertToApplicant(lead);
                }}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Convert to Applicant
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteLead(lead.id);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <span className="truncate">{lead.propertyInterest}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Move-in: {new Date(lead.moveInDate).toLocaleDateString()}</span>
          </div>
          {lead.lastContact && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Last contact: {new Date(lead.lastContact).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {lead.notes && (
          <p className="mt-3 text-xs text-muted-foreground line-clamp-2 bg-muted/50 p-2 rounded">
            {lead.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );

  const PipelineColumn = ({ status }: { status: LeadStatus }) => {
    const config = statusConfig[status];
    const columnLeads = getLeadsByStatus(status);

    return (
      <div className="flex-1 min-w-[280px] max-w-[320px]">
        <div className={`rounded-lg border ${config.bgColor} p-3 mb-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold text-sm ${config.color}`}>{config.label}</h3>
              <Badge variant="secondary" className="text-xs">
                {columnLeads.length}
              </Badge>
            </div>
          </div>
        </div>
        <div className="space-y-3 min-h-[400px]">
          {columnLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
          {columnLeads.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No leads in this stage
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Track and manage prospective tenants through your rental pipeline
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
              <DialogDescription>
                Enter the prospective tenant&apos;s information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newLead.firstName}
                    onChange={(e) => setNewLead({ ...newLead, firstName: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newLead.lastName}
                    onChange={(e) => setNewLead({ ...newLead, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Lead Source</Label>
                <Select
                  value={newLead.source}
                  onValueChange={(value) => setNewLead({ ...newLead, source: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceOptions.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyInterest">Property Interest</Label>
                <Input
                  id="propertyInterest"
                  value={newLead.propertyInterest}
                  onChange={(e) => setNewLead({ ...newLead, propertyInterest: e.target.value })}
                  placeholder="123 Oak Street, Unit 1A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="moveInDate">Desired Move-in Date</Label>
                <Input
                  id="moveInDate"
                  type="date"
                  value={newLead.moveInDate}
                  onChange={(e) => setNewLead({ ...newLead, moveInDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="Any additional information..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddLead}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {(Object.keys(statusConfig) as LeadStatus[]).map((status) => {
          const config = statusConfig[status];
          const count = getLeadsByStatus(status).length;
          return (
            <Card key={status}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <Badge className={`${config.bgColor} ${config.color} border`}>
                    {Math.round((count / leads.length) * 100) || 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Pipeline View */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {(Object.keys(statusConfig) as LeadStatus[]).map((status) => (
            <PipelineColumn key={status} status={status} />
          ))}
        </div>
      </div>

      {/* Lead Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedLead && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedLead.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {selectedLead.firstName[0]}{selectedLead.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl">
                      {selectedLead.firstName} {selectedLead.lastName}
                    </DialogTitle>
                    <DialogDescription>
                      Lead from {selectedLead.source} &bull; Added {new Date(selectedLead.createdAt).toLocaleDateString()}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Contact Information</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${selectedLead.email}`} className="text-sm text-primary hover:underline">
                          {selectedLead.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${selectedLead.phone}`} className="text-sm">
                          {selectedLead.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground text-xs">Property Interest</Label>
                    <div className="mt-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedLead.propertyInterest}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground text-xs">Desired Move-in Date</Label>
                    <div className="mt-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{new Date(selectedLead.moveInDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Current Status</Label>
                    <div className="mt-2">
                      <Select
                        value={selectedLead.status}
                        onValueChange={(value) => handleMoveStatus(selectedLead.id, value as LeadStatus)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(statusConfig) as LeadStatus[]).map((status) => (
                            <SelectItem key={status} value={status}>
                              {statusConfig[status].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground text-xs">Notes</Label>
                    <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                      {selectedLead.notes || 'No notes added'}
                    </div>
                  </div>

                  {selectedLead.lastContact && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Last Contact</Label>
                      <div className="mt-2 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{new Date(selectedLead.lastContact).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <div className="flex gap-2 flex-1">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Text
                  </Button>
                </div>
                <Button onClick={() => {
                  handleConvertToApplicant(selectedLead);
                  setIsDetailDialogOpen(false);
                }}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Convert to Applicant
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
