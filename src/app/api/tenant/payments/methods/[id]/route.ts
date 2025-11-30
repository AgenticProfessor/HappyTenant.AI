/**
 * GET/PATCH/DELETE /api/tenant/payments/methods/[id]
 *
 * Manage individual payment methods.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getTenantPaymentMethod,
  setDefaultPaymentMethod,
  removePaymentMethod,
  updatePaymentMethodNickname,
} from '@/lib/payments/stripe/payment-methods';

const updateSchema = z.object({
  tenantId: z.string().min(1),
  setAsDefault: z.boolean().optional(),
  nickname: z.string().max(50).optional(),
});

const deleteSchema = z.object({
  tenantId: z.string().min(1),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get payment method details
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    const method = await getTenantPaymentMethod(id, tenantId);

    if (!method) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
    }

    return NextResponse.json({ method });
  } catch (error) {
    console.error('Error getting payment method:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get payment method' },
      { status: 500 }
    );
  }
}

// PATCH - Update payment method (set default, nickname)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { tenantId, setAsDefault, nickname } = validation.data;

    if (setAsDefault) {
      await setDefaultPaymentMethod(tenantId, id);
    }

    if (nickname !== undefined) {
      await updatePaymentMethodNickname(tenantId, id, nickname);
    }

    const method = await getTenantPaymentMethod(id, tenantId);

    return NextResponse.json({ method });
  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update payment method' },
      { status: 500 }
    );
  }
}

// DELETE - Remove payment method
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = deleteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { tenantId } = validation.data;

    await removePaymentMethod(tenantId, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing payment method:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove payment method' },
      { status: 500 }
    );
  }
}
