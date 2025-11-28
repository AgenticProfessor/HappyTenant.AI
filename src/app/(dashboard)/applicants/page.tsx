'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  Search,
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Shield,
  DollarSign,
  User,
  Eye,
  Download,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Send,
  UserCheck,
  CreditCard,
  Home,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';

type ApplicationStatus = 'pending' | 'screening' | 'review' | 'approved' | 'denied';

interface ScreeningResult {
  type: 'credit' | 'background' | 'eviction' | 'income';
  status: 'pass' | 'fail' | 'pending' | 'review';
  score?: number;
  details?: string;
}

interface Application {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: ApplicationStatus;
  property: string;
  unit: string;
  rent: number;
  appliedDate: string;
  desiredMoveIn: string;
  employmentStatus: string;
  employer: string;
  monthlyIncome: number;
  creditScore?: number;
  screening: ScreeningResult[];
  documents: string[];
  notes: string;
  avatar?: string;
}

const mockApplications: Application[] = [
  {
    id: '1',
    firstName: 'Jessica',
    lastName: 'Williams',
    email: 'jwilliams@email.com',
    phone: '(555) 567-8901',
    status: 'review',
    property: '456 Maple Ave',
    unit: 'Unit 2C',
    rent: 1800,
    appliedDate: '2024-01-18',
    desiredMoveIn: '2024-02-15',
    employmentStatus: 'Full-time',
    employer: 'Tech Solutions Inc.',
    monthlyIncome: 6500,
    creditScore: 720,
    screening: [
      { type: 'credit', status: 'pass', score: 720, details: 'Good credit history, no major delinquencies' },
      { type: 'background', status: 'pass', details: 'No criminal records found' },
      { type: 'eviction', status: 'pass', details: 'No eviction history' },
      { type: 'income', status: 'pass', details: 'Income verified at $6,500/month' },
    ],
    documents: ['ID', 'Pay Stubs', 'Bank Statements', 'Employment Letter'],
    notes: 'Strong candidate, income exceeds 3x rent requirement',
    avatar: '',
  },
  {
    id: '2',
    firstName: 'Marcus',
    lastName: 'Johnson',
    email: 'mjohnson@email.com',
    phone: '(555) 234-5678',
    status: 'screening',
    property: '123 Oak Street',
    unit: 'Unit 4A',
    rent: 1500,
    appliedDate: '2024-01-19',
    desiredMoveIn: '2024-02-01',
    employmentStatus: 'Full-time',
    employer: 'City Hospital',
    monthlyIncome: 5200,
    screening: [
      { type: 'credit', status: 'pending' },
      { type: 'background', status: 'pending' },
      { type: 'eviction', status: 'pass', details: 'No eviction history' },
      { type: 'income', status: 'pass', details: 'Income verified at $5,200/month' },
    ],
    documents: ['ID', 'Pay Stubs'],
    notes: 'Awaiting credit and background check results',
    avatar: '',
  },
  {
    id: '3',
    firstName: 'Amanda',
    lastName: 'Chen',
    email: 'achen@email.com',
    phone: '(555) 345-6789',
    status: 'pending',
    property: '789 Pine Blvd',
    unit: 'Unit 1B',
    rent: 2200,
    appliedDate: '2024-01-20',
    desiredMoveIn: '2024-03-01',
    employmentStatus: 'Self-employed',
    employer: 'Chen Consulting LLC',
    monthlyIncome: 8000,
    screening: [
      { type: 'credit', status: 'pending' },
      { type: 'background', status: 'pending' },
      { type: 'eviction', status: 'pending' },
      { type: 'income', status: 'pending' },
    ],
    documents: ['ID'],
    notes: 'New application, awaiting documents',
    avatar: '',
  },
  {
    id: '4',
    firstName: 'Robert',
    lastName: 'Davis',
    email: 'rdavis@email.com',
    phone: '(555) 456-7890',
    status: 'approved',
    property: '456 Maple Ave',
    unit: 'Unit 3A',
    rent: 1650,
    appliedDate: '2024-01-15',
    desiredMoveIn: '2024-02-01',
    employmentStatus: 'Full-time',
    employer: 'State University',
    monthlyIncome: 5800,
    creditScore: 750,
    screening: [
      { type: 'credit', status: 'pass', score: 750, details: 'Excellent credit history' },
      { type: 'background', status: 'pass', details: 'Clean background check' },
      { type: 'eviction', status: 'pass', details: 'No eviction history' },
      { type: 'income', status: 'pass', details: 'Income verified at $5,800/month' },
    ],
    documents: ['ID', 'Pay Stubs', 'Bank Statements', 'Employment Letter', 'References'],
    notes: 'Approved - lease sent for signature',
    avatar: '',
  },
  {
    id: '5',
    firstName: 'Linda',
    lastName: 'Martinez',
    email: 'lmartinez@email.com',
    phone: '(555) 567-8902',
    status: 'denied',
    property: '123 Oak Street',
    unit: 'Unit 2B',
    rent: 1400,
    appliedDate: '2024-01-12',
    desiredMoveIn: '2024-02-01',
    employmentStatus: 'Part-time',
    employer: 'Retail Store',
    monthlyIncome: 2800,
    creditScore: 580,
    screening: [
      { type: 'credit', status: 'fail', score: 580, details: 'Multiple delinquent accounts' },
      { type: 'background', status: 'pass', details: 'No criminal records' },
      { type: 'eviction', status: 'review', details: 'Previous eviction in 2022' },
      { type: 'income', status: 'fail', details: 'Income below 3x rent requirement' },
    ],
    documents: ['ID', 'Pay Stubs'],
    notes: 'Denied due to credit and income requirements',
    avatar: '',
  },
];

const statusConfig: Record<ApplicationStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: Clock },
  screening: { label: 'Screening', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Shield },
  review: { label: 'In Review', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Eye },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle2 },
  denied: { label: 'Denied', color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
};

const screeningStatusConfig = {
  pass: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  fail: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  pending: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50' },
  review: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
};

const screeningTypeIcons = {
  credit: CreditCard,
  background: Shield,
  eviction: Home,
  income: Briefcase,
};

export default function ApplicantsPage() {
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDecisionDialogOpen, setIsDecisionDialogOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<'approve' | 'deny'>('approve');
  const [decisionNotes, setDecisionNotes] = useState('');

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.property.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStartScreening = (appId: string) => {
    setApplications(applications.map((app) =>
      app.id === appId ? { ...app, status: 'screening' } : app
    ));
    toast.success('Screening initiated');
  };

  const handleMakeDecision = () => {
    if (!selectedApplication) return;

    const newStatus = decisionType === 'approve' ? 'approved' : 'denied';
    setApplications(applications.map((app) =>
      app.id === selectedApplication.id
        ? { ...app, status: newStatus, notes: decisionNotes || app.notes }
        : app
    ));

    setIsDecisionDialogOpen(false);
    setIsDetailDialogOpen(false);
    setDecisionNotes('');
    toast.success(`Application ${decisionType === 'approve' ? 'approved' : 'denied'}`);
  };

  const handleConvertToTenant = (app: Application) => {
    toast.success(`${app.firstName} ${app.lastName} converted to tenant`);
    setApplications(applications.filter((a) => a.id !== app.id));
  };

  const getScreeningProgress = (app: Application) => {
    const completed = app.screening.filter((s) => s.status !== 'pending').length;
    return (completed / app.screening.length) * 100;
  };

  const ApplicationCard = ({ application }: { application: Application }) => {
    const StatusIcon = statusConfig[application.status].icon;

    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => {
          setSelectedApplication(application);
          setIsDetailDialogOpen(true);
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={application.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {application.firstName[0]}{application.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{application.firstName} {application.lastName}</p>
                <p className="text-sm text-muted-foreground">{application.property} - {application.unit}</p>
              </div>
            </div>
            <Badge className={`${statusConfig[application.status].color} border`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig[application.status].label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>${application.rent}/mo</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Move-in: {new Date(application.desiredMoveIn).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>${application.monthlyIncome.toLocaleString()}/mo</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
            </div>
          </div>

          {application.status === 'screening' && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Screening Progress</span>
                <span className="font-medium">{Math.round(getScreeningProgress(application))}%</span>
              </div>
              <Progress value={getScreeningProgress(application)} className="h-2" />
            </div>
          )}

          {application.creditScore && (
            <div className="mt-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Credit Score: </span>
              <Badge variant={application.creditScore >= 700 ? 'default' : application.creditScore >= 650 ? 'secondary' : 'destructive'}>
                {application.creditScore}
              </Badge>
            </div>
          )}

          <div className="mt-3 flex gap-2">
            {application.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartScreening(application.id);
                }}
              >
                <Shield className="h-4 w-4 mr-2" />
                Start Screening
              </Button>
            )}
            {application.status === 'approved' && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleConvertToTenant(application);
                }}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Convert to Tenant
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applicants</h1>
          <p className="text-muted-foreground">
            Review and process rental applications
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {(Object.keys(statusConfig) as ApplicationStatus[]).map((status) => {
          const count = applications.filter((a) => a.status === status).length;
          const StatusIcon = statusConfig[status].icon;
          return (
            <Card key={status} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(status)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{statusConfig[status].label}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <StatusIcon className={`h-8 w-8 ${statusConfig[status].color.includes('green') ? 'text-green-500' : statusConfig[status].color.includes('red') ? 'text-red-500' : statusConfig[status].color.includes('yellow') ? 'text-yellow-500' : statusConfig[status].color.includes('blue') ? 'text-blue-500' : 'text-gray-400'}`} />
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
            placeholder="Search applicants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApplicationStatus | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {(Object.keys(statusConfig) as ApplicationStatus[]).map((status) => (
              <SelectItem key={status} value={status}>
                {statusConfig[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApplications.map((application) => (
          <ApplicationCard key={application.id} application={application} />
        ))}
        {filteredApplications.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No applications found matching your criteria
          </div>
        )}
      </div>

      {/* Application Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedApplication.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {selectedApplication.firstName[0]}{selectedApplication.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-xl">
                        {selectedApplication.firstName} {selectedApplication.lastName}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedApplication.property} - {selectedApplication.unit} &bull; ${selectedApplication.rent}/mo
                      </DialogDescription>
                    </div>
                  </div>
                  <Badge className={`${statusConfig[selectedApplication.status].color} border`}>
                    {statusConfig[selectedApplication.status].label}
                  </Badge>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="screening">Screening</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${selectedApplication.email}`} className="text-sm text-primary hover:underline">
                            {selectedApplication.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedApplication.phone}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Employment</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedApplication.employer}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedApplication.employmentStatus}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">${selectedApplication.monthlyIncome.toLocaleString()}/month</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Rental Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedApplication.property} - {selectedApplication.unit}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">${selectedApplication.rent}/month rent</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Move-in: {new Date(selectedApplication.desiredMoveIn).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Income Verification</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Monthly Income</span>
                            <span className="font-medium">${selectedApplication.monthlyIncome.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Monthly Rent</span>
                            <span className="font-medium">${selectedApplication.rent}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Income to Rent Ratio</span>
                            <Badge variant={selectedApplication.monthlyIncome / selectedApplication.rent >= 3 ? 'default' : 'destructive'}>
                              {(selectedApplication.monthlyIncome / selectedApplication.rent).toFixed(1)}x
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="screening" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Screening Results</CardTitle>
                      <CardDescription>
                        Background, credit, and income verification status
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedApplication.screening.map((item, index) => {
                          const config = screeningStatusConfig[item.status];
                          const TypeIcon = screeningTypeIcons[item.type];
                          const StatusIcon = config.icon;
                          return (
                            <div key={index} className={`flex items-start gap-4 p-4 rounded-lg ${config.bg}`}>
                              <TypeIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium capitalize">{item.type} Check</p>
                                  <StatusIcon className={`h-4 w-4 ${config.color}`} />
                                </div>
                                {item.score && (
                                  <p className="text-sm text-muted-foreground">Score: {item.score}</p>
                                )}
                                {item.details && (
                                  <p className="text-sm text-muted-foreground mt-1">{item.details}</p>
                                )}
                              </div>
                              <Badge className={`${config.bg} ${config.color} border capitalize`}>
                                {item.status}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Submitted Documents</CardTitle>
                      <CardDescription>
                        Documents provided by the applicant
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedApplication.documents.map((doc, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm flex-1">{doc}</span>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      {selectedApplication.documents.length < 4 && (
                        <div className="mt-4 p-4 border border-dashed rounded-lg text-center text-muted-foreground">
                          <p className="text-sm">Some required documents are missing</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            <Send className="h-4 w-4 mr-2" />
                            Request Documents
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notes" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes & History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm">{selectedApplication.notes}</p>
                      </div>
                      <div className="mt-4">
                        <Label htmlFor="additionalNotes">Add Note</Label>
                        <Textarea
                          id="additionalNotes"
                          placeholder="Add a note about this application..."
                          className="mt-2"
                          rows={3}
                        />
                        <Button className="mt-2" size="sm">
                          Save Note
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
                {selectedApplication.status === 'review' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDecisionType('deny');
                        setIsDecisionDialogOpen(true);
                      }}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Deny Application
                    </Button>
                    <Button
                      onClick={() => {
                        setDecisionType('approve');
                        setIsDecisionDialogOpen(true);
                      }}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Approve Application
                    </Button>
                  </>
                )}
                {selectedApplication.status === 'approved' && (
                  <Button onClick={() => handleConvertToTenant(selectedApplication)}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Convert to Tenant
                  </Button>
                )}
                {selectedApplication.status === 'pending' && (
                  <Button onClick={() => handleStartScreening(selectedApplication.id)}>
                    <Shield className="h-4 w-4 mr-2" />
                    Start Screening
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Decision Dialog */}
      <Dialog open={isDecisionDialogOpen} onOpenChange={setIsDecisionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decisionType === 'approve' ? 'Approve Application' : 'Deny Application'}
            </DialogTitle>
            <DialogDescription>
              {decisionType === 'approve'
                ? 'Are you sure you want to approve this application? A lease will be sent to the applicant.'
                : 'Are you sure you want to deny this application? The applicant will be notified.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="decisionNotes">Notes (optional)</Label>
            <Textarea
              id="decisionNotes"
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              placeholder={decisionType === 'approve' ? 'Any additional notes...' : 'Reason for denial...'}
              className="mt-2"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDecisionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={decisionType === 'approve' ? 'default' : 'destructive'}
              onClick={handleMakeDecision}
            >
              {decisionType === 'approve' ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Deny
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
