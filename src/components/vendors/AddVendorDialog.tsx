'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { VENDOR_CATEGORIES, PRICE_TIERS, type VendorCategory, type Vendor } from '@/types/vendor';

const vendorFormSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Please enter a valid email'),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
  serviceArea: z.string().min(1, 'Enter at least one service area'),
  priceTier: z.enum(['budget', 'mid', 'premium']),
  hourlyRate: z.string().optional(),
  minimumCharge: z.string().optional(),
  preferredContactMethod: z.enum(['phone', 'text', 'email']),
  emergencyAvailable: z.boolean(),
  emergencyPhone: z.string().optional(),
  callInstructions: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  // If emergency available is true, emergency phone is required
  if (data.emergencyAvailable && !data.emergencyPhone) {
    return false;
  }
  return true;
}, {
  message: 'Emergency phone is required when emergency available is checked',
  path: ['emergencyPhone'],
});

type VendorFormValues = z.infer<typeof vendorFormSchema>;

interface AddVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVendorAdded: (vendor: Vendor) => void;
}

export function AddVendorDialog({ open, onOpenChange, onVendorAdded }: AddVendorDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: '',
      contactName: '',
      phone: '',
      email: '',
      categories: [],
      serviceArea: '',
      priceTier: 'mid',
      hourlyRate: '',
      minimumCharge: '',
      preferredContactMethod: 'phone',
      emergencyAvailable: false,
      emergencyPhone: '',
      callInstructions: '',
      notes: '',
    },
  });

  const emergencyAvailable = form.watch('emergencyAvailable');

  const onSubmit = async (data: VendorFormValues) => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Parse service area from comma-separated string to array
    const serviceAreaArray = data.serviceArea
      .split(',')
      .map(area => area.trim())
      .filter(area => area.length > 0);

    // Create working hours object (simplified for now)
    const workingHours = {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
      saturday: null,
      sunday: null,
    };

    const newVendor: Vendor = {
      id: `vendor-${Date.now()}`,
      organizationId: 'org-1',
      name: data.name,
      contactName: data.contactName,
      phone: data.phone,
      email: data.email,
      categories: data.categories as VendorCategory[],
      serviceArea: serviceAreaArray,
      workingHours,
      emergencyAvailable: data.emergencyAvailable,
      emergencyPhone: data.emergencyPhone || undefined,
      hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : undefined,
      minimumCharge: data.minimumCharge ? parseFloat(data.minimumCharge) : undefined,
      priceTier: data.priceTier,
      rating: 0,
      totalJobs: 0,
      onTimePercentage: 0,
      preferredContactMethod: data.preferredContactMethod,
      callInstructions: data.callInstructions || undefined,
      status: 'active',
      notes: data.notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onVendorAdded(newVendor);

    toast.success('Vendor added successfully!', {
      description: `${data.name} has been added to your vendor network.`,
    });

    // Reset form
    form.reset();
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-primary" />
            Add New Vendor
          </DialogTitle>
          <DialogDescription>
            Add a new vendor to your network. Fill in the details below to get started.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Basic Information</h4>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Mike's Plumbing" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Mike Johnson" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(512) 555-1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="mike@plumbing.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Categories Section */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-muted-foreground">Service Categories</h4>

              <FormField
                control={form.control}
                name="categories"
                render={() => (
                  <FormItem>
                    <FormLabel>Categories *</FormLabel>
                    <FormDescription>
                      Select all categories that apply to this vendor
                    </FormDescription>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {VENDOR_CATEGORIES.map((category) => (
                        <FormField
                          key={category.value}
                          control={form.control}
                          name="categories"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={category.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(category.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, category.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== category.value
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {category.icon} {category.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Service Details Section */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-muted-foreground">Service Details</h4>

              <FormField
                control={form.control}
                name="serviceArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Area *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="78701, 78702, Austin, Round Rock"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter zip codes or city names, separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priceTier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Tier *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a price tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRICE_TIERS.map((tier) => (
                          <SelectItem key={tier.value} value={tier.value}>
                            {tier.label} - {tier.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            className="pl-7"
                            placeholder="75.00"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimumCharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Charge</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            className="pl-7"
                            placeholder="100.00"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="preferredContactMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Contact Method *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contact method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="text">Text Message</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Availability Section */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-muted-foreground">Availability</h4>

              <FormField
                control={form.control}
                name="emergencyAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Available for Emergency Calls
                      </FormLabel>
                      <FormDescription>
                        Check this if the vendor is available for after-hours emergencies
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {emergencyAvailable && (
                <FormField
                  control={form.control}
                  name="emergencyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Phone *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(512) 555-9999" {...field} />
                      </FormControl>
                      <FormDescription>
                        After-hours emergency contact number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Note: Full working hours scheduling will be available in a future update. Default hours are Monday-Friday, 9 AM - 5 PM.
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-muted-foreground">Additional Information</h4>

              <FormField
                control={form.control}
                name="callInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ask for Mike, mention property management account..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Special instructions for contacting this vendor
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes about this vendor..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Internal notes (not visible to vendor)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Vendor
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
