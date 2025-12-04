'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  Clock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  User,
  Building2,
  Calendar,
  MessageSquare,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useMaintenanceRequests, type MaintenanceRequest } from '@/hooks';
import { useStewardContext } from '@/hooks/use-steward-context';

// Map API status to UI status
const mapApiStatusToUI = (status: MaintenanceRequest['status']): string => {
  switch (status) {
    case 'SUBMITTED':
    case 'ACKNOWLEDGED':
      return 'open';
    case 'SCHEDULED':
    case 'IN_PROGRESS':
      return 'in_progress';
    case 'COMPLETED':
      return 'completed';
    case 'CANCELLED':
      return 'cancelled';
    default:
      return 'open';
  }
};

// Map API priority to UI priority
const mapApiPriorityToUI = (priority: MaintenanceRequest['priority']): string => {
  switch (priority) {
    case 'EMERGENCY':
      return 'urgent';
    case 'HIGH':
      return 'high';
    case 'NORMAL':
      return 'normal';
    case 'LOW':
      return 'low';
    default:
      return 'normal';
  }
};

export default function MaintenancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  // Fetch maintenance requests from API
  const { data: maintenanceRequests, isLoading, error } = useMaintenanceRequests();

  // Filter requests based on search and filters
  const filteredRequests = useMemo(() => {
    if (!maintenanceRequests) return [];

    return maintenanceRequests.filter((request) => {
      const matchesSearch =
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase());
      const uiStatus = mapApiStatusToUI(request.status);
      const uiPriority = mapApiPriorityToUI(request.priority);
      const matchesStatus = !filterStatus || uiStatus === filterStatus;
      const matchesPriority = !filterPriority || uiPriority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [maintenanceRequests, searchQuery, filterStatus, filterPriority]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!maintenanceRequests) return { openRequests: 0, inProgressRequests: 0, completedRequests: 0, urgentRequests: 0 };

    const openRequests = maintenanceRequests.filter((r) =>
      r.status === 'SUBMITTED' || r.status === 'ACKNOWLEDGED'
    ).length;
    const inProgressRequests = maintenanceRequests.filter((r) =>
      r.status === 'SCHEDULED' || r.status === 'IN_PROGRESS'
    ).length;
    const completedRequests = maintenanceRequests.filter((r) =>
      r.status === 'COMPLETED'
    ).length;
    const urgentRequests = maintenanceRequests.filter((r) =>
      (r.priority === 'EMERGENCY' || r.priority === 'HIGH') && r.status !== 'COMPLETED'
    ).length;

    return { openRequests, inProgressRequests, completedRequests, urgentRequests };
  }, [maintenanceRequests]);

  const { openRequests, inProgressRequests, completedRequests, urgentRequests } = stats;

  useStewardContext({
    type: 'page',
    name: 'maintenance-list',
    description: 'List of all maintenance requests',
    data: {
      totalRequests: maintenanceRequests?.length ?? 0,
      openRequests,
      inProgressRequests,
      completedRequests,
      urgentRequests,
    },
    url: '/dashboard/maintenance',
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'normal':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground">
            Track and manage maintenance requests across all properties
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Maintenance Request</DialogTitle>
              <DialogDescription>
                Submit a new maintenance request for a property unit.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="property">Property</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prop-1">Sunset Apartments</SelectItem>
                    <SelectItem value="prop-2">Oak Street House</SelectItem>
                    <SelectItem value="prop-3">Downtown Lofts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unit-1">Unit 101</SelectItem>
                    <SelectItem value="unit-2">Unit 102</SelectItem>
                    <SelectItem value="unit-3">Unit 201</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Brief description of the issue" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent - Safety issue</SelectItem>
                    <SelectItem value="high">High - Major inconvenience</SelectItem>
                    <SelectItem value="normal">Normal - Standard repair</SelectItem>
                    <SelectItem value="low">Low - Minor issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the maintenance issue..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Create Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* AI Triage Card */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold flex items-center gap-2">
                AI Maintenance Triage
                <Badge variant="secondary" className="text-xs">Beta</Badge>
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Our AI automatically categorizes and prioritizes incoming requests based on urgency and type.
              </p>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>{urgentRequests} urgent requests need attention</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Configure AI
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Requests
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-red-600">{openRequests}</div>
            )}
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-amber-600">{inProgressRequests}</div>
            )}
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{completedRequests}</div>
            )}
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Urgent
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-red-600">{urgentRequests}</div>
            )}
            <p className="text-xs text-muted-foreground">High priority</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search maintenance requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {filterStatus ? filterStatus.replace('_', ' ') : 'All Status'}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus(null)}>All Status</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('open')}>Open</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('in_progress')}>In Progress</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('completed')}>Completed</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {filterPriority ? filterPriority : 'All Priority'}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterPriority(null)}>All Priority</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPriority('urgent')}>Urgent</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPriority('high')}>High</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPriority('normal')}>Normal</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPriority('low')}>Low</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Requests list */}
      <div className="space-y-4">
        {error && (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <h3 className="mt-4 font-semibold text-destructive">Error loading maintenance requests</h3>
              <p className="text-muted-foreground mt-1">
                {error.message || 'Please try again later.'}
              </p>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="h-4 w-full mb-4" />
                      <div className="flex flex-wrap gap-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-28" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {!isLoading && !error && filteredRequests.map((request) => {
          const uiPriority = mapApiPriorityToUI(request.priority);
          const uiStatus = mapApiStatusToUI(request.status);
          const tenantName = request.tenant
            ? `${request.tenant.firstName} ${request.tenant.lastName}`
            : null;

          return (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    uiPriority === 'urgent' || uiPriority === 'high' ? 'bg-red-100' :
                    uiPriority === 'normal' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Wrench className={`h-6 w-6 ${
                      uiPriority === 'urgent' || uiPriority === 'high' ? 'text-red-600' :
                      uiPriority === 'normal' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{request.title}</h3>
                      <Badge className={getPriorityColor(uiPriority)}>
                        {uiPriority}
                      </Badge>
                      <Badge
                        variant={
                          uiStatus === 'open' ? 'destructive' :
                            uiStatus === 'in_progress' ? 'default' : 'secondary'
                        }
                        className="gap-1"
                      >
                        {getStatusIcon(uiStatus)}
                        {uiStatus.replace('_', ' ')}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground mb-4">{request.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {request.unit && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{request.unit.property?.name} - Unit {request.unit.unitNumber}</span>
                        </div>
                      )}
                      {tenantName && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{tenantName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Comment
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Update Status
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Mark as In Progress</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                        <DropdownMenuItem>Assign Vendor</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Request</DropdownMenuItem>
                        <DropdownMenuItem>Add Photos</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {!isLoading && !error && filteredRequests.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Wrench className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 font-semibold">No maintenance requests</h3>
              <p className="text-muted-foreground mt-1">
                No requests match your current filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
