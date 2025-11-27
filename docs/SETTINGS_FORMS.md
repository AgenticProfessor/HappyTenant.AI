# Settings Forms Documentation

This document provides comprehensive information about the settings and preferences forms implemented in the Happy Tenant application.

## Overview

The settings forms provide a complete solution for managing user profiles, organization settings, notifications, payment methods, and security preferences. All forms are built with:

- **React Hook Form** for form state management
- **Zod** for validation schemas
- **shadcn/ui** components for consistent UI
- **TypeScript** for type safety
- **Sonner** for toast notifications

## File Structure

```
src/
├── lib/schemas/settings.ts              # Zod validation schemas
├── components/settings/
│   ├── ProfileSettingsForm.tsx          # User profile form
│   ├── OrganizationSettingsForm.tsx     # Organization settings form
│   ├── NotificationPreferencesForm.tsx  # Notification preferences form
│   ├── PasswordChangeForm.tsx           # Password change form
│   ├── PaymentMethodForm.tsx            # Payment method form
│   └── index.ts                         # Barrel export
└── app/(dashboard)/settings/
    ├── page.tsx                         # Current settings page
    └── example-enhanced-page.tsx        # Enhanced example implementation
```

## Components

### 1. ProfileSettingsForm

Manages user profile information with avatar upload.

**Features:**
- Avatar upload with preview (2MB limit, JPG/PNG/GIF)
- First name and last name inputs
- Email with format validation
- Optional phone number
- Optional job title
- Timezone selector
- Dirty state tracking (shows unsaved changes warning)
- Loading state on submit

**Props:**
```typescript
interface ProfileSettingsFormProps {
  defaultValues?: Partial<ProfileFormValues>;
  avatarUrl?: string;
  onSubmit?: (data: ProfileFormValues) => Promise<void> | void;
}
```

**Usage:**
```tsx
import { ProfileSettingsForm } from '@/components/settings';

<ProfileSettingsForm
  defaultValues={{
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    jobTitle: 'Property Manager',
    timezone: 'America/New_York',
  }}
  avatarUrl="https://example.com/avatar.jpg"
  onSubmit={async (data) => {
    // Handle profile update
    await updateProfile(data);
  }}
/>
```

**Validation:**
- First name: Min 2 characters
- Last name: Min 2 characters
- Email: Valid email format
- Phone: Optional
- Job title: Optional
- Timezone: Optional, defaults to America/New_York

---

### 2. OrganizationSettingsForm

Manages organization/company settings with logo upload.

**Features:**
- Organization logo upload (PNG/SVG recommended, 512x512px)
- Organization name
- Business type dropdown (Individual, LLC, Corporation, Partnership, Other)
- Complete address fields (line 1, line 2, city, state, zip)
- Phone number
- Website URL with validation
- Optional Tax ID/EIN
- Loading state on submit

**Props:**
```typescript
interface OrganizationSettingsFormProps {
  defaultValues?: Partial<OrganizationFormValues>;
  logoUrl?: string;
  onSubmit?: (data: OrganizationFormValues) => Promise<void> | void;
}
```

**Usage:**
```tsx
import { OrganizationSettingsForm } from '@/components/settings';

<OrganizationSettingsForm
  defaultValues={{
    name: 'Acme Properties',
    businessType: 'llc',
    addressLine1: '123 Main St',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    phone: '(555) 999-8888',
    website: 'https://acmeproperties.com',
    taxId: '12-3456789',
  }}
  logoUrl="https://example.com/logo.png"
  onSubmit={async (data) => {
    // Handle organization update
    await updateOrganization(data);
  }}
/>
```

**Validation:**
- Organization name: Min 2 characters
- Business type: Optional enum
- Website: Valid URL format or empty
- All other fields: Optional

---

### 3. NotificationPreferencesForm

Comprehensive notification settings with master toggles and individual controls.

**Features:**
- **Email Notifications** section with master toggle:
  - Rent payments received
  - Payment reminders
  - Maintenance requests
  - Lease expirations
  - Messages from tenants
- **SMS Notifications** section with master toggle:
  - Emergency maintenance
  - Payment received
  - Critical alerts
- **Push Notifications** section with master toggle:
  - All activity (radio-style behavior)
  - Messages only
  - Off
- Individual toggles for each notification type
- Loading state on submit

**Props:**
```typescript
interface NotificationPreferencesFormProps {
  defaultValues?: Partial<NotificationFormValues>;
  onSubmit?: (data: NotificationFormValues) => Promise<void> | void;
}
```

**Usage:**
```tsx
import { NotificationPreferencesForm } from '@/components/settings';

<NotificationPreferencesForm
  defaultValues={{
    emailEnabled: true,
    emailRentPayments: true,
    emailPaymentReminders: true,
    smsEnabled: false,
    smsEmergencyMaintenance: true,
    pushEnabled: true,
    pushMessagesOnly: true,
  }}
  onSubmit={async (data) => {
    // Handle notification preferences update
    await updateNotificationPreferences(data);
  }}
/>
```

**Validation:**
- All fields are boolean with sensible defaults
- No complex validation needed

---

### 4. PasswordChangeForm

Secure password change form with strength indicator and show/hide toggles.

**Features:**
- Current password field (required)
- New password field with complexity validation
- Confirm password field (must match new password)
- Real-time password strength indicator with visual progress bar
- Show/hide toggles for all password fields
- Password strength levels: Weak, Fair, Good, Strong
- Form auto-clears on success
- Loading state on submit

**Props:**
```typescript
interface PasswordChangeFormProps {
  onSubmit?: (data: PasswordFormValues) => Promise<void> | void;
}
```

**Usage:**
```tsx
import { PasswordChangeForm } from '@/components/settings';

<PasswordChangeForm
  onSubmit={async (data) => {
    // Handle password change
    await changePassword(data);
  }}
/>
```

**Validation:**
- Current password: Min 8 characters
- New password:
  - Min 8 characters
  - Must contain uppercase letter
  - Must contain lowercase letter
  - Must contain number
  - Must be different from current password
- Confirm password: Must match new password

**Password Strength Calculation:**
- Length >= 8: +20 points
- Length >= 12: +20 points
- Contains lowercase: +15 points
- Contains uppercase: +15 points
- Contains number: +15 points
- Contains special character: +15 points

**Strength Levels:**
- 0-39: Weak (red)
- 40-59: Fair (orange)
- 60-79: Good (yellow)
- 80+: Strong (green)

---

### 5. PaymentMethodForm

Payment method configuration for receiving rental payments via Stripe.

**Features:**
- **Payment type selection** (Bank Account or Debit Card)
- Visual toggle between payment types
- **Bank Account fields:**
  - Account holder name
  - Routing number (9 digits)
  - Account number (masked)
  - Confirm account number
  - Auto-validation that numbers match
- **Debit Card fields:**
  - Card number (formatted with spaces)
  - Expiry date (MM/YY format)
  - CVV (3-4 digits, masked)
- Stripe security notice
- Auto-formatting for card numbers and expiry dates
- Input masking for sensitive fields
- Loading state on submit

**Props:**
```typescript
interface PaymentMethodFormProps {
  defaultValues?: Partial<PaymentMethodFormValues>;
  onSubmit?: (data: PaymentMethodFormValues) => Promise<void> | void;
}
```

**Usage:**
```tsx
import { PaymentMethodForm } from '@/components/settings';

<PaymentMethodForm
  defaultValues={{
    paymentType: 'bank_account',
  }}
  onSubmit={async (data) => {
    // Handle payment method setup
    await setupPaymentMethod(data);
  }}
/>
```

**Validation:**
- Routing number: Exactly 9 digits
- Account number: Min 4 characters
- Confirm account number: Must match account number
- Card number: Exactly 16 digits
- Expiry date: MM/YY format validation
- CVV: 3-4 digits

---

## Validation Schemas

All validation schemas are located in `/src/lib/schemas/settings.ts`:

```typescript
// Available schemas:
export const profileSchema: ZodSchema<ProfileFormValues>
export const organizationSchema: ZodSchema<OrganizationFormValues>
export const passwordSchema: ZodSchema<PasswordFormValues>
export const notificationSchema: ZodSchema<NotificationFormValues>
export const paymentMethodSchema: ZodSchema<PaymentMethodFormValues>

// Type exports:
export type ProfileFormValues
export type OrganizationFormValues
export type PasswordFormValues
export type NotificationFormValues
export type PaymentMethodFormValues
```

## Integration Example

See `/src/app/(dashboard)/settings/example-enhanced-page.tsx` for a complete integration example showing all forms in a tabbed layout.

Basic structure:

```tsx
import {
  ProfileSettingsForm,
  OrganizationSettingsForm,
  NotificationPreferencesForm,
  PasswordChangeForm,
  PaymentMethodForm,
} from '@/components/settings';

export default function SettingsPage() {
  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="organization">Organization</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="payment">Payment</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileSettingsForm {...profileProps} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Add other tabs similarly */}
    </Tabs>
  );
}
```

## Accessibility

All forms follow accessibility best practices:

- Proper ARIA labels on all inputs
- Error messages linked to inputs via `aria-describedby`
- Keyboard navigation support
- Focus management
- Screen reader friendly error messages
- Semantic HTML structure

## Best Practices

1. **Error Handling**: Always wrap form submissions in try-catch blocks
2. **Loading States**: Use the built-in loading states to prevent double submissions
3. **Validation**: Leverage the Zod schemas for both client and server-side validation
4. **Toast Notifications**: Forms show success/error toasts automatically
5. **Data Persistence**: Forms track dirty state to warn about unsaved changes
6. **Security**: Sensitive fields (passwords, account numbers) are masked

## Customization

All forms accept optional `onSubmit` handlers, allowing you to:

- Integrate with your API
- Add custom validation
- Transform data before submission
- Handle errors differently
- Track analytics

Example with custom submission:

```tsx
<ProfileSettingsForm
  defaultValues={userData}
  onSubmit={async (data) => {
    // Custom analytics
    trackEvent('profile_updated', { userId: user.id });

    // Transform data
    const transformed = {
      ...data,
      fullName: `${data.firstName} ${data.lastName}`,
    };

    // API call
    const response = await fetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(transformed),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
  }}
/>
```

## Testing

Forms can be tested using React Testing Library:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileSettingsForm } from '@/components/settings';

test('submits profile form', async () => {
  const handleSubmit = jest.fn();

  render(<ProfileSettingsForm onSubmit={handleSubmit} />);

  fireEvent.change(screen.getByLabelText('First Name'), {
    target: { value: 'John' },
  });

  fireEvent.click(screen.getByText('Save Changes'));

  await waitFor(() => {
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: 'John' })
    );
  });
});
```

## Troubleshooting

**Form not submitting:**
- Check browser console for validation errors
- Ensure all required fields are filled
- Verify onSubmit handler is async if making API calls

**Validation errors not showing:**
- Ensure form has been touched (user has interacted with fields)
- Check that error messages are not hidden by CSS

**Loading state stuck:**
- Always use try-finally blocks to reset loading state
- Check that promises are properly resolved/rejected

## Future Enhancements

Potential improvements:

- [ ] Add profile photo cropping tool
- [ ] Support for multiple payment methods
- [ ] Email verification flow
- [ ] Phone number verification with SMS
- [ ] Session management (active devices)
- [ ] Activity log
- [ ] Export user data (GDPR compliance)
- [ ] API key management
- [ ] Webhook configuration
