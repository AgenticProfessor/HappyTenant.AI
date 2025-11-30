/**
 * POST /api/payments/connect/refresh
 *
 * Manually syncs the Stripe Connect account status from Stripe.
 * Useful after onboarding completion or when status seems stale.
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncAccountStatus } from '@/lib/payments/stripe/connect';

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if account exists
    if (!user.organization.stripeConnectAccountId) {
      return NextResponse.json(
        { error: 'No connected account found' },
        { status: 400 }
      );
    }

    // Sync the account status
    const result = await syncAccountStatus(user.organization.stripeConnectAccountId);

    return NextResponse.json({
      success: true,
      status: result.organization.stripeConnectStatus,
      chargesEnabled: result.connectAccount.chargesEnabled,
      payoutsEnabled: result.connectAccount.payoutsEnabled,
      detailsSubmitted: result.connectAccount.detailsSubmitted,
      lastSyncedAt: result.connectAccount.lastSyncedAt,
    });
  } catch (error) {
    console.error('Error refreshing connect status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to refresh status' },
      { status: 500 }
    );
  }
}
