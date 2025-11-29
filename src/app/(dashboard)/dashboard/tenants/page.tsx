'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  DollarSign,
  ChevronDown,
  UserCheck,
  UserX,
  Clock,
} from 'lucide-react';
import { mockTenants, mockLeases, mockUnits, getPropertyById } from '@/data/mock-data';
import { useStewardContext } from '@/hooks/use-steward-context';

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');



  const filteredTenants = mockTenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterStatus || tenant.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getTenantLease = (tenantId: string) => {
    return mockLeases.find((l) => l.tenantId === tenantId && l.status === 'active');
  };

  const getUnitInfo = (unitId: string) => {
    const unit = mockUnits.find((u) => u.id === unitId);
    if (unit) {
      const property = getPropertyById(unit.propertyId);
      return { unit, property };
    }
    return null;
  };

  const activeTenants = mockTenants.filter((t) => t.status === 'active').length;
  const pendingTenants = mockTenants.filter((t) => t.status === 'pending').length;

  useStewardContext({
    type: 'page',
    name: 'tenants-list',
    description: 'List of all tenants',
    data: {
      totalTenants: mockTenants.length,
      activeTenants,
      pendingTenants,
    },
    url: '/dashboard/tenants',
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground">
            Manage your {mockTenants.length} tenants across all properties
          </p>
        </div>
        <Button aria-label="Add a new tenant">
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Add Tenant
        </Button>
      </header>

      {/* Stats */}
      <section aria-labelledby="tenant-stats-heading" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <h2 id="tenant-stats-heading" className="sr-only">Tenant Statistics</h2>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tenants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTenants.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeTenants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingTenants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Rent
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockLeases
                .filter((l) => l.status === 'active')
                .reduce((sum, l) => sum + l.rentAmount, 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4" role="search" aria-label="Tenant search and filters">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="tenant-search" className="sr-only">Search tenants</label>
          <Input
            id="tenant-search"
            placeholder="Search tenants by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search tenants by name or email"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" aria-label="Filter tenants by status">
              <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
              {filterStatus ? filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1) : 'All Status'}
              <ChevronDown className="h-4 w-4 ml-2" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus(null)}>
              All Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('active')}>
              Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('pending')}>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('past')}>
              Past
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex gap-1 border rounded-lg p-1" role="group" aria-label="View mode toggle">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
            aria-label="Grid view"
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            aria-pressed={viewMode === 'table'}
            aria-label="Table view"
          >
            Table
          </Button>
        </div>
      </div>

      {/* Tenants grid/table */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTenants.map((tenant) => {
            const lease = getTenantLease(tenant.id);
            const unitInfo = lease ? getUnitInfo(lease.unitId) : null;

            return (
              <Card key={tenant.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={tenant.avatarUrl} alt={tenant.name} />
                        <AvatarFallback>
                          {tenant.name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{tenant.name}</CardTitle>
                        <CardDescription className="text-xs">
                          Since {new Date(tenant.moveInDate).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={
                        tenant.status === 'active' ? 'default' :
                          tenant.status === 'pending' ? 'secondary' : 'outline'
                      }
                    >
                      {tenant.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {unitInfo && (
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-sm font-medium">{unitInfo.unit?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {unitInfo.property?.name}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{tenant.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{tenant.phone}</span>
                    </div>
                    {lease && (
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Monthly Rent</span>
                        <span className="font-semibold">${lease.rentAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <FileText className="h-4 w-4 mr-1" />
                        Lease
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Edit Tenant</DropdownMenuItem>
                          <DropdownMenuItem>Record Payment</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Remove Tenant</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Property / Unit</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => {
                const lease = getTenantLease(tenant.id);
                const unitInfo = lease ? getUnitInfo(lease.unitId) : null;

                return (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={tenant.avatarUrl} alt={tenant.name} />
                          <AvatarFallback>
                            {tenant.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{tenant.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Since {new Date(tenant.moveInDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {unitInfo ? (
                        <div>
                          <p className="text-sm">{unitInfo.property?.name}</p>
                          <p className="text-xs text-muted-foreground">{unitInfo.unit?.name}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{tenant.email}</p>
                        <p className="text-muted-foreground">{tenant.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {lease ? (
                        <span className="font-medium">${lease.rentAmount.toLocaleString()}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tenant.status === 'active' ? 'default' :
                            tenant.status === 'pending' ? 'secondary' : 'outline'
                        }
                      >
                        {tenant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                          <DropdownMenuItem>View Lease</DropdownMenuItem>
                          <DropdownMenuItem>Record Payment</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
