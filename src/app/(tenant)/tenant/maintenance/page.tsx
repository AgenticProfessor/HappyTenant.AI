'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Camera,
  Sparkles,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import { mockMaintenanceRequests, mockTenants } from '@/data/mock-data';
import { toast } from 'sonner';

const currentTenant = mockTenants[0];

const maintenanceFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(20, 'Please provide at least 20 characters of detail').max(1000),
  category: z.enum(['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'pest', 'other']),
  priority: z.enum(['emergency', 'high', 'normal', 'low']),
  entryPermission: z.boolean(),
  preferredContactTimes: z.string().optional(),
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

export default function TenantMaintenancePage() {
  const [newRequestOpen, setNewRequestOpen] = useState(false);

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: undefined,
      priority: 'normal',
      entryPermission: false,
      preferredContactTimes: '',
    },
  });

  const tenantRequests = mockMaintenanceRequests.filter(
    (r) => r.tenantId === currentTenant.id
  );

  const openRequests = tenantRequests.filter((r) => r.status === 'open').length;
  const inProgressRequests = tenantRequests.filter((r) => r.status === 'in_progress').length;
  const completedRequests = tenantRequests.filter((r) => r.status === 'completed').length;

  const onSubmit = (data: MaintenanceFormValues) => {
    console.log('Maintenance request:', data);
    toast.success('Maintenance request submitted successfully!', {
      description: 'We will review your request and get back to you soon.',
    });
    form.reset();
    setNewRequestOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-amber-600" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100';
      case 'in_progress':
        return 'bg-amber-100';
      case 'completed':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground">
            Submit and track maintenance requests for your unit
          </p>
        </div>
        <Dialog open={newRequestOpen} onOpenChange={setNewRequestOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Maintenance Request</DialogTitle>
              <DialogDescription>
                Describe the issue and we&apos;ll get it resolved as soon as possible.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brief Description</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Leaking faucet in bathroom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          <SelectItem value="hvac">HVAC / Heating / Cooling</SelectItem>
                          <SelectItem value="appliance">Appliance</SelectItem>
                          <SelectItem value="structural">Structural</SelectItem>
                          <SelectItem value="pest">Pest Control</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          <SelectItem value="emergency">Emergency - Safety hazard or no water/heat</SelectItem>
                          <SelectItem value="high">High - Major inconvenience</SelectItem>
                          <SelectItem value="normal">Normal - Standard repair needed</SelectItem>
                          <SelectItem value="low">Low - Minor issue</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Please select emergency only for urgent safety issues
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide as much detail as possible about the issue..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Include when the issue started and any relevant details
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="entryPermission"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Permission to enter unit if I&apos;m not home
                        </FormLabel>
                        <FormDescription>
                          Allow maintenance staff to access your unit to complete repairs
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferredContactTimes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Contact Times (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Weekdays after 5pm" {...field} />
                      </FormControl>
                      <FormDescription>
                        When is the best time to reach you about this request?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Photos (Optional)</FormLabel>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 10MB (max 3 photos)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
                  <p className="text-sm">
                    Our AI will help categorize and prioritize your request for faster response
                  </p>
                </div>

                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => setNewRequestOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Submit Request
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Submitted
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{openRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{inProgressRequests}</div>
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedRequests}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests list */}
      <Card>
        <CardHeader>
          <CardTitle>Your Requests</CardTitle>
          <CardDescription>Track the status of your maintenance requests</CardDescription>
        </CardHeader>
        <CardContent>
          {tenantRequests.length > 0 ? (
            <div className="space-y-4">
              {tenantRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold">{request.title}</h3>
                      <Badge
                        variant={
                          request.priority === 'high' ? 'destructive' :
                          request.priority === 'normal' ? 'default' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {request.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {request.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {request.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Submitted {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:flex-col sm:items-stretch">
                    <Badge
                      variant={getStatusBadgeVariant(request.status)}
                      className="justify-center"
                    >
                      {request.status.replace('_', ' ')}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 font-semibold">No maintenance requests</h3>
              <p className="text-muted-foreground mt-1">
                You haven&apos;t submitted any maintenance requests yet.
              </p>
              <Button className="mt-4" onClick={() => setNewRequestOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Submit Your First Request
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency info */}
      <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Emergency Maintenance</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                For emergencies like gas leaks, flooding, or no heat in winter, call the emergency line immediately.
              </p>
              <p className="font-bold text-lg text-red-900 dark:text-red-100 mt-2">(555) 999-9999</p>
              <p className="text-xs text-red-700 dark:text-red-300">Available 24/7</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
