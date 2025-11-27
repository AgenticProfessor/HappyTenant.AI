'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, FolderOpen } from 'lucide-react';
import { mockDocuments, mockProperties, mockTenants } from '@/data/mock-data';
import { Document } from '@/types';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentFilters } from '@/components/documents/DocumentFilters';
import { UploadDialog } from '@/components/documents/UploadDialog';
import { toast } from 'sonner';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(mockDocuments);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [signatureFilter, setSignatureFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  // Filter documents based on current filters and tab
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Tab filter
      if (activeTab !== 'all') {
        if (activeTab === 'leases' && doc.type !== 'lease') return false;
        if (activeTab === 'templates' && doc.type !== 'template') return false;
        if (activeTab === 'receipts' && doc.type !== 'receipt') return false;
        if (activeTab === 'other' && !['insurance', 'inspection', 'notice', 'other'].includes(doc.type)) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = doc.name.toLowerCase().includes(query);
        const matchesCategory = doc.category.toLowerCase().includes(query);
        const matchesDescription = doc.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesDescription) return false;
      }

      // Property filter
      if (propertyFilter !== 'all' && doc.propertyId !== propertyFilter) {
        return false;
      }

      // Signature filter
      if (signatureFilter !== 'all' && doc.signatureStatus !== signatureFilter) {
        return false;
      }

      return true;
    });
  }, [documents, activeTab, searchQuery, propertyFilter, signatureFilter]);

  // Group documents by property for the leases tab
  const groupedLeases = useMemo(() => {
    const leases = filteredDocuments.filter((doc) => doc.type === 'lease');
    const grouped = new Map<string, Document[]>();

    leases.forEach((lease) => {
      const propertyId = lease.propertyId || 'no-property';
      if (!grouped.has(propertyId)) {
        grouped.set(propertyId, []);
      }
      grouped.get(propertyId)?.push(lease);
    });

    return grouped;
  }, [filteredDocuments]);

  // Get document stats
  const stats = useMemo(() => {
    return {
      total: documents.length,
      leases: documents.filter((d) => d.type === 'lease').length,
      templates: documents.filter((d) => d.type === 'template').length,
      receipts: documents.filter((d) => d.type === 'receipt').length,
      other: documents.filter((d) => ['insurance', 'inspection', 'notice', 'other'].includes(d.type)).length,
      pendingSignature: documents.filter((d) => d.signatureStatus === 'pending').length,
    };
  }, [documents]);

  // Document actions
  const handleView = (doc: Document) => {
    toast.info(`Opening ${doc.name}...`);
    // In a real app, this would open the document in a viewer
  };

  const handleDownload = (doc: Document) => {
    toast.success(`Downloading ${doc.name}...`);
    // In a real app, this would trigger a file download
  };

  const handleDelete = (doc: Document) => {
    if (confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success('Document deleted successfully');
    }
  };

  const handleUpload = (file: File, metadata: any) => {
    toast.success(`Document "${file.name}" uploaded successfully!`);
    // In a real app, this would upload to a server
  };

  // Helper to get property/tenant names
  const getPropertyName = (propertyId?: string) => {
    if (!propertyId) return undefined;
    return mockProperties.find((p) => p.id === propertyId)?.name;
  };

  const getTenantName = (tenantId?: string) => {
    if (!tenantId) return undefined;
    return mockTenants.find((t) => t.id === tenantId)?.name;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Manage leases, templates, receipts, and other important documents
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Documents</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Leases</CardDescription>
            <CardTitle className="text-2xl">{stats.leases}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Templates</CardDescription>
            <CardTitle className="text-2xl">{stats.templates}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Receipts</CardDescription>
            <CardTitle className="text-2xl">{stats.receipts}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Signature</CardDescription>
            <CardTitle className="text-2xl text-amber-600">{stats.pendingSignature}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <DocumentFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        propertyFilter={propertyFilter}
        onPropertyFilterChange={setPropertyFilter}
        signatureFilter={signatureFilter}
        onSignatureFilterChange={setSignatureFilter}
        properties={mockProperties}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="leases">Leases</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        {/* All Documents Tab */}
        <TabsContent value="all" className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No documents found</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {searchQuery || propertyFilter !== 'all' || signatureFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Upload your first document to get started'}
                </p>
                {!searchQuery && propertyFilter === 'all' && signatureFilter === 'all' && (
                  <Button onClick={() => setUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  propertyName={getPropertyName(doc.propertyId)}
                  tenantName={getTenantName(doc.tenantId)}
                  onView={handleView}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Leases Tab */}
        <TabsContent value="leases" className="space-y-6">
          {groupedLeases.size === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No lease documents found</h3>
                <p className="text-sm text-muted-foreground">
                  Upload lease agreements to see them here
                </p>
              </CardContent>
            </Card>
          ) : (
            Array.from(groupedLeases.entries()).map(([propertyId, leases]) => {
              const propertyName = getPropertyName(propertyId) || 'Unassigned';
              return (
                <div key={propertyId}>
                  <h3 className="text-lg font-semibold mb-3">{propertyName}</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {leases.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        propertyName={getPropertyName(doc.propertyId)}
                        tenantName={getTenantName(doc.tenantId)}
                        onView={handleView}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                <p className="text-sm text-muted-foreground">
                  Upload document templates to see them here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onView={handleView}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Receipts Tab */}
        <TabsContent value="receipts" className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No receipts found</h3>
                <p className="text-sm text-muted-foreground">
                  Payment receipts will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  propertyName={getPropertyName(doc.propertyId)}
                  tenantName={getTenantName(doc.tenantId)}
                  onView={handleView}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Other Tab */}
        <TabsContent value="other" className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No other documents found</h3>
                <p className="text-sm text-muted-foreground">
                  Insurance, inspection reports, and other documents will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  propertyName={getPropertyName(doc.propertyId)}
                  tenantName={getTenantName(doc.tenantId)}
                  onView={handleView}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleUpload}
      />
    </div>
  );
}
