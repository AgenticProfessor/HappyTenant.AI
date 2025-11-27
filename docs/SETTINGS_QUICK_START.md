# Settings Forms - Quick Start Guide

Get started with the Happy Tenant settings forms in 5 minutes.

## TL;DR - Copy & Paste

### 1. Import the forms you need:

```tsx
import {
  ProfileSettingsForm,
  OrganizationSettingsForm,
  NotificationPreferencesForm,
  PasswordChangeForm,
  PaymentMethodForm,
} from '@/components/settings';
```

### 2. Use them in your component:

```tsx
<ProfileSettingsForm
  defaultValues={{
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  }}
  avatarUrl="https://example.com/avatar.jpg"
  onSubmit={async (data) => {
    // Your API call here
    await fetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }}
/>
```

### 3. That's it!

The form handles:
- ✅ Validation
- ✅ Loading states
- ✅ Error messages
- ✅ Success toasts
- ✅ Accessibility

## Complete Example

Here's a full settings page with all forms:

```tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building2, Bell, CreditCard, Shield } from 'lucide-react';
import {
  ProfileSettingsForm,
  OrganizationSettingsForm,
  NotificationPreferencesForm,
  PasswordChangeForm,
  PaymentMethodForm,
} from '@/components/settings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="organization">
            <Building2 className="h-4 w-4 mr-2" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileSettingsForm
                defaultValues={{
                  firstName: 'John',
                  lastName: 'Doe',
                  email: 'john@example.com',
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <OrganizationSettingsForm
                defaultValues={{
                  name: 'My Company',
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationPreferencesForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentMethodForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <PasswordChangeForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## Common Use Cases

### Load data from API

```tsx
import { useEffect, useState } from 'react';

export default function MySettings() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch user data
    fetch('/api/user')
      .then(res => res.json())
      .then(setUserData);
  }, []);

  if (!userData) return <div>Loading...</div>;

  return (
    <ProfileSettingsForm
      defaultValues={userData}
      avatarUrl={userData.avatarUrl}
      onSubmit={async (data) => {
        await fetch('/api/user', {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      }}
    />
  );
}
```

### Handle errors

```tsx
<ProfileSettingsForm
  onSubmit={async (data) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Success toast is shown automatically
    } catch (error) {
      // Error toast is shown automatically
      console.error('Update failed:', error);
    }
  }}
/>
```

### Custom success handling

```tsx
import { toast } from 'sonner';

<ProfileSettingsForm
  onSubmit={async (data) => {
    await updateProfile(data);

    // Custom success message
    toast.success('Profile updated!', {
      description: 'Your changes have been saved.',
    });

    // Navigate somewhere
    router.push('/dashboard');
  }}
/>
```

## Props Reference

### ProfileSettingsForm
```tsx
interface ProfileSettingsFormProps {
  defaultValues?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    jobTitle?: string;
    timezone?: string;
  };
  avatarUrl?: string;
  onSubmit?: (data: ProfileFormValues) => Promise<void> | void;
}
```

### OrganizationSettingsForm
```tsx
interface OrganizationSettingsFormProps {
  defaultValues?: {
    name?: string;
    businessType?: 'individual' | 'llc' | 'corporation' | 'partnership' | 'other';
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
    website?: string;
    taxId?: string;
  };
  logoUrl?: string;
  onSubmit?: (data: OrganizationFormValues) => Promise<void> | void;
}
```

### NotificationPreferencesForm
```tsx
interface NotificationPreferencesFormProps {
  defaultValues?: {
    emailEnabled?: boolean;
    emailRentPayments?: boolean;
    emailPaymentReminders?: boolean;
    emailMaintenanceRequests?: boolean;
    emailLeaseExpirations?: boolean;
    emailMessagesFromTenants?: boolean;
    smsEnabled?: boolean;
    smsEmergencyMaintenance?: boolean;
    smsPaymentReceived?: boolean;
    smsCriticalAlerts?: boolean;
    pushEnabled?: boolean;
    pushAllActivity?: boolean;
    pushMessagesOnly?: boolean;
    pushOff?: boolean;
  };
  onSubmit?: (data: NotificationFormValues) => Promise<void> | void;
}
```

### PasswordChangeForm
```tsx
interface PasswordChangeFormProps {
  onSubmit?: (data: PasswordFormValues) => Promise<void> | void;
}
```

### PaymentMethodForm
```tsx
interface PaymentMethodFormProps {
  defaultValues?: {
    paymentType?: 'bank_account' | 'debit_card';
    accountHolderName?: string;
    routingNumber?: string;
    accountNumber?: string;
    confirmAccountNumber?: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
  };
  onSubmit?: (data: PaymentMethodFormValues) => Promise<void> | void;
}
```

## Validation

All forms use Zod schemas for validation. Import them if needed:

```tsx
import {
  profileSchema,
  organizationSchema,
  passwordSchema,
  notificationSchema,
  paymentMethodSchema,
} from '@/lib/schemas/settings';

// Use for server-side validation
const result = profileSchema.safeParse(data);
if (!result.success) {
  // Handle validation errors
  console.error(result.error);
}
```

## Styling

Forms use Tailwind CSS and inherit your theme. To customize:

```tsx
// Wrap in a container with custom styles
<div className="max-w-2xl mx-auto p-6">
  <ProfileSettingsForm {...props} />
</div>
```

## Next Steps

1. **Full Documentation:** See `/docs/SETTINGS_FORMS.md`
2. **Complete Example:** See `/src/app/(dashboard)/settings/example-enhanced-page.tsx`
3. **Implementation Details:** See `/docs/SETTINGS_IMPLEMENTATION_SUMMARY.md`

## Need Help?

Common issues:

**Form not submitting?**
- Check console for validation errors
- Ensure all required fields are filled

**Want to customize?**
- All forms accept custom `onSubmit` handlers
- Use `defaultValues` to pre-fill forms

**TypeScript errors?**
- Import types from `@/lib/schemas/settings`
- All forms are fully typed

---

**Happy coding!** The forms are production-ready and fully accessible.
