'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users2,
  Plus,
  Search,
  Phone,
  Mail,
  Star,
  Clock,
  Briefcase,
  ChevronDown,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  Palmtree,
  Filter,
  Building2,
  Wrench,
  Zap,
  Snowflake,
  Hammer,
  Key,
  Bug,
  Sparkles,
  Trees,
  HardHat,
  PaintBucket,
  Paintbrush,
} from 'lucide-react';
import { mockVendors } from '@/data/mock-data';
import { VENDOR_CATEGORIES, type Vendor, type VendorCategory } from '@/types/vendor';
import { AddVendorDialog } from '@/components/vendors/AddVendorDialog';

// Helper function to get category icon
const getCategoryIcon = (category: string) => {
  const icons: Record<string, typeof Wrench> = {
    plumbing: Wrench,
    electrical: Zap,
    hvac: Snowflake,
    appliance: Building2,
    general_handyman: Hammer,
    locksmith: Key,
    pest_control: Bug,
    cleaning: Sparkles,
    landscaping: Trees,
    roofing: HardHat,
    flooring: Building2,
    painting: Paintbrush,
  };
  return icons[category] || Wrench;
};

// Star rating component
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-muted text-muted'
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
};

export default function VendorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPriceTier, setFilterPriceTier] = useState<string | null>(null);
  const [addVendorOpen, setAddVendorOpen] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors as unknown as Vendor[]);

  const handleVendorAdded = (newVendor: Vendor) => {
    setVendors((prev) => [newVendor, ...prev]);
  };

  // Filter vendors based on search and filters
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesSearch =
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.contactName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !filterCategory || vendor.categories.includes(filterCategory as VendorCategory);
      const matchesStatus = !filterStatus || vendor.status === filterStatus;
      const matchesPriceTier = !filterPriceTier || vendor.priceTier === filterPriceTier;

      return matchesSearch && matchesCategory && matchesStatus && matchesPriceTier;
    });
  }, [vendors, searchQuery, filterCategory, filterStatus, filterPriceTier]);

  // Calculate stats
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter((v) => v.status === 'active').length;
  const averageRating = vendors.length > 0 ? vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length : 0;
  const uniqueCategories = new Set(vendors.flatMap((v) => v.categories)).size;

  // Get status badge variant and icon
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return {
          variant: 'default' as const,
          icon: <CheckCircle2 className="h-3 w-3" />,
          className: 'bg-green-100 text-green-700 border-green-200',
        };
      case 'inactive':
        return {
          variant: 'secondary' as const,
          icon: <AlertCircle className="h-3 w-3" />,
          className: 'bg-gray-100 text-gray-700 border-gray-200',
        };
      case 'on_vacation':
        return {
          variant: 'outline' as const,
          icon: <Palmtree className="h-3 w-3" />,
          className: 'bg-amber-100 text-amber-700 border-amber-200',
        };
      default:
        return {
          variant: 'outline' as const,
          icon: null,
          className: '',
        };
    }
  };

  // Get price tier badge
  const getPriceTierBadge = (tier: string) => {
    switch (tier) {
      case 'budget':
        return { label: 'Budget', className: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'mid':
        return { label: 'Mid', className: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'premium':
        return { label: 'Premium', className: 'bg-amber-100 text-amber-700 border-amber-200' };
      default:
        return { label: tier, className: '' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">
            Manage your vendor network for maintenance and repairs
          </p>
        </div>
        <Button onClick={() => setAddVendorOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </header>

      <AddVendorDialog
        open={addVendorOpen}
        onOpenChange={setAddVendorOpen}
        onVendorAdded={handleVendorAdded}
      />

      {/* Stats Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Vendors
            </CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVendors}</div>
            <p className="text-xs text-muted-foreground">In your network</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Vendors
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeVendors}</div>
            <p className="text-xs text-muted-foreground">Available now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories Covered
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCategories}</div>
            <p className="text-xs text-muted-foreground">Service types</p>
          </CardContent>
        </Card>
      </section>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by vendor name or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterCategory || 'all'} onValueChange={(value) => setFilterCategory(value === 'all' ? null : value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {VENDOR_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus || 'all'} onValueChange={(value) => setFilterStatus(value === 'all' ? null : value)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="on_vacation">On Vacation</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPriceTier || 'all'} onValueChange={(value) => setFilterPriceTier(value === 'all' ? null : value)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All Tiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="budget">Budget</SelectItem>
            <SelectItem value="mid">Mid-Range</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vendor Cards */}
      {filteredVendors.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVendors.map((vendor) => {
            const statusBadge = getStatusBadge(vendor.status);
            const priceTierBadge = getPriceTierBadge(vendor.priceTier);

            return (
              <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{vendor.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {vendor.contactName}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Vendor</DropdownMenuItem>
                        <DropdownMenuItem>Assign to Job</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Mark Inactive</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Badge className={statusBadge.className}>
                      {statusBadge.icon}
                      <span className="ml-1">
                        {vendor.status === 'on_vacation'
                          ? 'On Vacation'
                          : vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                      </span>
                    </Badge>
                    <Badge className={priceTierBadge.className}>
                      {priceTierBadge.label}
                    </Badge>
                    {vendor.emergencyAvailable && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        24/7
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{vendor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1">
                    {vendor.categories.map((category) => {
                      const Icon = getCategoryIcon(category);
                      const categoryInfo = VENDOR_CATEGORIES.find((c) => c.value === category);
                      return (
                        <Badge
                          key={category}
                          variant="secondary"
                          className="text-xs"
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {categoryInfo?.label || category}
                        </Badge>
                      );
                    })}
                  </div>

                  {/* Rating */}
                  <div className="pt-2 border-t">
                    <StarRating rating={vendor.rating} />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Jobs</p>
                      <p className="text-sm font-semibold">{vendor.totalJobs}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">On-Time</p>
                      <p className="text-sm font-semibold">
                        {vendor.onTimePercentage}%
                      </p>
                    </div>
                  </div>

                  {/* Hourly Rate */}
                  {vendor.hourlyRate && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Hourly Rate</span>
                        <span className="font-semibold">${vendor.hourlyRate}/hr</span>
                      </div>
                      {vendor.minimumCharge && (
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-muted-foreground">Minimum</span>
                          <span>${vendor.minimumCharge}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        // Empty State
        <Card>
          <CardContent className="p-12 text-center">
            <Users2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold">No vendors found</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery || filterCategory || filterStatus || filterPriceTier
                ? 'No vendors match your current filters. Try adjusting your search criteria.'
                : 'Get started by adding your first vendor to the network.'}
            </p>
            {!searchQuery && !filterCategory && !filterStatus && !filterPriceTier && (
              <Button className="mt-4" onClick={() => setAddVendorOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Vendor
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
