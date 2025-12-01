import * as z from 'zod';

// ============================================================
// BUSINESS ENTITY SCHEMAS
// ============================================================

export const businessEntityTypeEnum = z.enum([
  'INDIVIDUAL',
  'LLC',
  'LP',
  'S_CORP',
  'C_CORP',
  'TRUST',
  'OTHER',
]);

export type BusinessEntityType = z.infer<typeof businessEntityTypeEnum>;

export const businessEntitySchema = z.object({
  name: z.string().min(1, 'Entity name is required'),
  entityType: businessEntityTypeEnum,
  ein: z
    .string()
    .regex(/^\d{2}-\d{7}$/, 'EIN must be in format XX-XXXXXXX')
    .optional()
    .or(z.literal('')),
  ssnLast4: z
    .string()
    .regex(/^\d{4}$/, 'Must be exactly 4 digits')
    .optional()
    .or(z.literal('')),
  addressLine1: z.string().optional().or(z.literal('')),
  addressLine2: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});

export type BusinessEntityFormValues = z.infer<typeof businessEntitySchema>;

// ============================================================
// BANK ACCOUNT SCHEMAS
// ============================================================

export const bankAccountTypeEnum = z.enum(['CHECKING', 'SAVINGS']);

export type BankAccountType = z.infer<typeof bankAccountTypeEnum>;

export const bankAccountSchema = z.object({
  entityId: z.string().min(1, 'Entity is required'),
  accountHolderName: z.string().min(1, 'Account holder name is required'),
  routingNumber: z.string().regex(/^\d{9}$/, 'Routing number must be 9 digits'),
  accountNumber: z.string().min(4, 'Account number is required'),
  confirmAccountNumber: z.string().min(4, 'Please confirm account number'),
  accountType: bankAccountTypeEnum,
  nickname: z.string().optional().or(z.literal('')),
}).refine(
  (data) => data.accountNumber === data.confirmAccountNumber,
  {
    message: 'Account numbers must match',
    path: ['confirmAccountNumber'],
  }
);

export type BankAccountFormValues = z.infer<typeof bankAccountSchema>;

// ============================================================
// ACH PAYOUT SPEED SCHEMAS
// ============================================================

export const achPayoutSpeedEnum = z.enum(['STANDARD', 'EXPEDITED']);

export type ACHPayoutSpeed = z.infer<typeof achPayoutSpeedEnum>;

export const payoutSpeedSchema = z.object({
  achPayoutSpeed: achPayoutSpeedEnum,
  acknowledgement: z.boolean().optional(),
}).refine(
  (data) => data.achPayoutSpeed === 'STANDARD' || data.acknowledgement === true,
  {
    message: 'You must acknowledge the risk to select expedited payouts',
    path: ['acknowledgement'],
  }
);

export type PayoutSpeedFormValues = z.infer<typeof payoutSpeedSchema>;

// ============================================================
// PROFILE & SECURITY SCHEMAS
// ============================================================

export const profileUpdateSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().or(z.literal('')),
});

export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and a number'
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

export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

export const twoFactorSetupSchema = z.object({
  verificationCode: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
});

export type TwoFactorSetupFormValues = z.infer<typeof twoFactorSetupSchema>;

// ============================================================
// NOTIFICATION PREFERENCES
// ============================================================

export const notificationPreferencesSchema = z.object({
  // Email notifications
  emailEnabled: z.boolean().default(true),
  emailRentPayments: z.boolean().default(true),
  emailPaymentReminders: z.boolean().default(true),
  emailMaintenanceRequests: z.boolean().default(true),
  emailLeaseExpirations: z.boolean().default(true),
  emailMessagesFromTenants: z.boolean().default(true),

  // SMS notifications
  smsEnabled: z.boolean().default(false),
  smsEmergencyMaintenance: z.boolean().default(true),
  smsPaymentReceived: z.boolean().default(false),
  smsCriticalAlerts: z.boolean().default(true),

  // Push notifications
  pushEnabled: z.boolean().default(true),
});

export type NotificationPreferencesFormValues = z.infer<typeof notificationPreferencesSchema>;

// ============================================================
// FEE CONFIGURATION
// ============================================================

export const feeConfigurationEnum = z.enum([
  'LANDLORD_ABSORBS',
  'TENANT_PAYS',
  'SPLIT_FEES',
]);

export type FeeConfiguration = z.infer<typeof feeConfigurationEnum>;

export const feeConfigurationSchema = z.object({
  feeConfiguration: feeConfigurationEnum,
});

export type FeeConfigurationFormValues = z.infer<typeof feeConfigurationSchema>;

// ============================================================
// API KEYS
// ============================================================

export const createApiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required'),
  expiresIn: z.enum(['30d', '90d', '1y', 'never']).default('90d'),
});

export type CreateApiKeyFormValues = z.infer<typeof createApiKeySchema>;

// ============================================================
// DANGER ZONE
// ============================================================

export const deleteAccountSchema = z.object({
  confirmation: z.literal('DELETE MY ACCOUNT', {
    message: 'Please type "DELETE MY ACCOUNT" exactly',
  }),
  password: z.string().min(1, 'Password is required'),
});

export type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;
