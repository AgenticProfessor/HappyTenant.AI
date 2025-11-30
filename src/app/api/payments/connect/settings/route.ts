/**
 * GET/PATCH /api/payments/connect/settings
 *
 * Manage payment settings for the organization:
 * - Fee configuration (who pays processing fees)
 * - Payout delay settings
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { updatePayoutDelay } from '@/lib/payments/stripe/connect';

const updateSettingsSchema = z.object({
  feeConfiguration: z.enum(['LANDLORD_ABSORBS', 'TENANT_PAYS', 'SPLIT_FEES']).optional(),
  payoutDelayDays: z.number().min(2).max(14).optional(),
});

// GET /api/payments/connect/settings
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

    const org = user.organization;

    return NextResponse.json({
      feeConfiguration: org.feeConfiguration,
      payoutDelayDays: org.payoutDelayDays,
      payoutDelayMinimum: org.payoutDelayMinimum,
      trustLevel: org.accountTrustLevel,
      stripeConnectStatus: org.stripeConnectStatus,
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get settings' },
      { status: 500 }
    );
  }
}

// PATCH /api/payments/connect/settings
export async function PATCH(request: Request) {
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

    // Only owners can update payment settings
    if (user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only organization owners can update payment settings' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateSettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { feeConfiguration, payoutDelayDays } = validation.data;
    const org = user.organization;

    // Update payout delay in Stripe if changed
    if (payoutDelayDays !== undefined && payoutDelayDays !== org.payoutDelayDays) {
      if (!org.stripeConnectAccountId) {
        return NextResponse.json(
          { error: 'No connected account found' },
          { status: 400 }
        );
      }

      // This validates against the minimum and updates both Stripe and DB
      await updatePayoutDelay(org.id, payoutDelayDays);
    }

    // Update fee configuration if changed
    if (feeConfiguration !== undefined && feeConfiguration !== org.feeConfiguration) {
      await prisma.organization.update({
        where: { id: org.id },
        data: { feeConfiguration },
      });
    }

    // Get updated organization
    const updatedOrg = await prisma.organization.findUnique({
      where: { id: org.id },
    });

    return NextResponse.json({
      success: true,
      feeConfiguration: updatedOrg?.feeConfiguration,
      payoutDelayDays: updatedOrg?.payoutDelayDays,
      payoutDelayMinimum: updatedOrg?.payoutDelayMinimum,
      trustLevel: updatedOrg?.accountTrustLevel,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update settings' },
      { status: 500 }
    );
  }
}
