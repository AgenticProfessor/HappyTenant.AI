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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start">
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
      </Tabs>
    </div>
  );
}
