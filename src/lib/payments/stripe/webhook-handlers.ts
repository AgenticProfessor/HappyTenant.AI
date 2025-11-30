/**
 * Stripe Webhook Event Handlers
 *
 * Handles incoming Stripe webhook events with idempotency.
 * Each handler updates the internal database based on events from Stripe.
 */

import { prisma } from '@/lib/prisma';
import { syncAccountStatus, recordSuccessfulPayout } from './connect';
import type Stripe from 'stripe';

// ============================================================
// PAYMENT INTENT HANDLERS
// ============================================================

export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const paymentIntentId = paymentIntent.id;

  // Find the payment by Stripe payment intent ID
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
    include: {
      lease: {
        include: {
          unit: {
            include: {
              property: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    console.warn(`Payment not found for PaymentIntent: ${paymentIntentId}`);
    return;
  }

  // Get charge details for fee information
  const charge = paymentIntent.latest_charge as Stripe.Charge | null;
  const balanceTransaction = charge?.balance_transaction as Stripe.BalanceTransaction | null;

  // Calculate fees
  const stripeFee = balanceTransaction?.fee ? balanceTransaction.fee / 100 : null;
  const platformFee = paymentIntent.application_fee_amount
    ? paymentIntent.application_fee_amount / 100
    : null;
  const netAmount = paymentIntent.amount_received
    ? paymentIntent.amount_received / 100 - (platformFee || 0)
    : null;

  // Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'COMPLETED',
      processedAt: new Date(),
      stripeChargeId: charge?.id,
      stripeFee: stripeFee,
      platformFee: platformFee,
      netAmount: netAmount,
    },
  });

  // Update any associated payment attempts
  await prisma.paymentAttempt.updateMany({
    where: {
      stripePaymentIntentId: paymentIntentId,
      status: { not: 'SUCCEEDED' },
    },
    data: {
      status: 'SUCCEEDED',
      succeededAt: new Date(),
    },
  });

  console.log(`Payment ${payment.id} marked as completed`);
}

export async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const paymentIntentId = paymentIntent.id;

  // Find the payment
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (!payment) {
    console.warn(`Payment not found for PaymentIntent: ${paymentIntentId}`);
    return;
  }

  const error = paymentIntent.last_payment_error;

  // Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'FAILED',
      failureReason: error?.message || 'Payment failed',
    },
  });

  // Update payment attempt
  await prisma.paymentAttempt.updateMany({
    where: {
      stripePaymentIntentId: paymentIntentId,
      status: { not: 'FAILED' },
    },
    data: {
      status: 'FAILED',
      failureCode: error?.code || undefined,
      failureMessage: error?.message || undefined,
    },
  });

  console.log(`Payment ${payment.id} marked as failed: ${error?.message}`);
}

export async function handlePaymentIntentProcessing(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const paymentIntentId = paymentIntent.id;

  // Find the payment
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (!payment) {
    console.warn(`Payment not found for PaymentIntent: ${paymentIntentId}`);
    return;
  }

  // Update payment status to pending (ACH payments take time)
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'PENDING',
    },
  });

  // Update payment attempt
  await prisma.paymentAttempt.updateMany({
    where: {
      stripePaymentIntentId: paymentIntentId,
    },
    data: {
      status: 'PROCESSING',
    },
  });

  console.log(`Payment ${payment.id} is processing`);
}

// ============================================================
// CHARGE HANDLERS
// ============================================================

export async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  // Find payment by charge ID
  const payment = await prisma.payment.findFirst({
    where: { stripeChargeId: charge.id },
  });

  if (!payment) {
    console.warn(`Payment not found for Charge: ${charge.id}`);
    return;
  }

  const refundedAmount = charge.amount_refunded / 100;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: charge.refunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      refundedAmount,
      refundedAt: new Date(),
    },
  });

  console.log(`Payment ${payment.id} refunded: $${refundedAmount}`);
}

export async function handleDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
  const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id;

  if (!chargeId) {
    console.warn('Dispute has no charge ID');
    return;
  }

  // Find payment by charge ID
  const payment = await prisma.payment.findFirst({
    where: { stripeChargeId: chargeId },
  });

  if (!payment) {
    console.warn(`Payment not found for disputed Charge: ${chargeId}`);
    return;
  }

  // Create dispute record
  await prisma.dispute.upsert({
    where: { stripeDisputeId: dispute.id },
    create: {
      paymentId: payment.id,
      stripeDisputeId: dispute.id,
      amount: dispute.amount / 100,
      currency: dispute.currency,
      reason: dispute.reason,
      status: 'NEEDS_RESPONSE',
      evidenceDueBy: dispute.evidence_details?.due_by
        ? new Date(dispute.evidence_details.due_by * 1000)
        : null,
    },
    update: {
      status: 'NEEDS_RESPONSE',
      amount: dispute.amount / 100,
    },
  });

  console.log(`Dispute ${dispute.id} created for payment ${payment.id}`);
}

export async function handleDisputeClosed(dispute: Stripe.Dispute): Promise<void> {
  // Find dispute record
  const disputeRecord = await prisma.dispute.findUnique({
    where: { stripeDisputeId: dispute.id },
  });

  if (!disputeRecord) {
    console.warn(`Dispute record not found: ${dispute.id}`);
    return;
  }

  // Map Stripe dispute status to our status
  let status: 'WON' | 'LOST' | 'CHARGE_REFUNDED' = 'LOST';
  if (dispute.status === 'won') {
    status = 'WON';
  } else if (dispute.status === 'lost') {
    status = 'LOST';
  } else if ((dispute.status as string) === 'charge_refunded') {
    status = 'CHARGE_REFUNDED';
  }

  await prisma.dispute.update({
    where: { id: disputeRecord.id },
    data: {
      status,
      outcome: dispute.status,
      resolvedAt: new Date(),
    },
  });

  console.log(`Dispute ${dispute.id} closed with status: ${status}`);
}

// ============================================================
// SETUP INTENT HANDLERS
// ============================================================

export async function handleSetupIntentSucceeded(
  setupIntent: Stripe.SetupIntent
): Promise<void> {
  const customerId = typeof setupIntent.customer === 'string'
    ? setupIntent.customer
    : setupIntent.customer?.id;

  if (!customerId) {
    console.warn('SetupIntent has no customer');
    return;
  }

  const paymentMethodId = typeof setupIntent.payment_method === 'string'
    ? setupIntent.payment_method
    : setupIntent.payment_method?.id;

  if (!paymentMethodId) {
    console.warn('SetupIntent has no payment method');
    return;
  }

  // Find the tenant by Stripe customer ID
  const stripeCustomer = await prisma.stripeCustomer.findUnique({
    where: { stripeCustomerId: customerId },
    include: { tenant: true },
  });

  if (!stripeCustomer) {
    console.warn(`StripeCustomer not found: ${customerId}`);
    return;
  }

  // Check if payment method already exists
  const existingMethod = await prisma.tenantPaymentMethod.findUnique({
    where: { stripePaymentMethodId: paymentMethodId },
  });

  if (existingMethod) {
    // Update verification status if it's a bank account
    if (existingMethod.type === 'US_BANK_ACCOUNT') {
      await prisma.tenantPaymentMethod.update({
        where: { id: existingMethod.id },
        data: {
          verificationStatus: 'VERIFIED',
        },
      });
    }
    console.log(`Payment method ${paymentMethodId} already exists, updated verification`);
    return;
  }

  console.log(`SetupIntent succeeded for customer ${customerId}`);
}

export async function handleSetupIntentFailed(
  setupIntent: Stripe.SetupIntent
): Promise<void> {
  const error = setupIntent.last_setup_error;
  console.warn(`SetupIntent failed: ${error?.message}`);
}

// ============================================================
// PAYOUT HANDLERS
// ============================================================

export async function handlePayoutPaid(
  payout: Stripe.Payout,
  connectedAccountId?: string
): Promise<void> {
  // Find the payout record
  const payoutRecord = await prisma.payout.findUnique({
    where: { stripePayoutId: payout.id },
    include: { organization: true },
  });

  if (!payoutRecord) {
    // Payout might not be tracked if it's from before our system
    console.log(`Payout ${payout.id} not found in our records`);
    return;
  }

  await prisma.payout.update({
    where: { id: payoutRecord.id },
    data: {
      status: 'PAID' as const,
      arrivedAt: new Date(),
    },
  });

  // Record successful payout for trust level tracking
  await recordSuccessfulPayout(payoutRecord.organizationId);

  console.log(`Payout ${payout.id} marked as paid`);
}

export async function handlePayoutFailed(
  payout: Stripe.Payout,
  connectedAccountId?: string
): Promise<void> {
  const payoutRecord = await prisma.payout.findUnique({
    where: { stripePayoutId: payout.id },
  });

  if (!payoutRecord) {
    console.log(`Payout ${payout.id} not found in our records`);
    return;
  }

  await prisma.payout.update({
    where: { id: payoutRecord.id },
    data: {
      status: 'PAYOUT_FAILED',
      failureCode: payout.failure_code ?? undefined,
      failureMessage: payout.failure_message ?? undefined,
    },
  });

  console.log(`Payout ${payout.id} failed: ${payout.failure_message}`);
}

export async function handlePayoutCreated(
  payout: Stripe.Payout,
  connectedAccountId?: string
): Promise<void> {
  // Only track if we have a connected account
  if (!connectedAccountId) {
    return;
  }

  // Find the organization
  const org = await prisma.organization.findFirst({
    where: { stripeConnectAccountId: connectedAccountId },
  });

  if (!org) {
    console.warn(`Organization not found for connected account: ${connectedAccountId}`);
    return;
  }

  // Check if payout already exists
  const existing = await prisma.payout.findUnique({
    where: { stripePayoutId: payout.id },
  });

  if (existing) {
    return;
  }

  // Create payout record
  await prisma.payout.create({
    data: {
      organizationId: org.id,
      stripePayoutId: payout.id,
      amount: payout.amount / 100,
      currency: payout.currency,
      netAmount: payout.amount / 100,
      status: 'PAYOUT_PENDING',
      expectedArrivalDate: new Date(payout.arrival_date * 1000),
    },
  });

  console.log(`Payout ${payout.id} created for organization ${org.id}`);
}

// ============================================================
// CONNECTED ACCOUNT HANDLERS
// ============================================================

export async function handleAccountUpdated(account: Stripe.Account): Promise<void> {
  try {
    await syncAccountStatus(account.id);
    console.log(`Account ${account.id} status synced`);
  } catch (error) {
    console.error(`Failed to sync account ${account.id}:`, error);
  }
}

export async function handleAccountDeauthorized(account: Stripe.Account): Promise<void> {
  // Find the organization
  const org = await prisma.organization.findFirst({
    where: { stripeConnectAccountId: account.id },
  });

  if (!org) {
    console.warn(`Organization not found for deauthorized account: ${account.id}`);
    return;
  }

  // Update organization status
  await prisma.organization.update({
    where: { id: org.id },
    data: {
      stripeConnectStatus: 'DISABLED',
    },
  });

  // Update connect account record
  await prisma.stripeConnectAccount.updateMany({
    where: { stripeAccountId: account.id },
    data: {
      chargesEnabled: false,
      payoutsEnabled: false,
      disabledReason: 'Account deauthorized',
    },
  });

  console.log(`Account ${account.id} deauthorized`);
}

// ============================================================
// TRANSFER HANDLERS
// ============================================================

export async function handleTransferCreated(transfer: Stripe.Transfer): Promise<void> {
  // Find payment by transfer ID
  const payment = await prisma.payment.findFirst({
    where: { stripeTransferId: transfer.id },
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        transferredAt: new Date(),
      },
    });
    console.log(`Payment ${payment.id} transfer recorded`);
  }
}

// ============================================================
// MAIN EVENT ROUTER
// ============================================================

export async function handleWebhookEvent(
  eventType: string,
  data: unknown,
  connectedAccountId?: string
): Promise<void> {
  switch (eventType) {
    // Payment lifecycle
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(data as Stripe.PaymentIntent);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(data as Stripe.PaymentIntent);
      break;
    case 'payment_intent.processing':
      await handlePaymentIntentProcessing(data as Stripe.PaymentIntent);
      break;

    // Charges
    case 'charge.refunded':
      await handleChargeRefunded(data as Stripe.Charge);
      break;
    case 'charge.dispute.created':
      await handleDisputeCreated(data as Stripe.Dispute);
      break;
    case 'charge.dispute.closed':
      await handleDisputeClosed(data as Stripe.Dispute);
      break;

    // Setup intents
    case 'setup_intent.succeeded':
      await handleSetupIntentSucceeded(data as Stripe.SetupIntent);
      break;
    case 'setup_intent.setup_failed':
      await handleSetupIntentFailed(data as Stripe.SetupIntent);
      break;

    // Payouts
    case 'payout.created':
      await handlePayoutCreated(data as Stripe.Payout, connectedAccountId);
      break;
    case 'payout.paid':
      await handlePayoutPaid(data as Stripe.Payout, connectedAccountId);
      break;
    case 'payout.failed':
      await handlePayoutFailed(data as Stripe.Payout, connectedAccountId);
      break;

    // Connected accounts
    case 'account.updated':
      await handleAccountUpdated(data as Stripe.Account);
      break;
    case 'account.application.deauthorized':
      await handleAccountDeauthorized(data as Stripe.Account);
      break;

    // Transfers
    case 'transfer.created':
      await handleTransferCreated(data as Stripe.Transfer);
      break;

    default:
      console.log(`Unhandled webhook event type: ${eventType}`);
  }
}
