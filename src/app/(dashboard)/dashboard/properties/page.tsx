'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  MapPin,
  Home,
  Users,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
} from 'lucide-react';
import { mockProperties, mockUnits } from '@/data/mock-data';

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredProperties = mockProperties.filter((property) => {
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterType || property.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getPropertyUnits = (propertyId: string) => {
    return mockUnits.filter((unit) => unit.propertyId === propertyId);
  };

  const getOccupancyRate = (propertyId: string) => {
    const units = getPropertyUnits(propertyId);
    const occupied = units.filter((u) => u.status === 'occupied').length;
    return units.length > 0 ? Math.round((occupied / units.length) * 100) : 0;
  };

  const getMonthlyRevenue = (propertyId: string) => {
    const units = getPropertyUnits(propertyId);
    return units
      .filter((u) => u.status === 'occupied')
      .reduce((sum, u) => sum + u.rent, 0);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">
            Manage your {mockProperties.length} properties and {mockUnits.length} units
          </p>
        </div>
        <Button aria-label="Add a new property">
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Add Property
        </Button>
      </header>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-4" role="search" aria-label="Property search and filters">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="property-search" className="sr-only">Search properties</label>
          <Input
            id="property-search"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search properties by name or address"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" aria-label="Filter properties by type">
              <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
              {filterType || 'All Types'}
              <ChevronDown className="h-4 w-4 ml-2" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterType(null)}>
              All Types
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('single_family')}>
              Single Family
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('multi_family')}>
              Multi Family
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('apartment')}>
              Apartment
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType('condo')}>
              Condo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats cards */}
      <section aria-labelledby="property-stats-heading" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <h2 id="property-stats-heading" className="sr-only">Property Statistics</h2>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Properties
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProperties.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Units
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUnits.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Occupancy Rate
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (mockUnits.filter((u) => u.status === 'occupied').length / mockUnits.length) * 100
              )}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockUnits
                .filter((u) => u.status === 'occupied')
                .reduce((sum, u) => sum + u.rent, 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Properties grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProperties.map((property) => {
          const units = getPropertyUnits(property.id);
          const occupancy = getOccupancyRate(property.id);
          const revenue = getMonthlyRevenue(property.id);

          return (
            <Card key={property.id} className="overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-primary/30" />
                </div>
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Property
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge variant="secondary" className="capitalize">
                    {property.type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{property.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {property.address}, {property.city}, {property.state}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{units.length}</p>
                    <p className="text-xs text-muted-foreground">Units</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{occupancy}%</p>
                    <p className="text-xs text-muted-foreground">Occupied</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${(revenue / 1000).toFixed(1)}k</p>
                    <p className="text-xs text-muted-foreground">Monthly</p>
                  </div>
                </div>
                <Link href={`/dashboard/properties/${property.id}`}>
                  <Button variant="outline" className="w-full mt-4">
                    View Property
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}

        {/* Add property card */}
        <Card className="border-dashed flex items-center justify-center min-h-[300px]">
          <Button variant="ghost" className="h-full w-full flex-col gap-2">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <span className="font-medium">Add New Property</span>
            <span className="text-xs text-muted-foreground">
              Click to add a property
            </span>
          </Button>
        </Card>
      </div>
    </div>
  );
}
