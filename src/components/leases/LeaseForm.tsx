'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, X, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { leaseSchema, type LeaseFormData } from '@/lib/schemas/lease';
import { Separator } from '@/components/ui/separator';

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Unit {
  id: string;
  unitNumber: string;
  name?: string;
  propertyId: string;
  marketRent: number;
}

interface LeaseFormProps {
  mode: 'create' | 'edit';
  tenants: Tenant[];
  units: Unit[];
  lease?: Partial<LeaseFormData> & { id?: string };
  preSelectedTenantId?: string;
  preSelectedUnitId?: string;
  onSave: (data: LeaseFormData) => void | Promise<void>;
  onCancel: () => void;
}

/**
 * LeaseForm component
 *
 * A comprehensive form for creating and editing leases including:
 * - Tenant and unit selection
 * - Lease dates (start/end)
 * - Rent and deposit amounts
 * - Payment terms
 * - Lease status
 * - Custom terms and notes
 *
 * Features:
 * - Full form validation with Zod
 * - React Hook Form integration
 * - Date pickers for lease dates
 * - Currency inputs with formatting
 * - Auto-fills rent amount based on unit selection
 * - Support for both create and edit modes
 * - Loading states and toast notifications
 */
export function LeaseForm({
  mode,
  tenants,
  units,
  lease,
  preSelectedTenantId,
  preSelectedUnitId,
  onSave,
  onCancel,
}: LeaseFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LeaseFormData>({
    resolver: zodResolver(leaseSchema),
    defaultValues: {
      tenantId: lease?.tenantId || preSelectedTenantId || '',
      unitId: lease?.unitId || preSelectedUnitId || '',
      leaseType: lease?.leaseType || 'fixed',
      startDate: lease?.startDate || undefined,
      endDate: lease?.endDate || undefined,
      rentAmount: lease?.rentAmount || 0,
      rentDueDay: lease?.rentDueDay || 1,
      securityDeposit: lease?.securityDeposit || 0,
      petDeposit: lease?.petDeposit || 0,
      lateFeeAmount: lease?.lateFeeAmount || 0,
      lateFeeGraceDays: lease?.lateFeeGraceDays || 5,
      status: lease?.status || 'draft',
      terms: lease?.terms || '',
      notes: lease?.notes || '',
    },
  });

  const leaseType = form.watch('leaseType');
  const selectedUnitId = form.watch('unitId');

  // Auto-fill rent amount when unit is selected
  const handleUnitChange = (unitId: string) => {
    const selectedUnit = units.find((u) => u.id === unitId);
    if (selectedUnit && mode === 'create') {
      form.setValue('rentAmount', selectedUnit.marketRent);
      form.setValue('securityDeposit', selectedUnit.marketRent);
    }
  };

  const handleSubmit = async (data: LeaseFormData) => {
    setIsLoading(true);

    try {
      await onSave(data);

      toast.success(
        mode === 'create' ? 'Lease created successfully' : 'Lease updated successfully',
        {
          description: `Lease has been ${mode === 'create' ? 'created' : 'updated'}.`,
        }
      );
    } catch (error) {
      toast.error(`Failed to ${mode === 'create' ? 'create' : 'update'} lease`, {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Tenant and Unit Selection */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Lease Assignment</h3>
            <p className="text-sm text-muted-foreground">
              Select the tenant and unit for this lease.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Tenant Selection */}
            <FormField
              control={form.control}
              name="tenantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={mode === 'edit'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tenant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.firstName} {tenant.lastName} ({tenant.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Unit Selection */}
            <FormField
              control={form.control}
              name="unitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleUnitChange(value);
                    }}
                    defaultValue={field.value}
                    disabled={mode === 'edit'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name || unit.unitNumber} - ${unit.marketRent.toLocaleString()}/mo
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Lease Terms */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Lease Terms</h3>
            <p className="text-sm text-muted-foreground">
              Configure the lease duration and type.
            </p>
          </div>

          {/* Lease Type */}
          <FormField
            control={form.control}
            name="leaseType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lease Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lease type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Term</SelectItem>
                    <SelectItem value="month_to_month">Month-to-Month</SelectItem>
                    <SelectItem value="week_to_week">Week-to-Week</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Fixed term leases have a specific end date. Month-to-month leases renew automatically.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            {/* Start Date */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date */}
            {leaseType === 'fixed' && (
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            form.getValues('startDate')
                              ? date < form.getValues('startDate')!
                              : false
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Lease Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lease Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_signature">Pending Signature</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                    <SelectItem value="renewed">Renewed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Financial Terms */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Financial Terms</h3>
            <p className="text-sm text-muted-foreground">
              Set the rent amount and deposit requirements.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Rent Amount */}
            <FormField
              control={form.control}
              name="rentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Rent</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="2000"
                        className="pl-7"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rent Due Day */}
            <FormField
              control={form.control}
              name="rentDueDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rent Due Day</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="28"
                      placeholder="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormDescription>Day of the month (1-28)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Security Deposit */}
            <FormField
              control={form.control}
              name="securityDeposit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Security Deposit</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="2000"
                        className="pl-7"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pet Deposit */}
            <FormField
              control={form.control}
              name="petDeposit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pet Deposit</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="500"
                        className="pl-7"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Late Fee Amount */}
            <FormField
              control={form.control}
              name="lateFeeAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Late Fee Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="50"
                        className="pl-7"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Late Fee Grace Days */}
            <FormField
              control={form.control}
              name="lateFeeGraceDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Late Fee Grace Days</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="30"
                      placeholder="5"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>Days after due date before late fee applies</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Additional Information */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Additional Information</h3>
            <p className="text-sm text-muted-foreground">
              Add custom terms or notes for this lease.
            </p>
          </div>

          {/* Custom Terms */}
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Terms</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter any custom lease terms or conditions..."
                    className="min-h-[100px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  These terms will be included in the lease agreement.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Internal Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Internal Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Internal notes about this lease..."
                    className="min-h-[80px] resize-y"
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
                {mode === 'create' ? 'Creating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {mode === 'create' ? 'Create Lease' : 'Save Changes'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
