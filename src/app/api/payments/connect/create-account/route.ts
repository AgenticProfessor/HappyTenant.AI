/**
 * POST /api/payments/connect/create-account
 *
 * Creates a new Stripe Connect Express account for the landlord's organization.
 * This is the first step in the payment onboarding flow.
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createConnectAccount } from '@/lib/payments/stripe/connect';

const createAccountSchema = z.object({
  businessType: z.enum(['individual', 'company']),
  businessEntityType: z.enum(['INDIVIDUAL', 'LLC', 'LP', 'S_CORP', 'C_CORP', 'TRUST', 'OTHER']),
  businessName: z.string().optional(),
});

export async function POST(request: Request) {
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

    // Only owners can set up payment accounts
    if (user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only organization owners can set up payment accounts' },
        { status: 403 }
      );
    }

    // Check if account already exists
    if (user.organization.stripeConnectAccountId) {
      return NextResponse.json(
        { error: 'Organization already has a connected account' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createAccountSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { businessType, businessEntityType, businessName } = validation.data;

    // Use organization email or user email
    const email = user.organization.email || user.email;

    // Create the connected account
    const result = await createConnectAccount({
      organizationId: user.organization.id,
      email,
      businessType,
      businessEntityType,
      businessName: businessName || user.organization.name,
    });

    return NextResponse.json({
      success: true,
      stripeAccountId: result.connectAccount.stripeAccountId,
      status: result.organization.stripeConnectStatus,
    });
  } catch (error) {
    console.error('Error creating connect account:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create account' },
      { status: 500 }
    );
  }
}
