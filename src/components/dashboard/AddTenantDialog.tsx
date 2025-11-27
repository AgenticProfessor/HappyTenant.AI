'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Users, Loader2, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Property {
  id: string;
  name: string;
  units: number;
}

interface Unit {
  id: string;
  propertyId: string;
  name: string;
  rent: number;
  status: string;
}

interface Tenant {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'past';
  moveInDate: string;
  avatarUrl?: string;
}

interface AddTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTenantAdded: (tenant: Tenant, lease?: { unitId: string; startDate: string; endDate: string; rentAmount: number }) => void;
  properties: Property[];
  units: Unit[];
}

export function AddTenantDialog({ open, onOpenChange, onTenantAdded, properties, units }: AddTenantDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    unitId: '',
    rentAmount: '',
  });
  const [leaseStartDate, setLeaseStartDate] = useState<Date>();
  const [leaseEndDate, setLeaseEndDate] = useState<Date>();

  // Filter units based on selected property and only show vacant units
  const availableUnits = useMemo(() => {
    if (!formData.propertyId) return [];
    return units.filter((unit) => unit.propertyId === formData.propertyId && unit.status === 'vacant');
  }, [formData.propertyId, units]);

  // Auto-fill rent when unit is selected
  const handleUnitChange = (unitId: string) => {
    const selectedUnit = units.find((u) => u.id === unitId);
    setFormData({
      ...formData,
      unitId,
      rentAmount: selectedUnit ? selectedUnit.rent.toString() : '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      organizationId: 'org-1',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      status: formData.unitId ? 'active' : 'pending',
      moveInDate: leaseStartDate ? format(leaseStartDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
    };

    const lease = formData.unitId && leaseStartDate && leaseEndDate ? {
      unitId: formData.unitId,
      startDate: format(leaseStartDate, 'yyyy-MM-dd'),
      endDate: format(leaseEndDate, 'yyyy-MM-dd'),
      rentAmount: parseInt(formData.rentAmount),
    } : undefined;

    onTenantAdded(newTenant, lease);

    toast.success('Tenant added successfully!', {
      description: `${formData.name} has been added${formData.unitId ? ' and assigned to a unit' : ''}.`,
    });

    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      propertyId: '',
      unitId: '',
      rentAmount: '',
    });
    setLeaseStartDate(undefined);
    setLeaseEndDate(undefined);
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Add New Tenant
          </DialogTitle>
          <DialogDescription>
            Add a new tenant to your portfolio. You can optionally assign them to a unit with a lease.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Tenant Info Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>

              {/* Full Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.smith@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Phone */}
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(512) 555-1234"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Lease Assignment Section (Optional) */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-muted-foreground">Lease Assignment (Optional)</h4>

              {/* Property Selection */}
              <div className="grid gap-2">
                <Label htmlFor="property">Property</Label>
                <Select
                  value={formData.propertyId}
                  onValueChange={(value) => setFormData({ ...formData, propertyId: value, unitId: '', rentAmount: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Unit Selection */}
              {formData.propertyId && (
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unit</Label>
                  {availableUnits.length > 0 ? (
                    <Select
                      value={formData.unitId}
                      onValueChange={handleUnitChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUnits.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name} - ${unit.rent}/mo
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">No vacant units available in this property</p>
                  )}
                </div>
              )}

              {/* Lease Dates */}
              {formData.unitId && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>Lease Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'justify-start text-left font-normal',
                              !leaseStartDate && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {leaseStartDate ? format(leaseStartDate, 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={leaseStartDate}
                            onSelect={setLeaseStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid gap-2">
                      <Label>Lease End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'justify-start text-left font-normal',
                              !leaseEndDate && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {leaseEndDate ? format(leaseEndDate, 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={leaseEndDate}
                            onSelect={setLeaseEndDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Rent Amount */}
                  <div className="grid gap-2">
                    <Label htmlFor="rentAmount">Monthly Rent</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="rentAmount"
                        type="number"
                        className="pl-7"
                        value={formData.rentAmount}
                        onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Tenant
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
