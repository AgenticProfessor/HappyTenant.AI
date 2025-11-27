'use client';

import { use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PropertyHeader } from '@/components/properties/PropertyHeader';
import { UnitCard } from '@/components/properties/UnitCard';
import { PropertyFinancials } from '@/components/properties/PropertyFinancials';
import {
  mockProperties,
  mockUnits,
  mockLeases,
  mockTenants,
  mockTransactions,
  mockMaintenanceRequests,
} from '@/data/mock-data';
import {
  Building2,
  Calendar,
  MapPin,
  Ruler,
  Upload,
  FileText,
  Wrench,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface PropertyDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  const { id } = use(params);

  // Find property
  const property = mockProperties.find((p) => p.id === id);

  // If property not found, show 404-style message
  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Building2 className="h-16 w-16 text-muted-foreground opacity-50" />
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Property Not Found</h1>
          <p className="text-muted-foreground">
            The property you're looking for doesn't exist or has been removed.
          </p>
        </div>
        <Button asChild>
          <a href="/dashboard/properties">Back to Properties</a>
        </Button>
      </div>
    );
  }

  // Get related data
  const propertyUnits = mockUnits.filter((u) => u.propertyId === id);
  const occupiedUnits = propertyUnits.filter((u) => u.status === 'occupied');
  const vacantUnits = propertyUnits.filter((u) => u.status === 'vacant');
  const propertyTransactions = mockTransactions.filter((t) => t.propertyId === id);

  // Get maintenance requests for this property's units
  const propertyMaintenanceRequests = mockMaintenanceRequests.filter((m) =>
    propertyUnits.some((u) => u.id === m.unitId)
  );

  // Calculate financials
  const monthlyRevenue = occupiedUnits.reduce((sum, u) => sum + u.rent, 0);
  const potentialRevenue = propertyUnits.reduce((sum, u) => sum + u.rent, 0);
  const occupancyRate =
    propertyUnits.length > 0 ? Math.round((occupiedUnits.length / propertyUnits.length) * 100) : 0;

  // Get year built and square footage (mock data doesn't have these, so we'll use defaults)
  const yearBuilt = 2010;
  const totalSquareFeet = propertyUnits.reduce((sum, u) => sum + (u.squareFeet || 0), 0);

  // Get tenant information for units
  const getUnitTenant = (unitId: string) => {
    const lease = mockLeases.find((l) => l.unitId === unitId && l.status === 'active');
    if (!lease) return null;
    return mockTenants.find((t) => t.id === lease.tenantId);
  };

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'in_progress':
        return 'default';
      case 'completed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getMaintenanceStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'emergency':
        return 'destructive';
      case 'normal':
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Property Header */}
      <PropertyHeader
        name={property.name}
        address={property.address}
        city={property.city}
        state={property.state}
        zipCode={property.zipCode}
        type={property.type}
        status="active"
        onEdit={() => {
          // TODO: Implement edit functionality
          console.log('Edit property');
        }}
      />

      {/* Photo Gallery */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg h-64 flex items-center justify-center">
              <Building2 className="h-24 w-24 text-primary/30" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-lg h-30 md:h-30 flex items-center justify-center">
                <Building2 className="h-12 w-12 text-secondary/30" />
              </div>
              <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-lg h-30 md:h-30 flex items-center justify-center">
                <Building2 className="h-12 w-12 text-secondary/30" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="units">Units ({propertyUnits.length})</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="maintenance">
            Maintenance ({propertyMaintenanceRequests.length})
          </TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
                <CardDescription>Basic information about this property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Property Type</p>
                    <p className="font-medium capitalize">{property.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Units</p>
                    <p className="font-medium">{propertyUnits.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Year Built</p>
                    <p className="font-medium">{yearBuilt}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sq Ft</p>
                    <p className="font-medium">{totalSquareFeet.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address & Map */}
            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
                <CardDescription>Property location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{property.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {property.city}, {property.state} {property.zipCode}
                      </p>
                    </div>
                  </div>
                  {/* Map placeholder */}
                  <div className="bg-muted rounded-lg h-40 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Map placeholder</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Occupancy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{occupancyRate}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Occupied Units
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{occupiedUnits.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Vacant Units
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{vacantUnits.length}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Units Tab */}
        <TabsContent value="units" className="space-y-4">
          {propertyUnits.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                <p className="text-muted-foreground">No units found for this property</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {propertyUnits.map((unit) => {
                const tenant = getUnitTenant(unit.id);
                return (
                  <UnitCard
                    key={unit.id}
                    id={unit.id}
                    name={unit.name}
                    bedrooms={unit.bedrooms}
                    bathrooms={unit.bathrooms}
                    squareFeet={unit.squareFeet}
                    rent={unit.rent}
                    status={unit.status}
                    tenantName={tenant?.name}
                    tenantId={tenant?.id}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Financials Tab */}
        <TabsContent value="financials">
          <PropertyFinancials
            totalUnits={propertyUnits.length}
            occupiedUnits={occupiedUnits.length}
            vacantUnits={vacantUnits.length}
            monthlyRevenue={monthlyRevenue}
            potentialRevenue={potentialRevenue}
            occupancyRate={occupancyRate}
            recentTransactions={propertyTransactions}
          />
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Requests</CardTitle>
              <CardDescription>
                Recent maintenance requests for this property
              </CardDescription>
            </CardHeader>
            <CardContent>
              {propertyMaintenanceRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Wrench className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground">No maintenance requests</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {propertyMaintenanceRequests.map((request) => {
                      const unit = mockUnits.find((u) => u.id === request.unitId);
                      return (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.title}</TableCell>
                          <TableCell>{unit?.name || 'Unknown'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {request.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPriorityColor(request.priority)} className="capitalize">
                              {request.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getMaintenanceStatusColor(request.status)}
                              className="capitalize gap-1"
                            >
                              {getMaintenanceStatusIcon(request.status)}
                              {request.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(request.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Property Documents</CardTitle>
              <CardDescription>Store and manage property-related documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 space-y-4">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <div>
                  <p className="text-muted-foreground mb-4">No documents uploaded yet</p>
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Document
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
