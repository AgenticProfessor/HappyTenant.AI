/**
 * GET /api/tenant/payments/methods
 * POST /api/tenant/payments/methods
 *
 * List and save payment methods for a tenant.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import {
  listTenantPaymentMethods,
  savePaymentMethod,
} from '@/lib/payments/stripe/payment-methods';

const saveMethodSchema = z.object({
  tenantId: z.string().min(1),
  stripePaymentMethodId: z.string().min(1),
  setAsDefault: z.boolean().optional(),
});

// GET - List payment methods
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    const methods = await listTenantPaymentMethods(tenantId);

    return NextResponse.json({ methods });
  } catch (error) {
    console.error('Error listing payment methods:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list payment methods' },
      { status: 500 }
    );
  }
}

// POST - Save a new payment method after setup
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = saveMethodSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { tenantId, stripePaymentMethodId, setAsDefault } = validation.data;

    const method = await savePaymentMethod(tenantId, stripePaymentMethodId, setAsDefault);

    return NextResponse.json({ method });
  } catch (error) {
    console.error('Error saving payment method:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save payment method' },
      { status: 500 }
    );
  }
}
