'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Upload,
  Search,
  MoreVertical,
  FileText,
  Image,
  File,
  Calendar,
  Building2,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  Download,
  Trash2,
  Send,
  PenTool,
  FolderOpen,
  Grid,
  List,
  ArrowLeft,
  FileCheck,
  ClipboardList,
  FileSignature,
  LayoutTemplate,
  Sparkles,
  ChevronRight,
  Plus,
  Camera,
  Home,
  Wrench,
  Shield,
  Users,
  Receipt,
  Briefcase,
  Share2,
  Zap,
  Star,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type DocumentType = 'lease' | 'application' | 'id' | 'income' | 'inspection' | 'receipt' | 'other';
type SignatureStatus = 'none' | 'pending' | 'partial' | 'completed' | 'declined';
type ActiveSection = 'home' | 'documents' | 'esign' | 'reports' | 'forms' | 'templates';

interface Document {
  id: string;
  name: string;
  type: DocumentType;
  fileType: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  property?: string;
  tenant?: string;
  expiresAt?: string;
  signatureStatus: SignatureStatus;
  signers?: { name: string; email: string; signed: boolean; signedAt?: string }[];
  tags: string[];
}

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  popular: boolean;
}

interface ConditionReport {
  id: string;
  property: string;
  type: 'move-in' | 'move-out' | 'routine';
  date: string;
  status: 'draft' | 'completed' | 'signed';
  tenant?: string;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Lease Agreement - Unit 2A.pdf',
    type: 'lease',
    fileType: 'pdf',
    size: 245000,
    uploadedAt: '2024-01-15',
    uploadedBy: 'John Smith',
    property: '123 Oak Street',
    tenant: 'Sarah Johnson',
    signatureStatus: 'completed',
    signers: [
      { name: 'Sarah Johnson', email: 'sarah@email.com', signed: true, signedAt: '2024-01-16' },
      { name: 'John Smith', email: 'john@landlord.com', signed: true, signedAt: '2024-01-17' },
    ],
    tags: ['2024', 'Unit 2A'],
  },
  {
    id: '2',
    name: 'Lease Agreement - Unit 3B.pdf',
    type: 'lease',
    fileType: 'pdf',
    size: 256000,
    uploadedAt: '2024-01-18',
    uploadedBy: 'John Smith',
    property: '456 Maple Ave',
    tenant: 'Michael Chen',
    signatureStatus: 'pending',
    signers: [
      { name: 'Michael Chen', email: 'michael@email.com', signed: false },
      { name: 'John Smith', email: 'john@landlord.com', signed: true, signedAt: '2024-01-18' },
    ],
    tags: ['2024', 'Unit 3B'],
  },
  {
    id: '3',
    name: 'Application - Emily Rodriguez.pdf',
    type: 'application',
    fileType: 'pdf',
    size: 128000,
    uploadedAt: '2024-01-12',
    uploadedBy: 'Emily Rodriguez',
    property: '789 Pine Blvd',
    tenant: 'Emily Rodriguez',
    signatureStatus: 'completed',
    signers: [{ name: 'Emily Rodriguez', email: 'emily@email.com', signed: true, signedAt: '2024-01-12' }],
    tags: ['Application'],
  },
  {
    id: '4',
    name: 'ID - Sarah Johnson.jpg',
    type: 'id',
    fileType: 'jpg',
    size: 85000,
    uploadedAt: '2024-01-10',
    uploadedBy: 'Sarah Johnson',
    tenant: 'Sarah Johnson',
    expiresAt: '2028-05-15',
    signatureStatus: 'none',
    tags: ['ID', 'Verified'],
  },
  {
    id: '5',
    name: 'Pay Stubs - Michael Chen.pdf',
    type: 'income',
    fileType: 'pdf',
    size: 156000,
    uploadedAt: '2024-01-14',
    uploadedBy: 'Michael Chen',
    tenant: 'Michael Chen',
    signatureStatus: 'none',
    tags: ['Income', 'January 2024'],
  },
  {
    id: '6',
    name: 'Move-in Inspection Report.pdf',
    type: 'inspection',
    fileType: 'pdf',
    size: 892000,
    uploadedAt: '2024-01-20',
    uploadedBy: 'John Smith',
    property: '123 Oak Street',
    tenant: 'Sarah Johnson',
    signatureStatus: 'partial',
    signers: [
      { name: 'Sarah Johnson', email: 'sarah@email.com', signed: true, signedAt: '2024-01-20' },
      { name: 'John Smith', email: 'john@landlord.com', signed: false },
    ],
    tags: ['Inspection', 'Move-in'],
  },
  {
    id: '7',
    name: 'Rent Receipt - January 2024.pdf',
    type: 'receipt',
    fileType: 'pdf',
    size: 45000,
    uploadedAt: '2024-01-05',
    uploadedBy: 'System',
    property: '123 Oak Street',
    tenant: 'Sarah Johnson',
    signatureStatus: 'none',
    tags: ['Receipt', 'January 2024'],
  },
  {
    id: '8',
    name: 'Property Insurance Certificate.pdf',
    type: 'other',
    fileType: 'pdf',
    size: 234000,
    uploadedAt: '2024-01-01',
    uploadedBy: 'John Smith',
    property: '123 Oak Street',
    expiresAt: '2025-01-01',
    signatureStatus: 'none',
    tags: ['Insurance', '2024'],
  },
];

const mockForms: FormTemplate[] = [
  { id: '1', name: 'Residential Lease Agreement', description: 'Standard 12-month lease', category: 'Leases', popular: true },
  { id: '2', name: 'Month-to-Month Rental Agreement', description: 'Flexible term lease', category: 'Leases', popular: true },
  { id: '3', name: 'Rental Application', description: 'Comprehensive tenant screening', category: 'Applications', popular: true },
  { id: '4', name: 'Pet Addendum', description: 'Pet policy and deposit', category: 'Addendums', popular: false },
  { id: '5', name: 'Move-In/Move-Out Checklist', description: 'Property condition documentation', category: 'Inspections', popular: true },
  { id: '6', name: 'Late Rent Notice', description: '3-day pay or quit notice', category: 'Notices', popular: false },
  { id: '7', name: 'Lease Renewal Agreement', description: 'Extend existing lease', category: 'Leases', popular: false },
  { id: '8', name: 'Security Deposit Return', description: 'Itemized deductions letter', category: 'Financial', popular: false },
  { id: '9', name: 'Maintenance Request Form', description: 'Tenant repair request', category: 'Maintenance', popular: false },
  { id: '10', name: 'Lead Paint Disclosure', description: 'Required for pre-1978 homes', category: 'Disclosures', popular: true },
];

const mockReports: ConditionReport[] = [
  { id: '1', property: '123 Oak Street - Unit 2A', type: 'move-in', date: '2024-01-15', status: 'signed', tenant: 'Sarah Johnson' },
  { id: '2', property: '456 Maple Ave - Unit 3B', type: 'move-in', date: '2024-01-20', status: 'completed', tenant: 'Michael Chen' },
  { id: '3', property: '789 Pine Blvd', type: 'routine', date: '2024-02-01', status: 'draft' },
];

const documentTypeConfig: Record<DocumentType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  lease: { label: 'Lease', icon: FileText, color: 'bg-blue-100 text-blue-700' },
  application: { label: 'Application', icon: File, color: 'bg-purple-100 text-purple-700' },
  id: { label: 'ID Document', icon: User, color: 'bg-green-100 text-green-700' },
  income: { label: 'Income Proof', icon: File, color: 'bg-yellow-100 text-yellow-700' },
  inspection: { label: 'Inspection', icon: Eye, color: 'bg-orange-100 text-orange-700' },
  receipt: { label: 'Receipt', icon: File, color: 'bg-teal-100 text-teal-700' },
  other: { label: 'Other', icon: FolderOpen, color: 'bg-gray-100 text-gray-700' },
};

const signatureStatusConfig: Record<SignatureStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  none: { label: 'No Signature', color: 'bg-gray-100 text-gray-600', icon: File },
  pending: { label: 'Awaiting Signature', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  partial: { label: 'Partially Signed', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  completed: { label: 'Fully Signed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Category tile configuration
const categoryTiles = [
  {
    id: 'documents' as ActiveSection,
    title: 'My Documents',
    description: 'Upload, organize & manage all your rental documents',
    icon: FolderOpen,
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
    stats: '8 files',
    accent: 'blue',
  },
  {
    id: 'esign' as ActiveSection,
    title: 'E-Sign',
    description: 'Send documents for electronic signatures instantly',
    icon: FileSignature,
    gradient: 'from-purple-500 to-purple-600',
    bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900',
    stats: '2 pending',
    accent: 'purple',
  },
  {
    id: 'reports' as ActiveSection,
    title: 'Condition Reports',
    description: 'Create move-in/out inspections with photos',
    icon: ClipboardList,
    gradient: 'from-emerald-500 to-emerald-600',
    bgGradient: 'from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900',
    stats: '3 reports',
    accent: 'emerald',
  },
  {
    id: 'forms' as ActiveSection,
    title: 'Forms Library',
    description: 'State-specific legal forms ready to customize',
    icon: FileCheck,
    gradient: 'from-amber-500 to-amber-600',
    bgGradient: 'from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900',
    stats: '10+ forms',
    accent: 'amber',
  },
  {
    id: 'templates' as ActiveSection,
    title: 'Templates',
    description: 'Save time with reusable document templates',
    icon: LayoutTemplate,
    gradient: 'from-rose-500 to-rose-600',
    bgGradient: 'from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900',
    stats: 'Custom',
    accent: 'rose',
  },
];

export default function DocsPage() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [activeSection, setActiveSection] = useState<ActiveSection>('home');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles([...uploadedFiles, ...acceptedFiles]);
  }, [uploadedFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc', '.docx'],
    },
  });

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.property?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tenant?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleUpload = () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }
    toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
    setUploadedFiles([]);
    setIsUploadOpen(false);
  };

  const handleSendForSignature = (doc: Document) => {
    setSelectedDocument(doc);
    setIsSignatureOpen(true);
  };

  const handleRequestSignature = () => {
    toast.success('Signature request sent');
    setIsSignatureOpen(false);
    setSelectedDocument(null);
  };

  const handleDelete = (docId: string) => {
    setDocuments(documents.filter((d) => d.id !== docId));
    toast.success('Document deleted');
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'pdf') return <FileText className="h-8 w-8 text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) return <Image className="h-8 w-8 text-blue-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const needsSignatureCount = documents.filter((d) => d.signatureStatus === 'pending' || d.signatureStatus === 'partial').length;

  const navigateToSection = (section: ActiveSection) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSection(section);
      setIsTransitioning(false);
    }, 300);
  };

  // Hero Section Component
  const HeroSection = () => (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12 mb-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500" />

        {/* Floating document icons */}
        <div className="absolute top-8 right-12 opacity-20">
          <FileText className="h-16 w-16 text-blue-400 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        </div>
        <div className="absolute bottom-12 right-24 opacity-20">
          <PenTool className="h-12 w-12 text-purple-400 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }} />
        </div>
        <div className="absolute top-1/3 right-1/4 opacity-15">
          <ClipboardList className="h-10 w-10 text-emerald-400 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-white/80">Powered by smart organization</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Documents & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">E-Sign</span>
            </h1>
            <p className="text-lg text-slate-300">
              Your paperwork command center. Store documents, collect signatures,
              and generate reports—all in one sleek, organized space.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>Legally binding e-signatures</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Shield className="h-5 w-5 text-blue-400" />
                <span>Bank-level encryption</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span>Instant delivery</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-row md:flex-col gap-4">
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
              <p className="text-3xl font-bold text-white">{documents.length}</p>
              <p className="text-sm text-slate-300">Total Docs</p>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
              <p className="text-3xl font-bold text-yellow-400">{needsSignatureCount}</p>
              <p className="text-sm text-slate-300">Need Signatures</p>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
              <p className="text-3xl font-bold text-emerald-400">{documents.filter(d => d.signatureStatus === 'completed').length}</p>
              <p className="text-sm text-slate-300">Completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Category Tile Component
  const CategoryTile = ({ tile }: { tile: typeof categoryTiles[0] }) => {
    const Icon = tile.icon;
    return (
      <button
        onClick={() => navigateToSection(tile.id)}
        className={cn(
          "group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-500",
          "bg-gradient-to-br", tile.bgGradient,
          "border border-gray-200 dark:border-gray-700",
          "hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        )}
      >
        {/* Hover glow effect */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          "bg-gradient-to-br", tile.gradient,
          "blur-xl"
        )} style={{ transform: 'scale(0.5)', filter: 'blur(40px)' }} />

        <div className="relative z-10">
          <div className={cn(
            "inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4",
            "bg-gradient-to-br", tile.gradient,
            "shadow-lg group-hover:scale-110 transition-transform duration-300"
          )}>
            <Icon className="h-7 w-7 text-white" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-100 transition-colors">
            {tile.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {tile.description}
          </p>

          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-white/80 dark:bg-gray-800/80">
              {tile.stats}
            </Badge>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>

        {/* Animated corner accent */}
        <div className={cn(
          "absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-20",
          "bg-gradient-to-br", tile.gradient,
          "group-hover:scale-150 transition-transform duration-500"
        )} />
      </button>
    );
  };

  // Section Header with Back Button
  const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="flex items-center gap-4 mb-6">
      <button
        onClick={() => navigateToSection('home')}
        className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );

  // Documents Section
  const DocumentsSection = () => (
    <div className={cn(
      "transition-all duration-300",
      isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
    )}>
      <SectionHeader title="My Documents" subtitle="Upload, organize, and manage your rental documents" />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Documents</DialogTitle>
              <DialogDescription>
                Upload documents to your library
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-primary">Drop files here...</p>
                ) : (
                  <>
                    <p className="font-medium">Drag & drop files here</p>
                    <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-2">PDF, Word, Images up to 10MB</p>
                  </>
                )}
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files ({uploadedFiles.length})</Label>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm flex-1 truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(documentTypeConfig) as DocumentType[]).map((type) => (
                      <SelectItem key={type} value={type}>
                        {documentTypeConfig[type].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload}>
                Upload {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as DocumentType | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {(Object.keys(documentTypeConfig) as DocumentType[]).map((type) => (
              <SelectItem key={type} value={type}>
                {documentTypeConfig[type].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDocuments.map((doc) => {
          const TypeIcon = documentTypeConfig[doc.type].icon;
          const SignIcon = signatureStatusConfig[doc.signatureStatus].icon;
          return (
            <Card key={doc.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getFileIcon(doc.fileType)}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      {doc.signatureStatus === 'none' && (
                        <DropdownMenuItem onClick={() => handleSendForSignature(doc)}>
                          <PenTool className="h-4 w-4 mr-2" />
                          Request Signature
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(doc.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={documentTypeConfig[doc.type].color}>
                      {documentTypeConfig[doc.type].label}
                    </Badge>
                    {doc.signatureStatus !== 'none' && (
                      <Badge className={signatureStatusConfig[doc.signatureStatus].color}>
                        <SignIcon className="h-3 w-3 mr-1" />
                        {signatureStatusConfig[doc.signatureStatus].label}
                      </Badge>
                    )}
                  </div>

                  {doc.property && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      <span>{doc.property}</span>
                    </div>
                  )}
                  {doc.tenant && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{doc.tenant}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
                    <Clock className="h-3 w-3" />
                    <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // E-Sign Section
  const ESignSection = () => {
    const pendingDocs = documents.filter(d => d.signatureStatus === 'pending' || d.signatureStatus === 'partial');
    const completedDocs = documents.filter(d => d.signatureStatus === 'completed');

    return (
      <div className={cn(
        "transition-all duration-300",
        isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      )}>
        <SectionHeader title="E-Sign" subtitle="Send documents for electronic signatures" />

        {/* E-Sign Hero */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 md:p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">Collect Signatures in Minutes</h3>
              <p className="text-purple-100 mb-4">
                Upload any document and send it for legally-binding electronic signatures.
                Track progress in real-time and get notified when completed.
              </p>
              <Button variant="secondary" className="gap-2">
                <Plus className="h-4 w-4" />
                New Signature Request
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/20 rounded-xl p-4">
                <p className="text-3xl font-bold">{pendingDocs.length}</p>
                <p className="text-sm text-purple-100">Pending</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4">
                <p className="text-3xl font-bold">{completedDocs.length}</p>
                <p className="text-sm text-purple-100">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Signatures */}
        <h3 className="text-lg font-semibold mb-4">Awaiting Signatures</h3>
        {pendingDocs.length > 0 ? (
          <div className="space-y-3 mb-8">
            {pendingDocs.map(doc => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getFileIcon(doc.fileType)}
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">{doc.property} • {doc.tenant}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge className={signatureStatusConfig[doc.signatureStatus].color}>
                          {signatureStatusConfig[doc.signatureStatus].label}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {doc.signers?.filter(s => s.signed).length}/{doc.signers?.length} signed
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        Remind
                      </Button>
                    </div>
                  </div>
                  {doc.signers && (
                    <div className="mt-4 pt-4 border-t flex gap-4">
                      {doc.signers.map((signer, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          {signer.signed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className={signer.signed ? 'text-muted-foreground' : 'font-medium'}>
                            {signer.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <FileSignature className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending signatures</p>
            </CardContent>
          </Card>
        )}

        {/* Completed Signatures */}
        <h3 className="text-lg font-semibold mb-4">Recently Completed</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completedDocs.slice(0, 4).map(doc => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Completed {doc.signers?.[0]?.signedAt && new Date(doc.signers[0].signedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Condition Reports Section
  const ReportsSection = () => (
    <div className={cn(
      "transition-all duration-300",
      isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
    )}>
      <SectionHeader title="Condition Reports" subtitle="Document property conditions with photos" />

      {/* Create Report Hero */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 md:p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">Professional Condition Reports</h3>
            <p className="text-emerald-100 mb-4">
              Create detailed move-in/move-out inspections with room-by-room photos,
              notes, and tenant signatures. Protect yourself legally with thorough documentation.
            </p>
            <Button variant="secondary" className="gap-2">
              <Camera className="h-4 w-4" />
              Start New Report
            </Button>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <Home className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Move-In</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <Briefcase className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Move-Out</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <Wrench className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Routine</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <h3 className="text-lg font-semibold mb-4">Your Reports</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockReports.map(report => (
          <Card key={report.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={
                  report.type === 'move-in' ? 'default' :
                  report.type === 'move-out' ? 'secondary' : 'outline'
                }>
                  {report.type === 'move-in' ? 'Move-In' :
                   report.type === 'move-out' ? 'Move-Out' : 'Routine'}
                </Badge>
                <Badge variant={
                  report.status === 'signed' ? 'default' :
                  report.status === 'completed' ? 'secondary' : 'outline'
                } className={
                  report.status === 'signed' ? 'bg-green-100 text-green-700' :
                  report.status === 'completed' ? 'bg-blue-100 text-blue-700' : ''
                }>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </Badge>
              </div>
              <h4 className="font-semibold mb-1">{report.property}</h4>
              {report.tenant && (
                <p className="text-sm text-muted-foreground mb-2">
                  <User className="h-3 w-3 inline mr-1" />
                  {report.tenant}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                <Calendar className="h-3 w-3 inline mr-1" />
                {new Date(report.date).toLocaleDateString()}
              </p>
              <div className="mt-4 pt-4 border-t flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Report Card */}
        <Card className="border-dashed hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer">
          <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[200px]">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="font-medium">New Report</p>
            <p className="text-sm text-muted-foreground">Create inspection</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Forms Section
  const FormsSection = () => {
    const categories = [...new Set(mockForms.map(f => f.category))];
    const popularForms = mockForms.filter(f => f.popular);

    return (
      <div className={cn(
        "transition-all duration-300",
        isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      )}>
        <SectionHeader title="Forms Library" subtitle="State-specific legal forms for landlords" />

        {/* Popular Forms */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold">Popular Forms</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularForms.map(form => (
              <Card key={form.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900 group-hover:scale-110 transition-transform">
                      <FileCheck className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">{form.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{form.description}</p>
                      <Badge variant="outline">{form.category}</Badge>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Button size="sm" className="flex-1 gap-1">
                      <FileText className="h-4 w-4" />
                      Use Form
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Forms by Category */}
        <h3 className="text-lg font-semibold mb-4">Browse by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(category => {
            const count = mockForms.filter(f => f.category === category).length;
            return (
              <Card key={category} className="hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-3 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                    <FileText className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h4 className="font-medium mb-1">{category}</h4>
                  <p className="text-sm text-muted-foreground">{count} forms</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // Templates Section
  const TemplatesSection = () => (
    <div className={cn(
      "transition-all duration-300",
      isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
    )}>
      <SectionHeader title="Templates" subtitle="Save time with reusable document templates" />

      {/* Templates Hero */}
      <div className="bg-gradient-to-br from-rose-500 to-rose-700 rounded-2xl p-6 md:p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">Create Once, Use Forever</h3>
            <p className="text-rose-100 mb-4">
              Build custom templates from any document. Pre-fill common fields,
              add your branding, and generate new documents in seconds.
            </p>
            <Button variant="secondary" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </div>
          <div className="p-6 bg-white/20 rounded-2xl">
            <LayoutTemplate className="h-16 w-16" />
          </div>
        </div>
      </div>

      {/* Empty State / Getting Started */}
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900 mx-auto mb-4 flex items-center justify-center">
            <LayoutTemplate className="h-10 w-10 text-rose-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Templates Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first template by uploading a document and marking fields
            that should be auto-filled for each new document.
          </p>
          <div className="flex justify-center gap-4">
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Use AI Assistant
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Ideas */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Popular Template Ideas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: FileText, title: 'Custom Lease Agreement', description: 'Your standard lease with pre-filled property details' },
            { icon: Receipt, title: 'Rent Receipt', description: 'Auto-generate receipts for each payment' },
            { icon: Users, title: 'Welcome Letter', description: 'Personalized move-in info for new tenants' },
          ].map((idea, idx) => (
            <Card key={idx} className="hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-rose-100 dark:group-hover:bg-rose-900 transition-colors">
                    <idea.icon className="h-5 w-5 text-gray-600 group-hover:text-rose-600 transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{idea.title}</h4>
                    <p className="text-sm text-muted-foreground">{idea.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  // Home Section (Category Tiles)
  const HomeSection = () => (
    <div className={cn(
      "transition-all duration-300",
      isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
    )}>
      <HeroSection />

      {/* Category Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryTiles.map((tile) => (
          <CategoryTile key={tile.id} tile={tile} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setIsUploadOpen(true)}>
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigateToSection('esign')}>
            <PenTool className="h-4 w-4" />
            Request Signature
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigateToSection('reports')}>
            <Camera className="h-4 w-4" />
            New Inspection
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigateToSection('forms')}>
            <FileCheck className="h-4 w-4" />
            Browse Forms
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {activeSection === 'home' && <HomeSection />}
      {activeSection === 'documents' && <DocumentsSection />}
      {activeSection === 'esign' && <ESignSection />}
      {activeSection === 'reports' && <ReportsSection />}
      {activeSection === 'forms' && <FormsSection />}
      {activeSection === 'templates' && <TemplatesSection />}

      {/* Signature Request Dialog */}
      <Dialog open={isSignatureOpen} onOpenChange={setIsSignatureOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request E-Signature</DialogTitle>
            <DialogDescription>
              Send this document for electronic signature
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                {getFileIcon(selectedDocument.fileType)}
                <div>
                  <p className="font-medium text-sm">{selectedDocument.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(selectedDocument.size)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Signers</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input placeholder="Name" className="flex-1" defaultValue={selectedDocument.tenant || ''} />
                    <Input placeholder="Email" className="flex-1" />
                    <Button variant="ghost" size="icon">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Add Signer
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Message (optional)</Label>
                <Input placeholder="Add a message to include in the email..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSignatureOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestSignature}>
              <Send className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <DialogDescription>
              Upload documents to your library
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-primary">Drop files here...</p>
              ) : (
                <>
                  <p className="font-medium">Drag & drop files here</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-2">PDF, Word, Images up to 10MB</p>
                </>
              )}
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files ({uploadedFiles.length})</Label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm flex-1 truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(documentTypeConfig) as DocumentType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {documentTypeConfig[type].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload}>
              Upload {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
