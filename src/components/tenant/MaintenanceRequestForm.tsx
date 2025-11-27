'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
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
import { Loader2, Send, AlertCircle, Upload, X } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  maintenanceRequestSchema,
  type MaintenanceRequestFormData,
} from '@/lib/schemas/maintenance';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MaintenanceRequestFormProps {
  unitId: string;
  tenantId: string;
  onSubmit: (data: MaintenanceRequestFormData) => void | Promise<void>;
  onCancel?: () => void;
}

/**
 * MaintenanceRequestForm component
 *
 * A comprehensive form for tenants to submit maintenance requests including:
 * - Title and detailed description
 * - Category selection (Plumbing, Electrical, HVAC, etc.)
 * - Priority level selection
 * - Entry permission options
 * - Preferred contact method
 * - Photo upload placeholder
 *
 * Features:
 * - Full form validation with Zod
 * - React Hook Form integration
 * - Emergency request highlighting
 * - Entry permission with instructions
 * - Loading states and toast notifications
 * - Accessible form controls
 *
 * @example
 * ```tsx
 * <MaintenanceRequestForm
 *   unitId={currentUnit.id}
 *   tenantId={currentTenant.id}
 *   onSubmit={async (data) => {
 *     await submitMaintenanceRequest(data);
 *   }}
 * />
 * ```
 */
export function MaintenanceRequestForm({
  unitId,
  tenantId,
  onSubmit,
  onCancel,
}: MaintenanceRequestFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<MaintenanceRequestFormData>({
    resolver: zodResolver(maintenanceRequestSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'other',
      priority: 'medium',
      entryPermissionGranted: false,
      entryInstructions: '',
      preferredContactMethod: 'in_app',
      photos: [],
    },
  });

  const priority = form.watch('priority');
  const entryPermission = form.watch('entryPermissionGranted');

  const handleSubmit = async (data: MaintenanceRequestFormData) => {
    setIsLoading(true);

    try {
      await onSubmit(data);

      toast.success('Maintenance request submitted', {
        description: 'Your request has been sent to the property manager.',
      });

      // Reset form after successful submission
      form.reset();
    } catch (error) {
      toast.error('Failed to submit request', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      plumbing: 'Plumbing',
      electrical: 'Electrical',
      hvac: 'HVAC/Climate Control',
      appliance: 'Appliance',
      structural: 'Structural',
      pest_control: 'Pest Control',
      landscaping: 'Landscaping',
      cleaning: 'Cleaning',
      other: 'Other',
    };
    return labels[category] || category;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      emergency: 'text-red-600 dark:text-red-400',
      high: 'text-orange-600 dark:text-orange-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      low: 'text-blue-600 dark:text-blue-400',
    };
    return colors[priority] || '';
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Emergency Alert */}
        {priority === 'emergency' && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <h4 className="font-medium text-red-900 dark:text-red-100">
                Emergency Request
              </h4>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                For life-threatening emergencies, please call 911 immediately. For urgent property
                emergencies outside business hours, call the emergency hotline: (512) 555-0911
              </p>
            </div>
          </div>
        )}

        {/* Request Details */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Request Details</h3>
            <p className="text-sm text-muted-foreground">
              Provide a clear description of the maintenance issue.
            </p>
          </div>

          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brief Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Kitchen faucet leaking"
                    {...field}
                  />
                </FormControl>
                <FormDescription>A short summary of the issue</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="hvac">HVAC/Climate Control</SelectItem>
                      <SelectItem value="appliance">Appliance</SelectItem>
                      <SelectItem value="structural">Structural</SelectItem>
                      <SelectItem value="pest_control">Pest Control</SelectItem>
                      <SelectItem value="landscaping">Landscaping</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="emergency">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-xs">Emergency</Badge>
                          <span className="text-xs text-muted-foreground">Immediate danger</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-orange-500 text-xs">High</Badge>
                          <span className="text-xs text-muted-foreground">Urgent, 24-48 hours</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">Normal</Badge>
                          <span className="text-xs text-muted-foreground">Within a week</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">Low</Badge>
                          <span className="text-xs text-muted-foreground">When convenient</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Detailed Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Detailed Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please provide as much detail as possible about the issue, including when it started, what symptoms you're experiencing, and any relevant context..."
                    className="min-h-[120px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Include when the issue started, specific symptoms, and any relevant details
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Entry Permission */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Access Information</h3>
            <p className="text-sm text-muted-foreground">
              Let us know if we can access the unit to address this issue.
            </p>
          </div>

          {/* Entry Permission Checkbox */}
          <FormField
            control={form.control}
            name="entryPermissionGranted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Grant permission to enter the unit if I'm not home
                  </FormLabel>
                  <FormDescription>
                    Checking this allows maintenance staff to access your unit to address the issue
                    if you're not available.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Entry Instructions */}
          {entryPermission && (
            <FormField
              control={form.control}
              name="entryInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry Instructions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Key is with building manager, please text before entering, pets will be secured in bedroom..."
                      className="min-h-[80px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Any special instructions for accessing your unit
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Separator />

        {/* Contact Preferences */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Contact Preferences</h3>
            <p className="text-sm text-muted-foreground">
              How would you like to receive updates about this request?
            </p>
          </div>

          {/* Preferred Contact Method */}
          <FormField
            control={form.control}
            name="preferredContactMethod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Preferred Contact Method</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid gap-3 md:grid-cols-2"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="in_app" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        In-App Notifications
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="email" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Email
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="sms" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        SMS/Text
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="phone" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Phone Call
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Photo Upload Placeholder */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Photos (Optional)</h3>
            <p className="text-sm text-muted-foreground">
              Add photos to help illustrate the issue.
            </p>
          </div>

          <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">
                Photo upload coming soon
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                For now, you can attach photos by email after submitting this request
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
