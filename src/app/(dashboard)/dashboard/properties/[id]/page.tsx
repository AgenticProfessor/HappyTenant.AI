'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Home,
  Users,
  DollarSign,
  Edit,
  MoreHorizontal,
  Plus,
  Wrench,
  MessageSquare,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getPropertyById, mockUnits, mockTenants, mockLeases, mockMaintenanceRequests } from '@/data/mock-data';

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const property = getPropertyById(propertyId);

  if (!property) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Property not found</h2>
          <p className="text-muted-foreground mt-2">The property you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/dashboard/properties">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const units = mockUnits.filter((u) => u.propertyId === propertyId);
  const occupiedUnits = units.filter((u) => u.status === 'occupied');
  const vacantUnits = units.filter((u) => u.status === 'vacant');
  const monthlyRevenue = occupiedUnits.reduce((sum, u) => sum + u.rent, 0);
  const propertyMaintenanceRequests = mockMaintenanceRequests.filter(
    (r) => units.some((u) => u.id === r.unitId)
  );

  const getUnitTenant = (unitId: string) => {
    const lease = mockLeases.find((l) => l.unitId === unitId && l.status === 'active');
    if (lease) {
      return mockTenants.find((t) => t.id === lease.tenantId);
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/properties">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{property.name}</h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {property.address}, {property.city}, {property.state} {property.zipCode}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Property
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Listing</DropdownMenuItem>
              <DropdownMenuItem>Generate Report</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete Property</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Units
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{units.length}</div>
            <p className="text-xs text-muted-foreground">
              {occupiedUnits.length} occupied, {vacantUnits.length} vacant
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Occupancy Rate
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {units.length > 0 ? Math.round((occupiedUnits.length / units.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {occupiedUnits.length} of {units.length} units occupied
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {occupiedUnits.length} occupied units
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Requests
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {propertyMaintenanceRequests.filter((r) => r.status === 'open').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Maintenance requests pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="units" className="space-y-4">
        <TabsList>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
        </TabsList>

        <TabsContent value="units" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Units ({units.length})</h2>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Unit
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => {
              const tenant = getUnitTenant(unit.id);
              return (
                <Card key={unit.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{unit.name}</CardTitle>
                      <Badge
                        variant={unit.status === 'occupied' ? 'default' : unit.status === 'vacant' ? 'secondary' : 'outline'}
                      >
                        {unit.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {unit.bedrooms} bed • {unit.bathrooms} bath • {unit.squareFeet} sqft
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Rent</span>
                        <span className="font-semibold">${unit.rent.toLocaleString()}/mo</span>
                      </div>
                      {tenant ? (
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={tenant.avatarUrl} alt={tenant.name} />
                            <AvatarFallback>
                              {tenant.name.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{tenant.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{tenant.email}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-muted/50 text-center">
                          <p className="text-sm text-muted-foreground">No tenant assigned</p>
                          <Button variant="link" size="sm" className="mt-1">
                            Add Tenant
                          </Button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <FileText className="h-4 w-4 mr-1" />
                          Lease
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Maintenance Requests</h2>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Request
            </Button>
          </div>

          {propertyMaintenanceRequests.length > 0 ? (
            <div className="space-y-3">
              {propertyMaintenanceRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          request.priority === 'high' ? 'bg-red-100' :
                          request.priority === 'normal' ? 'bg-amber-100' : 'bg-blue-100'
                        }`}>
                          <Wrench className={`h-5 w-5 ${
                            request.priority === 'high' ? 'text-red-600' :
                            request.priority === 'normal' ? 'text-amber-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{request.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Unit {request.unitId} • {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm mt-1">{request.description}</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          request.status === 'open' ? 'destructive' :
                          request.status === 'in_progress' ? 'default' : 'secondary'
                        }
                      >
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Wrench className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No maintenance requests</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Documents</h2>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No documents uploaded yet</p>
              <Button variant="outline" className="mt-4">
                Upload First Document
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Financial Overview</h2>
            <Button variant="outline" size="sm">
              Generate Report
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Income (YTD)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  ${(monthlyRevenue * 11).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Expenses (YTD)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">
                  ${Math.round(monthlyRevenue * 11 * 0.3).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Net Operating Income</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  ${Math.round(monthlyRevenue * 11 * 0.7).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
