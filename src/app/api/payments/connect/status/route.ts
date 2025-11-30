/**
 * GET /api/payments/connect/status
 *
 * Returns the current status of the organization's Stripe Connect account,
 * including requirements, capabilities, and payout settings.
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAccountStatus, canAcceptPayments } from '@/lib/payments/stripe/connect';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: {
          include: {
            stripeConnectAccount: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const org = user.organization;

    // If no connected account, return basic status
    if (!org.stripeConnectAccountId) {
      return NextResponse.json({
        hasAccount: false,
        status: 'NOT_STARTED',
        canAcceptPayments: false,
        message: 'Payment account not set up',
      });
    }

    // Get detailed status
    const statusResult = await getAccountStatus(org.id);
    const paymentCapability = await canAcceptPayments(org.id);

    // Build response
    const response = {
      hasAccount: true,
      status: org.stripeConnectStatus,
      stripeAccountId: org.stripeConnectAccountId,
      canAcceptPayments: paymentCapability.canAccept,
      paymentCapabilityReason: paymentCapability.reason,

      // Account details
      businessEntityType: org.businessEntityType,
      onboardedAt: org.stripeConnectOnboardedAt,

      // Fee configuration
      feeConfiguration: org.feeConfiguration,

      // Trust and payout settings
      trustLevel: org.accountTrustLevel,
      payoutDelayDays: org.payoutDelayDays,
      payoutDelayMinimum: org.payoutDelayMinimum,
      successfulPayoutCount: org.successfulPayoutCount,
      firstSuccessfulPayoutAt: org.firstSuccessfulPayoutAt,

      // Stripe account details (if available)
      stripeDetails: statusResult.stripeStatus
        ? {
            chargesEnabled: statusResult.stripeStatus.chargesEnabled,
            payoutsEnabled: statusResult.stripeStatus.payoutsEnabled,
            detailsSubmitted: statusResult.stripeStatus.detailsSubmitted,
            capabilities: statusResult.stripeStatus.capabilities,
            requirements: {
              currentlyDue: statusResult.stripeStatus.currentlyDue,
              eventuallyDue: statusResult.stripeStatus.eventuallyDue,
              pastDue: statusResult.stripeStatus.pastDue,
              disabledReason: statusResult.stripeStatus.disabledReason,
            },
          }
        : null,

      // Connect account record
      connectAccount: statusResult.connectAccount
        ? {
            cardPaymentsCapability: statusResult.connectAccount.cardPaymentsCapability,
            transfersCapability: statusResult.connectAccount.transfersCapability,
            usBankAccountCapability: statusResult.connectAccount.usBankAccountCapability,
            defaultBankAccountLast4: statusResult.connectAccount.defaultBankAccountLast4,
            defaultBankAccountBankName: statusResult.connectAccount.defaultBankAccountBankName,
            lastSyncedAt: statusResult.connectAccount.lastSyncedAt,
          }
        : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting connect status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get status' },
      { status: 500 }
    );
  }
}
