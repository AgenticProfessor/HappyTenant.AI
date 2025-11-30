/**
 * Stripe Connect Service
 *
 * Handles the complete lifecycle of Stripe Connect accounts for landlords:
 * - Account creation and onboarding
 * - Status synchronization
 * - Trust-level management for payout delays
 * - Express Dashboard access
 */

import { prisma } from '@/lib/prisma';
import { getPaymentProvider } from '../providers';
import type {
  ConnectedAccountResult,
  AccountStatusResult,
} from '../providers/types';
import type {
  Organization,
  StripeConnectAccount,
  BusinessEntityType,
  StripeConnectStatus,
  TrustLevel,
} from '@prisma/client';

// ============================================================
// TYPES
// ============================================================

export interface CreateConnectAccountInput {
  organizationId: string;
  email: string;
  businessType: 'individual' | 'company';
  businessEntityType: BusinessEntityType;
  businessName?: string;
}

export interface ConnectAccountWithOrg {
  connectAccount: StripeConnectAccount;
  organization: Organization;
}

export interface OnboardingResult {
  url: string;
  expiresAt?: Date;
}

// ============================================================
// ACCOUNT CREATION
// ============================================================

/**
 * Create a new Stripe Connect Express account for an organization
 */
export async function createConnectAccount(
  input: CreateConnectAccountInput
): Promise<ConnectAccountWithOrg> {
  const { organizationId, email, businessType, businessEntityType, businessName } = input;

  // Verify organization exists and doesn't already have a connected account
  const existingOrg = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { stripeConnectAccount: true },
  });

  if (!existingOrg) {
    throw new Error('Organization not found');
  }

  if (existingOrg.stripeConnectAccountId) {
    throw new Error('Organization already has a connected account');
  }

  // Create account in Stripe
  const provider = getPaymentProvider();
  const stripeAccount = await provider.createConnectedAccount({
    email,
    businessType,
    businessStructure: mapBusinessEntityToStructure(businessEntityType),
    country: 'US',
    businessName,
    metadata: {
      organizationId,
      platform: 'happy_tenant',
    },
  });

  // Create records in database atomically
  const [connectAccount, organization] = await prisma.$transaction([
    prisma.stripeConnectAccount.create({
      data: {
        organizationId,
        stripeAccountId: stripeAccount.providerAccountId,
        chargesEnabled: stripeAccount.chargesEnabled,
        payoutsEnabled: stripeAccount.payoutsEnabled,
        detailsSubmitted: stripeAccount.detailsSubmitted,
        currentlyDue: stripeAccount.currentlyDue,
        eventuallyDue: stripeAccount.eventuallyDue,
        pastDue: stripeAccount.pastDue,
        disabledReason: stripeAccount.disabledReason,
      },
    }),
    prisma.organization.update({
      where: { id: organizationId },
      data: {
        stripeConnectAccountId: stripeAccount.providerAccountId,
        stripeConnectStatus: 'ONBOARDING_STARTED',
        businessEntityType,
      },
    }),
  ]);

  return { connectAccount, organization };
}

// ============================================================
// ONBOARDING
// ============================================================

/**
 * Get the onboarding URL for a Connect account
 */
export async function getOnboardingUrl(
  organizationId: string,
  refreshUrl?: string,
  returnUrl?: string
): Promise<OnboardingResult> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { stripeConnectAccount: true },
  });

  if (!org?.stripeConnectAccountId) {
    throw new Error('Organization does not have a connected account');
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const finalRefreshUrl = refreshUrl || `${baseUrl}/dashboard/settings/payments?refresh=true`;
  const finalReturnUrl = returnUrl || `${baseUrl}/dashboard/settings/payments?onboarding=complete`;

  const provider = getPaymentProvider();
  const url = await provider.getOnboardingUrl(
    org.stripeConnectAccountId,
    finalRefreshUrl,
    finalReturnUrl
  );

  return { url };
}

/**
 * Get Express Dashboard login URL for a landlord
 */
export async function getExpressDashboardUrl(
  organizationId: string
): Promise<string> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!org?.stripeConnectAccountId) {
    throw new Error('Organization does not have a connected account');
  }

  // Only allow dashboard access if account is active
  if (org.stripeConnectStatus !== 'ACTIVE') {
    throw new Error('Account must be fully active to access the dashboard');
  }

  const provider = getPaymentProvider();
  return provider.getExpressDashboardUrl(org.stripeConnectAccountId);
}

// ============================================================
// STATUS SYNCHRONIZATION
// ============================================================

/**
 * Sync account status from Stripe to local database
 * Called by webhooks and can be called manually for refresh
 */
export async function syncAccountStatus(
  stripeAccountId: string
): Promise<ConnectAccountWithOrg> {
  // Get current status from Stripe
  const provider = getPaymentProvider();
  const status = await provider.getAccountStatus(stripeAccountId);

  // Find the organization by Stripe account ID
  const org = await prisma.organization.findFirst({
    where: { stripeConnectAccountId: stripeAccountId },
  });

  if (!org) {
    throw new Error(`Organization not found for Stripe account: ${stripeAccountId}`);
  }

  // Determine the new connect status
  const newStatus = determineConnectStatus(status);

  // Update database atomically
  const [connectAccount, organization] = await prisma.$transaction([
    prisma.stripeConnectAccount.update({
      where: { stripeAccountId },
      data: {
        chargesEnabled: status.chargesEnabled,
        payoutsEnabled: status.payoutsEnabled,
        detailsSubmitted: status.detailsSubmitted,
        currentlyDue: status.currentlyDue,
        eventuallyDue: status.eventuallyDue,
        pastDue: status.pastDue,
        disabledReason: status.disabledReason,
        cardPaymentsCapability: status.capabilities.cardPayments,
        transfersCapability: status.capabilities.transfers,
        usBankAccountCapability: status.capabilities.usBankAccountAchPayments,
        lastSyncedAt: new Date(),
      },
    }),
    prisma.organization.update({
      where: { id: org.id },
      data: {
        stripeConnectStatus: newStatus,
        // Set onboarded date when first becoming active
        ...(newStatus === 'ACTIVE' && !org.stripeConnectOnboardedAt
          ? { stripeConnectOnboardedAt: new Date() }
          : {}),
      },
    }),
  ]);

  return { connectAccount, organization };
}

/**
 * Get the current account status from database (cached)
 */
export async function getAccountStatus(
  organizationId: string
): Promise<{
  organization: Organization;
  connectAccount: StripeConnectAccount | null;
  stripeStatus: AccountStatusResult | null;
}> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { stripeConnectAccount: true },
  });

  if (!org) {
    throw new Error('Organization not found');
  }

  if (!org.stripeConnectAccountId) {
    return {
      organization: org,
      connectAccount: null,
      stripeStatus: null,
    };
  }

  // Fetch fresh status from Stripe
  const provider = getPaymentProvider();
  const stripeStatus = await provider.getAccountStatus(org.stripeConnectAccountId);

  return {
    organization: org,
    connectAccount: org.stripeConnectAccount,
    stripeStatus,
  };
}

// ============================================================
// TRUST LEVEL MANAGEMENT
// ============================================================

/**
 * Check and upgrade trust level for an organization
 * Called after successful payouts
 */
export async function checkTrustLevelUpgrade(
  organizationId: string
): Promise<{ upgraded: boolean; newLevel: TrustLevel }> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!org) {
    throw new Error('Organization not found');
  }

  // Already at highest level
  if (org.accountTrustLevel === 'VERIFIED') {
    return { upgraded: false, newLevel: 'VERIFIED' };
  }

  // Check upgrade criteria for NEW -> ESTABLISHED
  if (org.accountTrustLevel === 'NEW') {
    const daysSinceFirstPayout = org.firstSuccessfulPayoutAt
      ? Math.floor((Date.now() - org.firstSuccessfulPayoutAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Check for any disputes in the last 90 days
    const recentDisputes = await prisma.dispute.count({
      where: {
        payment: {
          lease: {
            unit: {
              property: {
                organizationId,
              },
            },
          },
        },
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Upgrade if: 90+ days, 3+ successful payouts, no recent disputes
    if (
      daysSinceFirstPayout >= 90 &&
      org.successfulPayoutCount >= 3 &&
      recentDisputes === 0
    ) {
      await prisma.organization.update({
        where: { id: organizationId },
        data: {
          accountTrustLevel: 'ESTABLISHED',
          payoutDelayMinimum: 2, // Can now reduce to 2-day minimum
        },
      });

      return { upgraded: true, newLevel: 'ESTABLISHED' };
    }
  }

  return { upgraded: false, newLevel: org.accountTrustLevel };
}

/**
 * Record a successful payout and update trust metrics
 */
export async function recordSuccessfulPayout(
  organizationId: string
): Promise<Organization> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!org) {
    throw new Error('Organization not found');
  }

  const updated = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      successfulPayoutCount: { increment: 1 },
      // Set first successful payout date if not already set
      ...(org.firstSuccessfulPayoutAt === null
        ? { firstSuccessfulPayoutAt: new Date() }
        : {}),
    },
  });

  // Check if eligible for trust upgrade
  await checkTrustLevelUpgrade(organizationId);

  return updated;
}

/**
 * Update payout delay for an organization
 * Validates against minimum based on trust level
 */
export async function updatePayoutDelay(
  organizationId: string,
  delayDays: number
): Promise<Organization> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!org) {
    throw new Error('Organization not found');
  }

  if (!org.stripeConnectAccountId) {
    throw new Error('Organization does not have a connected account');
  }

  // Validate delay against minimum
  if (delayDays < org.payoutDelayMinimum) {
    throw new Error(
      `Payout delay cannot be less than ${org.payoutDelayMinimum} days for your trust level`
    );
  }

  // Maximum is always 14 days
  if (delayDays > 14) {
    throw new Error('Payout delay cannot exceed 14 days');
  }

  // Update in Stripe
  const provider = getPaymentProvider();
  await provider.updatePayoutSchedule(org.stripeConnectAccountId, delayDays);

  // Update in database
  return prisma.organization.update({
    where: { id: organizationId },
    data: {
      payoutDelayDays: delayDays,
      stripePayoutDelay: delayDays,
    },
  });
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Determine the StripeConnectStatus based on account status from Stripe
 */
function determineConnectStatus(status: AccountStatusResult): StripeConnectStatus {
  // Account is disabled
  if (status.disabledReason) {
    return 'DISABLED';
  }

  // Account is restricted (has past_due requirements)
  if (status.pastDue.length > 0) {
    return 'RESTRICTED';
  }

  // Account is fully active
  if (status.chargesEnabled && status.payoutsEnabled && status.detailsSubmitted) {
    return 'ACTIVE';
  }

  // Account is pending verification
  if (status.detailsSubmitted) {
    return 'PENDING_VERIFICATION';
  }

  // Still in onboarding
  return 'ONBOARDING_STARTED';
}

/**
 * Map BusinessEntityType to Stripe business structure
 */
function mapBusinessEntityToStructure(
  entityType: BusinessEntityType
): 'llc' | 'limited_partnership' | 's_corporation' | 'corporation' | 'trust' | undefined {
  switch (entityType) {
    case 'LLC':
      return 'llc';
    case 'LP':
      return 'limited_partnership';
    case 'S_CORP':
      return 's_corporation';
    case 'C_CORP':
      return 'corporation';
    case 'TRUST':
      return 'trust';
    case 'INDIVIDUAL':
    case 'OTHER':
    default:
      return undefined;
  }
}

/**
 * Check if an organization can accept payments
 */
export async function canAcceptPayments(organizationId: string): Promise<{
  canAccept: boolean;
  reason?: string;
}> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { stripeConnectAccount: true },
  });

  if (!org) {
    return { canAccept: false, reason: 'Organization not found' };
  }

  if (!org.stripeConnectAccountId || !org.stripeConnectAccount) {
    return { canAccept: false, reason: 'Payment account not set up' };
  }

  if (org.stripeConnectStatus !== 'ACTIVE') {
    return {
      canAccept: false,
      reason: `Account status: ${org.stripeConnectStatus.toLowerCase().replace('_', ' ')}`,
    };
  }

  if (!org.stripeConnectAccount.chargesEnabled) {
    return { canAccept: false, reason: 'Charges not enabled on account' };
  }

  return { canAccept: true };
}

/**
 * Get the destination account ID for payments to an organization
 */
export async function getDestinationAccountId(
  organizationId: string
): Promise<string> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!org?.stripeConnectAccountId) {
    throw new Error('Organization does not have a connected account');
  }

  return org.stripeConnectAccountId;
}
