'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  User,
  Building2,
  Bell,
  CreditCard,
  Shield,
  Upload,
  Check,
  Mail,
  Phone,
  MapPin,
  Link2,
  Users,
  Plus,
  Settings2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Send,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { mockUser, mockOrganization } from '@/data/mock-data';

// Profile form schema
const profileFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

// Organization form schema
const organizationFormSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

// Security form schema
const securityFormSchema = z.object({
  currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type OrganizationFormValues = z.infer<typeof organizationFormSchema>;
type SecurityFormValues = z.infer<typeof securityFormSchema>;

// Types for integrations
interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'accounting' | 'payments' | 'communication' | 'marketing' | 'other';
  connected: boolean;
  lastSync?: string;
}

// Types for team members
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  joinedAt?: string;
  avatar?: string;
}

// Mock integrations data
const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'QuickBooks',
    description: 'Sync your financial data with QuickBooks for seamless accounting',
    icon: '📊',
    category: 'accounting',
    connected: true,
    lastSync: '2 hours ago'
  },
  {
    id: '2',
    name: 'Stripe',
    description: 'Accept online payments from tenants via credit card',
    icon: '💳',
    category: 'payments',
    connected: true,
    lastSync: 'Just now'
  },
  {
    id: '3',
    name: 'Plaid',
    description: 'Connect bank accounts for ACH rent payments',
    icon: '🏦',
    category: 'payments',
    connected: true,
    lastSync: '1 hour ago'
  },
  {
    id: '4',
    name: 'Mailchimp',
    description: 'Send marketing emails and newsletters to leads',
    icon: '📧',
    category: 'marketing',
    connected: false
  },
  {
    id: '5',
    name: 'Twilio',
    description: 'Send SMS notifications and reminders to tenants',
    icon: '📱',
    category: 'communication',
    connected: true,
    lastSync: '30 minutes ago'
  },
  {
    id: '6',
    name: 'Google Calendar',
    description: 'Sync showings and maintenance appointments',
    icon: '📅',
    category: 'other',
    connected: false
  },
  {
    id: '7',
    name: 'Zillow',
    description: 'Automatically post listings to Zillow',
    icon: '🏠',
    category: 'marketing',
    connected: false
  },
  {
    id: '8',
    name: 'DocuSign',
    description: 'Send documents for electronic signature',
    icon: '✍️',
    category: 'other',
    connected: true,
    lastSync: '1 day ago'
  },
  {
    id: '9',
    name: 'Xero',
    description: 'Sync your financial data with Xero',
    icon: '💰',
    category: 'accounting',
    connected: false
  },
  {
    id: '10',
    name: 'Slack',
    description: 'Get notifications in your Slack workspace',
    icon: '💬',
    category: 'communication',
    connected: false
  }
];

// Mock team members data
const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'owner',
    status: 'active',
    joinedAt: 'Jan 1, 2024'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'admin',
    status: 'active',
    joinedAt: 'Mar 15, 2024'
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike@example.com',
    role: 'manager',
    status: 'active',
    joinedAt: 'Jun 1, 2024'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@example.com',
    role: 'viewer',
    status: 'pending',
    joinedAt: 'Nov 20, 2024'
  }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailRentPayments: true,
    emailMaintenanceRequests: true,
    emailLeaseRenewals: true,
    emailMessages: true,
    smsRentPayments: false,
    smsMaintenanceRequests: true,
    smsLeaseRenewals: false,
    pushRentPayments: true,
    pushMaintenanceRequests: true,
    pushMessages: true,
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Integrations state
  const [integrations, setIntegrations] = useState(mockIntegrations);
  const [integrationCategory, setIntegrationCategory] = useState('all');

  // Team members state
  const [teamMembers, setTeamMembers] = useState(mockTeamMembers);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('viewer');

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: mockUser.name.split(' ')[0],
      lastName: mockUser.name.split(' ')[1] || '',
      email: mockUser.email,
      phone: '(512) 555-0123',
    },
  });

  // Organization form
  const organizationForm = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: mockOrganization.name,
      addressLine1: '123 Main Street',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
    },
  });

  // Security form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    toast.success('Profile updated successfully');
    console.log('Profile data:', data);
  };

  const onOrganizationSubmit = (data: OrganizationFormValues) => {
    toast.success('Organization settings updated successfully');
    console.log('Organization data:', data);
  };

  const onSecuritySubmit = (data: SecurityFormValues) => {
    toast.success('Password changed successfully');
    securityForm.reset();
    console.log('Security data:', data);
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success('Notification preferences updated');
  };

  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast.success(
      twoFactorEnabled
        ? 'Two-factor authentication disabled'
        : 'Two-factor authentication enabled'
    );
  };

  // Integration handlers
  const handleConnectIntegration = (id: string) => {
    setIntegrations(integrations.map(i =>
      i.id === id ? { ...i, connected: true, lastSync: 'Just now' } : i
    ));
    toast.success('Integration connected successfully');
  };

  const handleDisconnectIntegration = (id: string) => {
    setIntegrations(integrations.map(i =>
      i.id === id ? { ...i, connected: false, lastSync: undefined } : i
    ));
    toast.success('Integration disconnected');
  };

  const handleSyncIntegration = (id: string) => {
    setIntegrations(integrations.map(i =>
      i.id === id ? { ...i, lastSync: 'Just now' } : i
    ));
    toast.success('Sync completed');
  };

  // Team member handlers
  const handleInviteTeamMember = () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }
    const newMember: TeamMember = {
      id: String(teamMembers.length + 1),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'pending',
      joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setTeamMembers([...teamMembers, newMember]);
    setInviteDialogOpen(false);
    setInviteEmail('');
    setInviteRole('viewer');
    toast.success('Invitation sent successfully');
  };

  const handleRemoveTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
    toast.success('Team member removed');
  };

  const handleChangeRole = (id: string, newRole: TeamMember['role']) => {
    setTeamMembers(teamMembers.map(m =>
      m.id === id ? { ...m, role: newRole } : m
    ));
    toast.success('Role updated successfully');
  };

  // Filter integrations
  const filteredIntegrations = integrationCategory === 'all'
    ? integrations
    : integrations.filter(i => i.category === integrationCategory);

  const getRoleBadgeColor = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner': return 'bg-purple-500';
      case 'admin': return 'bg-blue-500';
      case 'manager': return 'bg-green-500';
      case 'viewer': return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="organization" className="gap-2">
            <Building2 className="h-4 w-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Link2 className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar section */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={mockUser.avatarUrl} alt={mockUser.name} />
                  <AvatarFallback className="text-2xl">
                    {mockUser.name.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Profile form */}
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={profileForm.control}
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
                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          This is the email address associated with your account
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="tel"
                              placeholder="(555) 123-4567"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit">
                      <Check className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Settings */}
        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription>
                Manage your organization details and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Organization logo */}
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    PNG or SVG. Recommended size 512x512px.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Organization form */}
              <Form {...organizationForm}>
                <form
                  onSubmit={organizationForm.handleSubmit(onOrganizationSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={organizationForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Properties" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={organizationForm.control}
                    name="addressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="123 Main Street"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField
                      control={organizationForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Austin" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={organizationForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="TX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={organizationForm.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="78701" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">
                      <Check className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Preferences */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about important events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email notifications */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Email Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Rent Payments</Label>
                        <p className="text-xs text-muted-foreground">
                          Get notified when rent is paid or overdue
                        </p>
                      </div>
                      <Switch
                        checked={notifications.emailRentPayments}
                        onCheckedChange={() => handleNotificationChange('emailRentPayments')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Maintenance Requests</Label>
                        <p className="text-xs text-muted-foreground">
                          Get notified about new maintenance requests
                        </p>
                      </div>
                      <Switch
                        checked={notifications.emailMaintenanceRequests}
                        onCheckedChange={() => handleNotificationChange('emailMaintenanceRequests')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Lease Renewals</Label>
                        <p className="text-xs text-muted-foreground">
                          Get reminded about upcoming lease expirations
                        </p>
                      </div>
                      <Switch
                        checked={notifications.emailLeaseRenewals}
                        onCheckedChange={() => handleNotificationChange('emailLeaseRenewals')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Messages</Label>
                        <p className="text-xs text-muted-foreground">
                          Get notified about new messages from tenants
                        </p>
                      </div>
                      <Switch
                        checked={notifications.emailMessages}
                        onCheckedChange={() => handleNotificationChange('emailMessages')}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* SMS notifications */}
                <div>
                  <h3 className="text-sm font-medium mb-3">SMS Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Rent Payments</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive text alerts for payment events
                        </p>
                      </div>
                      <Switch
                        checked={notifications.smsRentPayments}
                        onCheckedChange={() => handleNotificationChange('smsRentPayments')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Maintenance Requests</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive text alerts for urgent maintenance
                        </p>
                      </div>
                      <Switch
                        checked={notifications.smsMaintenanceRequests}
                        onCheckedChange={() => handleNotificationChange('smsMaintenanceRequests')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Lease Renewals</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive text reminders for lease renewals
                        </p>
                      </div>
                      <Switch
                        checked={notifications.smsLeaseRenewals}
                        onCheckedChange={() => handleNotificationChange('smsLeaseRenewals')}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Push notifications */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Push Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Rent Payments</Label>
                        <p className="text-xs text-muted-foreground">
                          Get browser push notifications for payments
                        </p>
                      </div>
                      <Switch
                        checked={notifications.pushRentPayments}
                        onCheckedChange={() => handleNotificationChange('pushRentPayments')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Maintenance Requests</Label>
                        <p className="text-xs text-muted-foreground">
                          Get push notifications for maintenance
                        </p>
                      </div>
                      <Switch
                        checked={notifications.pushMaintenanceRequests}
                        onCheckedChange={() => handleNotificationChange('pushMaintenanceRequests')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Messages</Label>
                        <p className="text-xs text-muted-foreground">
                          Get push notifications for new messages
                        </p>
                      </div>
                      <Switch
                        checked={notifications.pushMessages}
                        onCheckedChange={() => handleNotificationChange('pushMessages')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Manage your subscription and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start justify-between p-6 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">
                      {mockOrganization.subscriptionTier === 'pro' ? 'Pro Plan' : 'Free Plan'}
                    </h3>
                    <Badge>Current Plan</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Unlimited properties, advanced analytics, and priority support
                  </p>
                  <p className="text-2xl font-bold mt-2">$49/month</p>
                </div>
                <Button variant="outline">Upgrade Plan</Button>
              </div>

              <Separator />

              {/* Usage stats */}
              <div>
                <h3 className="text-sm font-medium mb-4">Usage This Month</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Properties</p>
                    <p className="text-2xl font-bold mt-1">3</p>
                    <p className="text-xs text-muted-foreground mt-1">of unlimited</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Active Tenants</p>
                    <p className="text-2xl font-bold mt-1">5</p>
                    <p className="text-xs text-muted-foreground mt-1">of unlimited</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-xs text-muted-foreground">AI Credits</p>
                    <p className="text-2xl font-bold mt-1">847</p>
                    <p className="text-xs text-muted-foreground mt-1">of 1,000</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment method */}
              <div>
                <h3 className="text-sm font-medium mb-4">Payment Method</h3>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Visa ending in 4242</p>
                      <p className="text-xs text-muted-foreground">Expires 12/2025</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Billing history */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">Billing History</h3>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="space-y-2">
                  {[
                    { date: 'Nov 1, 2024', amount: '$49.00', status: 'Paid' },
                    { date: 'Oct 1, 2024', amount: '$49.00', status: 'Paid' },
                    { date: 'Sep 1, 2024', amount: '$49.00', status: 'Paid' },
                  ].map((invoice, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="text-sm font-medium">{invoice.date}</p>
                        <p className="text-xs text-muted-foreground">Monthly subscription</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium">{invoice.amount}</p>
                        <Badge variant="outline" className="text-xs">
                          {invoice.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form
                  onSubmit={securityForm.handleSubmit(onSecuritySubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={securityForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={securityForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Must be at least 8 characters long
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={securityForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit">
                      <Check className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require a verification code in addition to your password when signing in
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handleTwoFactorToggle}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions that affect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/50 bg-destructive/5">
                <div>
                  <p className="text-sm font-medium">Delete Account</p>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Integrations</CardTitle>
                  <CardDescription>
                    Connect third-party services to enhance your workflow
                  </CardDescription>
                </div>
                <Select value={integrationCategory} onValueChange={setIntegrationCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="accounting">Accounting</SelectItem>
                    <SelectItem value="payments">Payments</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className={`p-4 rounded-lg border ${
                      integration.connected ? 'border-green-200 bg-green-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{integration.icon}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{integration.name}</h4>
                            {integration.connected && (
                              <Badge className="bg-green-500 text-xs">Connected</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {integration.description}
                          </p>
                          {integration.lastSync && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Last synced: {integration.lastSync}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {integration.connected ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSyncIntegration(integration.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Sync
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Settings2 className="h-4 w-4 mr-1" />
                            Settings
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDisconnectIntegration(integration.id)}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleConnectIntegration(integration.id)}
                        >
                          <Link2 className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Connected Integrations Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">
                      {integrations.filter(i => i.connected).length}
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">Connected</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-gray-400" />
                    <span className="font-semibold">
                      {integrations.filter(i => !i.connected).length}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Available</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">
                      {integrations.filter(i => i.connected && i.lastSync === 'Just now').length}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">Recently Synced</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold">{integrations.length}</span>
                  </div>
                  <p className="text-sm text-purple-700 mt-1">Total Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage who has access to your organization
                  </CardDescription>
                </div>
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to add a new team member
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="inviteEmail">Email Address</Label>
                        <Input
                          id="inviteEmail"
                          type="email"
                          placeholder="colleague@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="inviteRole">Role</Label>
                        <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TeamMember['role'])}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin - Full access</SelectItem>
                            <SelectItem value="manager">Manager - Manage properties & tenants</SelectItem>
                            <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          {inviteRole === 'admin' && 'Full access to all features including billing and team management'}
                          {inviteRole === 'manager' && 'Can manage properties, tenants, maintenance, and payments'}
                          {inviteRole === 'viewer' && 'Can view all data but cannot make changes'}
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleInviteTeamMember}>
                        <Send className="h-4 w-4 mr-2" />
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.role === 'owner' ? (
                          <Badge className={getRoleBadgeColor(member.role)}>
                            Owner
                          </Badge>
                        ) : (
                          <Select
                            value={member.role}
                            onValueChange={(v) => handleChangeRole(member.id, v as TeamMember['role'])}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status === 'active' ? 'Active' :
                           member.status === 'pending' ? 'Pending' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.joinedAt}</TableCell>
                      <TableCell className="text-right">
                        {member.role !== 'owner' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRemoveTeamMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Role Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>
                Overview of what each role can do
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Permission</TableHead>
                      <TableHead className="text-center">Owner</TableHead>
                      <TableHead className="text-center">Admin</TableHead>
                      <TableHead className="text-center">Manager</TableHead>
                      <TableHead className="text-center">Viewer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { permission: 'View Dashboard', owner: true, admin: true, manager: true, viewer: true },
                      { permission: 'Manage Properties', owner: true, admin: true, manager: true, viewer: false },
                      { permission: 'Manage Tenants', owner: true, admin: true, manager: true, viewer: false },
                      { permission: 'Handle Payments', owner: true, admin: true, manager: true, viewer: false },
                      { permission: 'Send Messages', owner: true, admin: true, manager: true, viewer: false },
                      { permission: 'View Reports', owner: true, admin: true, manager: true, viewer: true },
                      { permission: 'Manage Team', owner: true, admin: true, manager: false, viewer: false },
                      { permission: 'Manage Billing', owner: true, admin: true, manager: false, viewer: false },
                      { permission: 'Delete Organization', owner: true, admin: false, manager: false, viewer: false },
                    ].map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{row.permission}</TableCell>
                        <TableCell className="text-center">
                          {row.owner ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.admin ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.manager ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.viewer ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
