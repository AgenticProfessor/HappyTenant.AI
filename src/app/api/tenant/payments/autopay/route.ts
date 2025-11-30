/**
 * GET/POST/PATCH/DELETE /api/tenant/payments/autopay
 *
 * Manage AutoPay schedules for tenants.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  setupAutoPay,
  getAutoPaySchedule,
  getTenantAutoPaySchedules,
  updateAutoPay,
  cancelAutoPay,
} from '@/lib/payments/stripe/autopay';

const setupSchema = z.object({
  tenantId: z.string().min(1),
  leaseId: z.string().min(1),
  paymentMethodId: z.string().min(1),
  dayOfMonth: z.number().int().min(1).max(28),
  amount: z.number().positive().optional(),
  chargeTypes: z.array(z.string()).optional(),
});

const updateSchema = z.object({
  tenantId: z.string().min(1),
  leaseId: z.string().min(1),
  paymentMethodId: z.string().optional(),
  dayOfMonth: z.number().int().min(1).max(28).optional(),
  amount: z.number().positive().optional(),
});

const cancelSchema = z.object({
  tenantId: z.string().min(1),
  leaseId: z.string().min(1),
});

// GET - Get AutoPay schedules
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const leaseId = searchParams.get('leaseId');

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    if (leaseId) {
      // Get specific schedule for a lease
      const schedule = await getAutoPaySchedule(tenantId, leaseId);
      return NextResponse.json({ schedule });
    }

    // Get all schedules for tenant
    const schedules = await getTenantAutoPaySchedules(tenantId);
    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Error getting AutoPay schedules:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get AutoPay schedules' },
      { status: 500 }
    );
  }
}

// POST - Set up AutoPay
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

    const result = await setupAutoPay(validation.data);

    if (result.success) {
      return NextResponse.json({ schedule: result.schedule });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Error setting up AutoPay:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to set up AutoPay' },
      { status: 500 }
    );
  }
}

// PATCH - Update AutoPay
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { tenantId, leaseId, ...updates } = validation.data;
    const result = await updateAutoPay(tenantId, leaseId, updates);

    if (result.success) {
      return NextResponse.json({ schedule: result.schedule });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating AutoPay:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update AutoPay' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel AutoPay
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const validation = cancelSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { tenantId, leaseId } = validation.data;
    const result = await cancelAutoPay(tenantId, leaseId);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Error canceling AutoPay:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel AutoPay' },
      { status: 500 }
    );
  }
}
