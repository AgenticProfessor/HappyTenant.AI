'use client';

/**
 * Enhanced Settings Page Example
 *
 * This file demonstrates how to integrate all the new settings form components.
 * You can replace the content of page.tsx with this code or use it as a reference.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User,
  Building2,
  Bell,
  CreditCard,
  Shield,
} from 'lucide-react';
import { mockUser, mockOrganization } from '@/data/mock-data';

// Import all settings form components
import {
  ProfileSettingsForm,
  OrganizationSettingsForm,
  NotificationPreferencesForm,
  PasswordChangeForm,
  PaymentMethodForm,
} from '@/components/settings';

export default function EnhancedSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

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
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Payment
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
            <CardContent>
              <ProfileSettingsForm
                defaultValues={{
                  firstName: mockUser.name.split(' ')[0],
                  lastName: mockUser.name.split(' ')[1] || '',
                  email: mockUser.email,
                  phone: '(512) 555-0123',
                  jobTitle: 'Property Manager',
                  timezone: 'America/Chicago',
                }}
                avatarUrl={mockUser.avatarUrl}
                onSubmit={async (data) => {
                  // Handle profile update
                  console.log('Profile update:', data);
                }}
              />
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
            <CardContent>
              <OrganizationSettingsForm
                defaultValues={{
                  name: mockOrganization.name,
                  businessType: 'individual',
                  addressLine1: '123 Main Street',
                  city: 'Austin',
                  state: 'TX',
                  zipCode: '78701',
                  phone: '(512) 555-9999',
                  website: 'https://mitchellproperties.com',
                  taxId: '12-3456789',
                }}
                onSubmit={async (data) => {
                  // Handle organization update
                  console.log('Organization update:', data);
                }}
              />
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
            <CardContent>
              <NotificationPreferencesForm
                defaultValues={{
                  emailEnabled: true,
                  emailRentPayments: true,
                  emailPaymentReminders: true,
                  emailMaintenanceRequests: true,
                  emailLeaseExpirations: true,
                  emailMessagesFromTenants: true,
                  smsEnabled: false,
                  smsEmergencyMaintenance: true,
                  smsPaymentReceived: false,
                  smsCriticalAlerts: true,
                  pushEnabled: true,
                  pushAllActivity: false,
                  pushMessagesOnly: true,
                  pushOff: false,
                }}
                onSubmit={async (data) => {
                  // Handle notification preferences update
                  console.log('Notification preferences update:', data);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Method */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Receiving Method</CardTitle>
              <CardDescription>
                Configure how you want to receive rental payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentMethodForm
                onSubmit={async (data) => {
                  // Handle payment method update
                  console.log('Payment method update:', data);
                }}
              />
            </CardContent>
          </Card>

          {/* Current Plan Card */}
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
              <PasswordChangeForm
                onSubmit={async (data) => {
                  // Handle password change
                  console.log('Password change requested');
                }}
              />
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
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Two-factor authentication is currently disabled. Enable it to add an extra layer of security.
                </p>
                <Button variant="outline">Enable Two-Factor Authentication</Button>
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
