/**
 * POST /api/tenant/payments/setup
 *
 * Creates a setup session for adding a new payment method.
 * Returns a client secret for Stripe Elements.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createPaymentMethodSetupSession } from '@/lib/payments/stripe/payment-methods';

const setupSchema = z.object({
  tenantId: z.string().min(1),
  paymentMethodTypes: z.array(z.enum(['card', 'us_bank_account'])).min(1),
  returnUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = setupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { tenantId, paymentMethodTypes, returnUrl } = validation.data;

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Create setup session
    const session = await createPaymentMethodSetupSession({
      tenantId,
      paymentMethodTypes,
      returnUrl,
    });

    return NextResponse.json({
      clientSecret: session.clientSecret,
      sessionId: session.sessionId,
      stripeCustomerId: session.stripeCustomerId,
    });
  } catch (error) {
    console.error('Error creating setup session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create setup session' },
      { status: 500 }
    );
  }
}
