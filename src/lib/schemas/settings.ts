import * as z from 'zod';

// Profile Settings Schema
export const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  timezone: z.string().optional(),
  avatar: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

// Organization Settings Schema
export const organizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  businessType: z.enum(['individual', 'llc', 'corporation', 'partnership', 'other']).optional(),
  logo: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  taxId: z.string().optional(),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;

// Password Change Schema
export const passwordSchema = z
  .object({
    currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export type PasswordFormValues = z.infer<typeof passwordSchema>;

// Notification Preferences Schema
export const notificationSchema = z.object({
  // Email notifications
  emailEnabled: z.boolean(),
  emailRentPayments: z.boolean(),
  emailPaymentReminders: z.boolean(),
  emailMaintenanceRequests: z.boolean(),
  emailLeaseExpirations: z.boolean(),
  emailMessagesFromTenants: z.boolean(),

  // SMS notifications
  smsEnabled: z.boolean(),
  smsEmergencyMaintenance: z.boolean(),
  smsPaymentReceived: z.boolean(),
  smsCriticalAlerts: z.boolean(),

  // Push notifications
  pushEnabled: z.boolean(),
  pushAllActivity: z.boolean(),
  pushMessagesOnly: z.boolean(),
  pushOff: z.boolean(),
});

export type NotificationFormValues = z.infer<typeof notificationSchema>;

// Payment Method Schema
export const paymentMethodSchema = z.object({
  paymentType: z.enum(['bank_account', 'debit_card']),

  // Bank account fields
  accountHolderName: z.string().optional(),
  routingNumber: z.string().regex(/^\d{9}$/, 'Routing number must be 9 digits').optional(),
  accountNumber: z.string().min(4, 'Account number is required').optional(),
  confirmAccountNumber: z.string().optional(),

  // Debit card fields
  cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits').optional(),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Format: MM/YY').optional(),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits').optional(),
}).refine(
  (data) => {
    if (data.paymentType === 'bank_account') {
      return data.accountNumber === data.confirmAccountNumber;
    }
    return true;
  },
  {
    message: 'Account numbers must match',
    path: ['confirmAccountNumber'],
  }
);

export type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;
