/**
 * Payment Processing Service
 *
 * Handles processing rent payments from tenants to landlords:
 * - One-time payments
 * - Scheduled/recurring payments
 * - Payment retries
 * - Fee calculations
 */

import { prisma } from '@/lib/prisma';
import { getPaymentProvider } from '../providers';
import type { PaymentResult } from '../providers/types';
import { Decimal } from '@prisma/client/runtime/library';

// ============================================================
// TYPES
// ============================================================

export interface ProcessPaymentInput {
  tenantId: string;
  leaseId: string;
  chargeIds: string[];
  paymentMethodId: string; // Our internal ID, not Stripe's
  amount: number;
  description?: string;
}

export interface PaymentProcessingResult {
  success: boolean;
  paymentId?: string;
  stripePaymentIntentId?: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'requires_action';
  amount: number;
  fees: {
    stripeFee: number;
    platformFee: number;
    tenantConvenienceFee: number;
  };
  netAmountToLandlord: number;
  failureReason?: string;
  receiptUrl?: string;
}

export interface FeeCalculation {
  baseAmount: number;
  stripeFee: number;
  platformFee: number;
  tenantConvenienceFee: number;
  totalTenantPays: number;
  netToLandlord: number;
}

// Fee constants
const ACH_FEE_PERCENT = 0.008; // 0.8%
const ACH_FEE_CAP = 5.0; // $5 max
const CARD_FEE_PERCENT = 0.029; // 2.9%
const CARD_FEE_FIXED = 0.30; // $0.30
const PLATFORM_FEE_PERCENT = 0.005; // 0.5% platform fee

// ============================================================
// FEE CALCULATIONS
// ============================================================

/**
 * Calculate fees for a payment
 */
export function calculateFees(
  amount: number,
  paymentMethodType: 'US_BANK_ACCOUNT' | 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY',
  feeConfiguration: 'LANDLORD_ABSORBS' | 'TENANT_PAYS' | 'SPLIT_FEES'
): FeeCalculation {
  // Calculate Stripe fees based on payment method
  let stripeFee: number;
  if (paymentMethodType === 'US_BANK_ACCOUNT') {
    stripeFee = Math.min(amount * ACH_FEE_PERCENT, ACH_FEE_CAP);
  } else {
    stripeFee = amount * CARD_FEE_PERCENT + CARD_FEE_FIXED;
  }

  // Platform fee
  const platformFee = amount * PLATFORM_FEE_PERCENT;
  const totalFees = stripeFee + platformFee;

  // Calculate based on fee configuration
  let tenantConvenienceFee = 0;
  let totalTenantPays = amount;
  let netToLandlord = amount - totalFees;

  switch (feeConfiguration) {
    case 'TENANT_PAYS':
      tenantConvenienceFee = totalFees;
      totalTenantPays = amount + tenantConvenienceFee;
      netToLandlord = amount;
      break;

    case 'SPLIT_FEES':
      tenantConvenienceFee = totalFees / 2;
      totalTenantPays = amount + tenantConvenienceFee;
      netToLandlord = amount - totalFees / 2;
      break;

    case 'LANDLORD_ABSORBS':
    default:
      // Landlord absorbs all fees
      netToLandlord = amount - totalFees;
      break;
  }

  return {
    baseAmount: amount,
    stripeFee: Math.round(stripeFee * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    tenantConvenienceFee: Math.round(tenantConvenienceFee * 100) / 100,
    totalTenantPays: Math.round(totalTenantPays * 100) / 100,
    netToLandlord: Math.round(netToLandlord * 100) / 100,
  };
}

// ============================================================
// PAYMENT PROCESSING
// ============================================================

/**
 * Process a one-time payment
 */
export async function processPayment(
  input: ProcessPaymentInput
): Promise<PaymentProcessingResult> {
  const { tenantId, leaseId, chargeIds, paymentMethodId, amount, description } = input;

  // Get tenant's payment method
  const paymentMethod = await prisma.tenantPaymentMethod.findFirst({
    where: {
      id: paymentMethodId,
      tenantId,
      isActive: true,
    },
  });

  if (!paymentMethod) {
    return {
      success: false,
      status: 'failed',
      amount,
      fees: { stripeFee: 0, platformFee: 0, tenantConvenienceFee: 0 },
      netAmountToLandlord: 0,
      failureReason: 'Payment method not found',
    };
  }

  // Get lease with organization info
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    include: {
      unit: {
        include: {
          property: {
            include: {
              organization: true,
            },
          },
        },
      },
    },
  });

  if (!lease) {
    return {
      success: false,
      status: 'failed',
      amount,
      fees: { stripeFee: 0, platformFee: 0, tenantConvenienceFee: 0 },
      netAmountToLandlord: 0,
      failureReason: 'Lease not found',
    };
  }

  const organization = lease.unit.property.organization;

  // Check if organization can accept payments
  if (!organization.stripeConnectAccountId || organization.stripeConnectStatus !== 'ACTIVE') {
    return {
      success: false,
      status: 'failed',
      amount,
      fees: { stripeFee: 0, platformFee: 0, tenantConvenienceFee: 0 },
      netAmountToLandlord: 0,
      failureReason: 'Landlord payment account is not active',
    };
  }

  // Get Stripe customer
  const stripeCustomer = await prisma.stripeCustomer.findUnique({
    where: { tenantId },
  });

  if (!stripeCustomer) {
    return {
      success: false,
      status: 'failed',
      amount,
      fees: { stripeFee: 0, platformFee: 0, tenantConvenienceFee: 0 },
      netAmountToLandlord: 0,
      failureReason: 'Payment account not set up',
    };
  }

  // Calculate fees
  const fees = calculateFees(
    amount,
    paymentMethod.type as 'US_BANK_ACCOUNT' | 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY',
    organization.feeConfiguration as 'LANDLORD_ABSORBS' | 'TENANT_PAYS' | 'SPLIT_FEES'
  );

  // Create payment record in our database first
  const payment = await prisma.payment.create({
    data: {
      leaseId,
      tenantId,
      amount: new Decimal(fees.totalTenantPays),
      method: paymentMethod.type === 'US_BANK_ACCOUNT' ? 'ACH' : 'CREDIT_CARD',
      status: 'PENDING',
      stripePaymentMethodId: paymentMethod.stripePaymentMethodId,
      stripeCustomerId: stripeCustomer.stripeCustomerId,
      platformFee: new Decimal(fees.platformFee),
      notes: description,
    },
  });

  // Create payment attempt record
  const attempt = await prisma.paymentAttempt.create({
    data: {
      paymentId: payment.id,
      chargeId: chargeIds[0], // Primary charge
      amount: new Decimal(fees.totalTenantPays),
      status: 'PENDING',
    },
  });

  try {
    // Process payment via Stripe
    const provider = getPaymentProvider();
    const result = await provider.createPayment({
      amount: fees.totalTenantPays,
      currency: 'usd',
      customerId: stripeCustomer.stripeCustomerId,
      paymentMethodId: paymentMethod.stripePaymentMethodId,
      destinationAccountId: organization.stripeConnectAccountId,
      applicationFeeAmount: fees.platformFee,
      metadata: {
        paymentId: payment.id,
        tenantId,
        leaseId,
        chargeIds: chargeIds.join(','),
      },
      statementDescriptor: 'RENT PAYMENT',
      description: description || `Rent payment for ${lease.unit.property.name}`,
    });

    // Update payment with Stripe details
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        stripePaymentIntentId: result.providerPaymentId,
        stripeChargeId: result.id,
        stripeFee: result.stripeFee ? new Decimal(result.stripeFee) : null,
        netAmount: result.netAmount ? new Decimal(result.netAmount) : null,
        status: mapPaymentStatus(result.status),
        processedAt: result.status === 'succeeded' ? new Date() : null,
        failureReason: result.failureMessage,
        receiptNumber: result.receiptUrl ? `RCP-${payment.id.substring(0, 8).toUpperCase()}` : null,
      },
    });

    // Update payment attempt
    await prisma.paymentAttempt.update({
      where: { id: attempt.id },
      data: {
        stripePaymentIntentId: result.providerPaymentId,
        stripePaymentMethodId: paymentMethod.stripePaymentMethodId,
        status: mapAttemptStatus(result.status),
        succeededAt: result.status === 'succeeded' ? new Date() : null,
        failureCode: result.failureCode,
        failureMessage: result.failureMessage,
      },
    });

    // Allocate payment to charges if successful
    if (result.status === 'succeeded') {
      await allocatePaymentToCharges(payment.id, chargeIds, amount);
    }

    return {
      success: result.status === 'succeeded',
      paymentId: payment.id,
      stripePaymentIntentId: result.providerPaymentId,
      status: result.status,
      amount: fees.totalTenantPays,
      fees: {
        stripeFee: fees.stripeFee,
        platformFee: fees.platformFee,
        tenantConvenienceFee: fees.tenantConvenienceFee,
      },
      netAmountToLandlord: fees.netToLandlord,
      receiptUrl: result.receiptUrl,
    };
  } catch (error) {
    // Update payment as failed
    const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        failureReason: errorMessage,
      },
    });

    await prisma.paymentAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'FAILED',
        failureMessage: errorMessage,
      },
    });

    return {
      success: false,
      paymentId: payment.id,
      status: 'failed',
      amount: fees.totalTenantPays,
      fees: {
        stripeFee: fees.stripeFee,
        platformFee: fees.platformFee,
        tenantConvenienceFee: fees.tenantConvenienceFee,
      },
      netAmountToLandlord: 0,
      failureReason: errorMessage,
    };
  }
}

/**
 * Allocate a payment to charges
 */
async function allocatePaymentToCharges(
  paymentId: string,
  chargeIds: string[],
  totalAmount: number
): Promise<void> {
  let remainingAmount = totalAmount;

  for (const chargeId of chargeIds) {
    if (remainingAmount <= 0) break;

    const charge = await prisma.charge.findUnique({
      where: { id: chargeId },
      include: { paymentAllocations: true },
    });

    if (!charge) continue;

    // Calculate how much is still owed on this charge
    const alreadyPaid = charge.paymentAllocations.reduce(
      (sum, alloc) => sum + Number(alloc.amount),
      0
    );
    const amountOwed = Number(charge.amount) - alreadyPaid;

    if (amountOwed <= 0) continue;

    // Allocate up to what's owed
    const allocationAmount = Math.min(remainingAmount, amountOwed);

    await prisma.paymentAllocation.create({
      data: {
        paymentId,
        chargeId,
        amount: new Decimal(allocationAmount),
      },
    });

    // Update charge status if fully paid
    if (allocationAmount >= amountOwed) {
      await prisma.charge.update({
        where: { id: chargeId },
        data: { status: 'PAID' },
      });
    } else {
      await prisma.charge.update({
        where: { id: chargeId },
        data: { status: 'PARTIAL' },
      });
    }

    remainingAmount -= allocationAmount;
  }
}

/**
 * Get payment details with timeline
 */
export async function getPaymentDetails(paymentId: string): Promise<{
  payment: {
    id: string;
    amount: number;
    status: string;
    method: string;
    createdAt: Date;
    processedAt: Date | null;
    receiptUrl: string | null;
  };
  timeline: {
    event: string;
    timestamp: Date;
    status: 'completed' | 'current' | 'pending';
  }[];
  tenant: { name: string; email: string } | null;
  property: { name: string; address: string } | null;
} | null> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      tenant: true,
      lease: {
        include: {
          unit: {
            include: {
              property: true,
            },
          },
        },
      },
      payout: true,
    },
  });

  if (!payment) return null;

  // Build timeline
  const timeline: {
    event: string;
    timestamp: Date;
    status: 'completed' | 'current' | 'pending';
  }[] = [];

  // Payment initiated
  timeline.push({
    event: 'Payment Initiated',
    timestamp: payment.createdAt,
    status: 'completed',
  });

  // Payment processing
  if (payment.status === 'PENDING') {
    timeline.push({
      event: 'Processing',
      timestamp: new Date(),
      status: 'current',
    });
  } else if (payment.processedAt) {
    timeline.push({
      event: 'Payment Processed',
      timestamp: payment.processedAt,
      status: 'completed',
    });
  }

  // Transfer to landlord
  if (payment.transferredAt) {
    timeline.push({
      event: 'Transferred to Landlord',
      timestamp: payment.transferredAt,
      status: 'completed',
    });
  } else if (payment.status === 'COMPLETED') {
    timeline.push({
      event: 'Transfer Pending',
      timestamp: new Date(),
      status: payment.stripeTransferId ? 'current' : 'pending',
    });
  }

  // Payout to bank
  if (payment.payout) {
    if (payment.payout.arrivedAt) {
      timeline.push({
        event: 'Deposited to Bank',
        timestamp: payment.payout.arrivedAt,
        status: 'completed',
      });
    } else if (payment.payout.expectedArrivalDate) {
      timeline.push({
        event: `Expected Deposit`,
        timestamp: payment.payout.expectedArrivalDate,
        status: payment.payout.status === 'IN_TRANSIT' ? 'current' : 'pending',
      });
    }
  }

  return {
    payment: {
      id: payment.id,
      amount: Number(payment.amount),
      status: payment.status,
      method: payment.method,
      createdAt: payment.createdAt,
      processedAt: payment.processedAt,
      receiptUrl: null, // Would need to fetch from Stripe
    },
    timeline,
    tenant: payment.tenant
      ? {
          name: `${payment.tenant.firstName} ${payment.tenant.lastName}`,
          email: payment.tenant.email,
        }
      : null,
    property: payment.lease?.unit?.property
      ? {
          name: payment.lease.unit.property.name,
          address: `${payment.lease.unit.property.addressLine1}, ${payment.lease.unit.property.city}`,
        }
      : null,
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function mapPaymentStatus(
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled'
): 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' {
  switch (status) {
    case 'succeeded':
      return 'COMPLETED';
    case 'failed':
      return 'FAILED';
    case 'canceled':
      return 'CANCELLED';
    default:
      return 'PENDING';
  }
}

function mapAttemptStatus(
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled'
): 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' {
  switch (status) {
    case 'succeeded':
      return 'SUCCEEDED';
    case 'processing':
      return 'PROCESSING';
    case 'failed':
      return 'FAILED';
    case 'canceled':
      return 'CANCELLED';
    default:
      return 'PENDING';
  }
}
