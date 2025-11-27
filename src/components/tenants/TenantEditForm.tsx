'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { tenantSchema, type TenantFormData } from '@/lib/schemas/tenant';
import { Separator } from '@/components/ui/separator';

interface TenantEditFormProps {
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
    notes?: string;
    employerName?: string;
    monthlyIncome?: number;
  };
  onSave: (data: TenantFormData) => void | Promise<void>;
  onCancel: () => void;
}

/**
 * TenantEditForm component
 *
 * A comprehensive form for editing tenant information including:
 * - Basic contact details (name, email, phone)
 * - Emergency contact information
 * - Employment details
 * - Additional notes
 *
 * Features:
 * - Full form validation with Zod
 * - React Hook Form integration
 * - Loading states
 * - Toast notifications
 * - Accessible form controls
 */
export function TenantEditForm({ tenant, onSave, onCancel }: TenantEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      firstName: tenant.firstName || '',
      lastName: tenant.lastName || '',
      email: tenant.email || '',
      phone: tenant.phone || '',
      emergencyContactName: tenant.emergencyContactName || '',
      emergencyContactPhone: tenant.emergencyContactPhone || '',
      emergencyContactRelationship: tenant.emergencyContactRelationship || '',
      notes: tenant.notes || '',
      employerName: tenant.employerName || '',
      monthlyIncome: tenant.monthlyIncome || undefined,
    },
  });

  const handleSubmit = async (data: TenantFormData) => {
    setIsLoading(true);

    try {
      await onSave(data);

      toast.success('Tenant updated successfully', {
        description: `${data.firstName} ${data.lastName}'s information has been updated.`,
      });
    } catch (error) {
      toast.error('Failed to update tenant', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Basic Information</h3>
            <p className="text-sm text-muted-foreground">
              Update the tenant's basic contact information.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* First Name */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john.smith@email.com" {...field} />
                </FormControl>
                <FormDescription>
                  This email will be used for lease documents and communications.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="(512) 555-1234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Emergency Contact Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Emergency Contact</h3>
            <p className="text-sm text-muted-foreground">
              Contact information for emergencies.
            </p>
          </div>

          {/* Emergency Contact Name */}
          <FormField
            control={form.control}
            name="emergencyContactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            {/* Emergency Contact Phone */}
            <FormField
              control={form.control}
              name="emergencyContactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="(512) 555-5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Emergency Contact Relationship */}
            <FormField
              control={form.control}
              name="emergencyContactRelationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship</FormLabel>
                  <FormControl>
                    <Input placeholder="Spouse, Parent, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Employment Information Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Employment Information</h3>
            <p className="text-sm text-muted-foreground">
              Optional employment details for records.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Employer Name */}
            <FormField
              control={form.control}
              name="employerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corporation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Monthly Income */}
            <FormField
              control={form.control}
              name="monthlyIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Income</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="5000"
                        className="pl-7"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : parseFloat(value));
                        }}
                        value={field.value || ''}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Notes Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Additional Notes</h3>
            <p className="text-sm text-muted-foreground">
              Any additional information about this tenant.
            </p>
          </div>

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional notes about this tenant..."
                    className="min-h-[100px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Internal notes that will not be visible to the tenant.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
