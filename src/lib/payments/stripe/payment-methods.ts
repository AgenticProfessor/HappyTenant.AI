/**
 * Tenant Payment Methods Service
 *
 * Manages payment methods for tenants including:
 * - Bank accounts via Stripe Financial Connections
 * - Credit/Debit cards via Stripe Elements
 * - Apple Pay / Google Pay wallets
 */

import { prisma } from '@/lib/prisma';
import { getPaymentProvider } from '../providers';
import type {
  PaymentMethodResult,
  SetupSessionResult,
} from '../providers/types';

// ============================================================
// TYPES
// ============================================================

export interface TenantPaymentMethodData {
  id: string;
  type: 'US_BANK_ACCOUNT' | 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY';
  stripePaymentMethodId: string;
  isDefault: boolean;
  isActive: boolean;
  nickname?: string;
  // Bank account fields
  bankName?: string;
  bankAccountLast4?: string;
  bankAccountType?: string;
  verificationStatus?: string;
  // Card fields
  cardBrand?: string;
  cardLast4?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  cardFunding?: string;
  // Wallet fields
  walletType?: string;
  createdAt: Date;
}

export interface CreateSetupSessionInput {
  tenantId: string;
  paymentMethodTypes: ('card' | 'us_bank_account')[];
  returnUrl?: string;
}

// ============================================================
// STRIPE CUSTOMER MANAGEMENT
// ============================================================

/**
 * Get or create a Stripe customer for a tenant
 */
export async function getOrCreateStripeCustomer(
  tenantId: string
): Promise<{ stripeCustomerId: string; isNew: boolean }> {
  // Check if customer already exists
  const existingCustomer = await prisma.stripeCustomer.findUnique({
    where: { tenantId },
    include: { tenant: true },
  });

  if (existingCustomer) {
    return {
      stripeCustomerId: existingCustomer.stripeCustomerId,
      isNew: false,
    };
  }

  // Get tenant details
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  // Create customer in Stripe
  const provider = getPaymentProvider();
  const customer = await provider.createCustomer({
    email: tenant.email,
    name: `${tenant.firstName} ${tenant.lastName}`,
    phone: tenant.phone || undefined,
    metadata: {
      tenantId,
      platform: 'happy_tenant',
    },
  });

  // Save to database
  await prisma.stripeCustomer.create({
    data: {
      tenantId,
      stripeCustomerId: customer.providerCustomerId,
      email: tenant.email,
      name: `${tenant.firstName} ${tenant.lastName}`,
    },
  });

  return {
    stripeCustomerId: customer.providerCustomerId,
    isNew: true,
  };
}

// ============================================================
// SETUP SESSIONS
// ============================================================

/**
 * Create a setup session for adding a new payment method
 */
export async function createPaymentMethodSetupSession(
  input: CreateSetupSessionInput
): Promise<SetupSessionResult & { stripeCustomerId: string }> {
  const { tenantId, paymentMethodTypes, returnUrl } = input;

  // Get or create Stripe customer
  const { stripeCustomerId } = await getOrCreateStripeCustomer(tenantId);

  // Create setup session
  const provider = getPaymentProvider();
  const session = await provider.createSetupSession({
    customerId: stripeCustomerId,
    paymentMethodTypes,
    returnUrl,
    metadata: {
      tenantId,
    },
  });

  return {
    ...session,
    stripeCustomerId,
  };
}

// ============================================================
// PAYMENT METHOD MANAGEMENT
// ============================================================

/**
 * List all payment methods for a tenant
 */
export async function listTenantPaymentMethods(
  tenantId: string
): Promise<TenantPaymentMethodData[]> {
  // Get from database (our source of truth)
  const methods = await prisma.tenantPaymentMethod.findMany({
    where: {
      tenantId,
      isActive: true,
    },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return methods.map(mapToPaymentMethodData);
}

/**
 * Get a single payment method
 */
export async function getTenantPaymentMethod(
  paymentMethodId: string,
  tenantId: string
): Promise<TenantPaymentMethodData | null> {
  const method = await prisma.tenantPaymentMethod.findFirst({
    where: {
      id: paymentMethodId,
      tenantId,
      isActive: true,
    },
  });

  return method ? mapToPaymentMethodData(method) : null;
}

/**
 * Save a payment method after successful setup
 */
export async function savePaymentMethod(
  tenantId: string,
  stripePaymentMethodId: string,
  setAsDefault: boolean = false
): Promise<TenantPaymentMethodData> {
  // Get Stripe customer
  const stripeCustomer = await prisma.stripeCustomer.findUnique({
    where: { tenantId },
  });

  if (!stripeCustomer) {
    throw new Error('Stripe customer not found for tenant');
  }

  // Check if payment method already exists
  const existing = await prisma.tenantPaymentMethod.findUnique({
    where: { stripePaymentMethodId },
  });

  if (existing) {
    return mapToPaymentMethodData(existing);
  }

  // Get payment method details from Stripe
  const provider = getPaymentProvider();
  const pmDetails = await provider.getPaymentMethod(stripePaymentMethodId);

  // If setting as default, unset other defaults
  if (setAsDefault) {
    await prisma.tenantPaymentMethod.updateMany({
      where: { tenantId, isDefault: true },
      data: { isDefault: false },
    });
  }

  // Check if this is the first payment method (make it default)
  const existingCount = await prisma.tenantPaymentMethod.count({
    where: { tenantId, isActive: true },
  });
  const shouldBeDefault = setAsDefault || existingCount === 0;

  // Create payment method record
  const paymentMethod = await prisma.tenantPaymentMethod.create({
    data: {
      tenantId,
      stripeCustomerId: stripeCustomer.stripeCustomerId,
      stripePaymentMethodId,
      type: mapPaymentMethodType(pmDetails.type),
      bankName: pmDetails.bankName,
      bankAccountLast4: pmDetails.bankAccountLast4,
      bankAccountType: pmDetails.bankAccountType,
      verificationStatus: pmDetails.verificationStatus
        ? mapVerificationStatus(pmDetails.verificationStatus)
        : 'VERIFIED',
      cardBrand: pmDetails.cardBrand,
      cardLast4: pmDetails.cardLast4,
      cardExpMonth: pmDetails.cardExpMonth,
      cardExpYear: pmDetails.cardExpYear,
      cardFunding: pmDetails.cardFunding,
      walletType: pmDetails.walletType,
      isDefault: shouldBeDefault,
      isActive: true,
    },
  });

  // Update default in Stripe if needed
  if (shouldBeDefault) {
    await provider.setDefaultPaymentMethod(
      stripeCustomer.stripeCustomerId,
      stripePaymentMethodId
    );
    await prisma.stripeCustomer.update({
      where: { tenantId },
      data: { defaultPaymentMethodId: stripePaymentMethodId },
    });
  }

  return mapToPaymentMethodData(paymentMethod);
}

/**
 * Set a payment method as the default
 */
export async function setDefaultPaymentMethod(
  tenantId: string,
  paymentMethodId: string
): Promise<void> {
  // Get the payment method
  const method = await prisma.tenantPaymentMethod.findFirst({
    where: { id: paymentMethodId, tenantId, isActive: true },
  });

  if (!method) {
    throw new Error('Payment method not found');
  }

  // Get Stripe customer
  const stripeCustomer = await prisma.stripeCustomer.findUnique({
    where: { tenantId },
  });

  if (!stripeCustomer) {
    throw new Error('Stripe customer not found');
  }

  // Update in Stripe
  const provider = getPaymentProvider();
  await provider.setDefaultPaymentMethod(
    stripeCustomer.stripeCustomerId,
    method.stripePaymentMethodId
  );

  // Update in database
  await prisma.$transaction([
    prisma.tenantPaymentMethod.updateMany({
      where: { tenantId, isDefault: true },
      data: { isDefault: false },
    }),
    prisma.tenantPaymentMethod.update({
      where: { id: paymentMethodId },
      data: { isDefault: true },
    }),
    prisma.stripeCustomer.update({
      where: { tenantId },
      data: { defaultPaymentMethodId: method.stripePaymentMethodId },
    }),
  ]);
}

/**
 * Remove a payment method
 */
export async function removePaymentMethod(
  tenantId: string,
  paymentMethodId: string
): Promise<void> {
  // Get the payment method
  const method = await prisma.tenantPaymentMethod.findFirst({
    where: { id: paymentMethodId, tenantId, isActive: true },
  });

  if (!method) {
    throw new Error('Payment method not found');
  }

  // Check if it's the only payment method and has active scheduled payments
  if (method.isDefault) {
    const scheduledPayments = await prisma.scheduledPayment.count({
      where: { tenantId, isActive: true },
    });

    if (scheduledPayments > 0) {
      throw new Error('Cannot remove default payment method while AutoPay is enabled');
    }
  }

  // Detach from Stripe
  const provider = getPaymentProvider();
  await provider.detachPaymentMethod(method.stripePaymentMethodId);

  // Soft delete in database
  await prisma.tenantPaymentMethod.update({
    where: { id: paymentMethodId },
    data: { isActive: false },
  });

  // If this was the default, set another as default
  if (method.isDefault) {
    const nextMethod = await prisma.tenantPaymentMethod.findFirst({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (nextMethod) {
      await setDefaultPaymentMethod(tenantId, nextMethod.id);
    }
  }
}

/**
 * Update payment method nickname
 */
export async function updatePaymentMethodNickname(
  tenantId: string,
  paymentMethodId: string,
  nickname: string
): Promise<TenantPaymentMethodData> {
  const method = await prisma.tenantPaymentMethod.findFirst({
    where: { id: paymentMethodId, tenantId, isActive: true },
  });

  if (!method) {
    throw new Error('Payment method not found');
  }

  const updated = await prisma.tenantPaymentMethod.update({
    where: { id: paymentMethodId },
    data: { nickname },
  });

  return mapToPaymentMethodData(updated);
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function mapToPaymentMethodData(
  method: {
    id: string;
    type: string;
    stripePaymentMethodId: string;
    isDefault: boolean;
    isActive: boolean;
    nickname: string | null;
    bankName: string | null;
    bankAccountLast4: string | null;
    bankAccountType: string | null;
    verificationStatus: string | null;
    cardBrand: string | null;
    cardLast4: string | null;
    cardExpMonth: number | null;
    cardExpYear: number | null;
    cardFunding: string | null;
    walletType: string | null;
    createdAt: Date;
  }
): TenantPaymentMethodData {
  return {
    id: method.id,
    type: method.type as TenantPaymentMethodData['type'],
    stripePaymentMethodId: method.stripePaymentMethodId,
    isDefault: method.isDefault,
    isActive: method.isActive,
    nickname: method.nickname || undefined,
    bankName: method.bankName || undefined,
    bankAccountLast4: method.bankAccountLast4 || undefined,
    bankAccountType: method.bankAccountType || undefined,
    verificationStatus: method.verificationStatus || undefined,
    cardBrand: method.cardBrand || undefined,
    cardLast4: method.cardLast4 || undefined,
    cardExpMonth: method.cardExpMonth || undefined,
    cardExpYear: method.cardExpYear || undefined,
    cardFunding: method.cardFunding || undefined,
    walletType: method.walletType || undefined,
    createdAt: method.createdAt,
  };
}

function mapPaymentMethodType(
  type: 'us_bank_account' | 'card' | 'apple_pay' | 'google_pay'
): 'US_BANK_ACCOUNT' | 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY' {
  switch (type) {
    case 'us_bank_account':
      return 'US_BANK_ACCOUNT';
    case 'apple_pay':
      return 'APPLE_PAY';
    case 'google_pay':
      return 'GOOGLE_PAY';
    case 'card':
    default:
      return 'CARD';
  }
}

function mapVerificationStatus(
  status: 'pending' | 'verified' | 'failed' | 'instant_verified'
): 'PENDING' | 'VERIFIED' | 'FAILED' | 'INSTANT_VERIFIED' {
  switch (status) {
    case 'pending':
      return 'PENDING';
    case 'verified':
      return 'VERIFIED';
    case 'failed':
      return 'FAILED';
    case 'instant_verified':
      return 'INSTANT_VERIFIED';
    default:
      return 'PENDING';
  }
}
