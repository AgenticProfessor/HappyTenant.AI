/**
 * GET /api/payments/connect/onboarding-url
 *
 * Returns a Stripe Connect onboarding URL that redirects the landlord
 * to complete their account setup (KYC, bank account, etc.).
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOnboardingUrl } from '@/lib/payments/stripe/connect';

export async function GET(request: Request) {
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

    // Only owners can access onboarding
    if (user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only organization owners can complete payment onboarding' },
        { status: 403 }
      );
    }

    // Check if account exists
    if (!user.organization.stripeConnectAccountId) {
      return NextResponse.json(
        { error: 'No connected account found. Please create one first.' },
        { status: 400 }
      );
    }

    // Get optional custom return/refresh URLs from query params
    const { searchParams } = new URL(request.url);
    const refreshUrl = searchParams.get('refreshUrl') || undefined;
    const returnUrl = searchParams.get('returnUrl') || undefined;

    // Get the onboarding URL
    const result = await getOnboardingUrl(
      user.organization.id,
      refreshUrl,
      returnUrl
    );

    return NextResponse.json({
      url: result.url,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error('Error getting onboarding URL:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get onboarding URL' },
      { status: 500 }
    );
  }
}
