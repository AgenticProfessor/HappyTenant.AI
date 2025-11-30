/**
 * GET /api/payments/connect/dashboard
 *
 * Returns a URL to the Stripe Express Dashboard for the landlord
 * to manage their payouts, view transactions, and update settings.
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getExpressDashboardUrl } from '@/lib/payments/stripe/connect';

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
        organization: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only owners and managers can access the dashboard
    if (user.role !== 'OWNER' && user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Insufficient permissions to access payment dashboard' },
        { status: 403 }
      );
    }

    // Check if account exists
    if (!user.organization.stripeConnectAccountId) {
      return NextResponse.json(
        { error: 'No connected account found. Please complete payment setup first.' },
        { status: 400 }
      );
    }

    // Check if account is active
    if (user.organization.stripeConnectStatus !== 'ACTIVE') {
      return NextResponse.json(
        {
          error: 'Account must be fully active to access the dashboard',
          status: user.organization.stripeConnectStatus,
        },
        { status: 400 }
      );
    }

    // Get the dashboard URL
    const url = await getExpressDashboardUrl(user.organization.id);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error getting dashboard URL:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get dashboard URL' },
      { status: 500 }
    );
  }
}
