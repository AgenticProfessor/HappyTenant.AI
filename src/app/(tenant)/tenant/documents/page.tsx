'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Download,
  File,
  FileCheck,
  AlertCircle,
  Calendar,
  Eye,
} from 'lucide-react';
import { mockTenants, mockLeases } from '@/data/mock-data';
import { toast } from 'sonner';

const currentTenant = mockTenants[0];
const currentLease = mockLeases.find((l) => l.tenantId === currentTenant.id && l.status === 'active');

// Mock documents data
const mockDocuments = [
  {
    id: 'doc-1',
    name: 'Lease Agreement - 2023-2024',
    category: 'lease',
    type: 'PDF',
    size: '2.4 MB',
    uploadedDate: '2023-06-01',
    description: 'Signed lease agreement for Unit 101',
  },
  {
    id: 'doc-2',
    name: 'Move-In Inspection Report',
    category: 'inspections',
    type: 'PDF',
    size: '1.8 MB',
    uploadedDate: '2023-06-01',
    description: 'Initial unit condition documentation with photos',
  },
  {
    id: 'doc-3',
    name: 'Lease Addendum - Pet Policy',
    category: 'lease',
    type: 'PDF',
    size: '156 KB',
    uploadedDate: '2023-07-15',
    description: 'Pet policy addendum signed July 2023',
  },
  {
    id: 'doc-4',
    name: 'Rent Increase Notice - 2024',
    category: 'notices',
    type: 'PDF',
    size: '89 KB',
    uploadedDate: '2024-03-01',
    description: '60-day notice of rent adjustment',
  },
  {
    id: 'doc-5',
    name: 'Parking Pass Application',
    category: 'other',
    type: 'PDF',
    size: '234 KB',
    uploadedDate: '2023-06-05',
    description: 'Approved parking pass for Unit 101',
  },
  {
    id: 'doc-6',
    name: 'Property Rules & Regulations',
    category: 'notices',
    type: 'PDF',
    size: '567 KB',
    uploadedDate: '2023-06-01',
    description: 'Community guidelines and property policies',
  },
  {
    id: 'doc-7',
    name: 'HVAC Maintenance Receipt',
    category: 'other',
    type: 'PDF',
    size: '123 KB',
    uploadedDate: '2024-09-15',
    description: 'Annual HVAC service documentation',
  },
];

const categories = [
  { value: 'all', label: 'All Documents', icon: FileText },
  { value: 'lease', label: 'Lease', icon: FileCheck },
  { value: 'notices', label: 'Notices', icon: AlertCircle },
  { value: 'inspections', label: 'Inspections', icon: Eye },
  { value: 'other', label: 'Other', icon: File },
];

export default function TenantDocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredDocuments = selectedCategory === 'all'
    ? mockDocuments
    : mockDocuments.filter(doc => doc.category === selectedCategory);

  const handleDownload = (documentName: string) => {
    toast.success('Download started', {
      description: `Downloading ${documentName}...`,
    });
  };

  const handleView = (documentName: string) => {
    toast.info('Opening document', {
      description: `Opening ${documentName} in new window...`,
    });
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      default:
        return <File className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'lease':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'notices':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'inspections':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'other':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Access your lease, notices, and important documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDocuments.length}</div>
            <p className="text-xs text-muted-foreground">Available for download</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lease Documents
            </CardTitle>
            <FileCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockDocuments.filter(d => d.category === 'lease').length}
            </div>
            <p className="text-xs text-muted-foreground">Active lease files</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Notices
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {mockDocuments.filter(d => d.category === 'notices').length}
            </div>
            <p className="text-xs text-muted-foreground">Official notices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Latest Upload
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(mockDocuments[0]?.uploadedDate || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <p className="text-xs text-muted-foreground">Most recent</p>
          </CardContent>
        </Card>
      </div>

      {/* Documents list with filters */}
      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>View and download your rental documents</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
            <TabsList className="grid grid-cols-5 w-full">
              {categories.map((category) => {
                const Icon = category.icon;
                const count = category.value === 'all'
                  ? mockDocuments.length
                  : mockDocuments.filter(d => d.category === category.value).length;

                return (
                  <TabsTrigger
                    key={category.value}
                    value={category.value}
                    className="flex items-center gap-1"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{category.label}</span>
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {count}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.value} value={category.value} className="space-y-4">
                {filteredDocuments.length > 0 ? (
                  <div className="grid gap-4">
                    {filteredDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {getFileIcon(doc.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-semibold">{doc.name}</h3>
                              <Badge
                                variant="outline"
                                className={getCategoryBadgeColor(doc.category)}
                              >
                                {doc.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {doc.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(doc.uploadedDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                              <span>{doc.type}</span>
                              <span>{doc.size}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(doc.name)}
                          >
                            <Eye className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleDownload(doc.name)}
                          >
                            <Download className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Download</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <h3 className="mt-4 font-semibold">No documents found</h3>
                    <p className="text-muted-foreground mt-1">
                      There are no documents in this category yet.
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Important info */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Document Storage</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                All documents are securely stored and accessible 24/7. We recommend downloading important documents like your lease agreement for your records. Documents are retained for the duration of your tenancy plus 7 years.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
