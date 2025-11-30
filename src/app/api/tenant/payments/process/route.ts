/**
 * POST /api/tenant/payments/process
 *
 * Process a one-time payment from a tenant.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { processPayment, calculateFees } from '@/lib/payments/stripe/charge-payment';
import { prisma } from '@/lib/prisma';

const processPaymentSchema = z.object({
  tenantId: z.string().min(1),
  leaseId: z.string().min(1),
  chargeIds: z.array(z.string()).min(1),
  paymentMethodId: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().optional(),
});

const calculateFeesSchema = z.object({
  amount: z.number().positive(),
  paymentMethodType: z.enum(['US_BANK_ACCOUNT', 'CARD', 'APPLE_PAY', 'GOOGLE_PAY']),
  organizationId: z.string().min(1),
});

// POST - Process a payment
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if this is a fee calculation request
    if (body.action === 'calculate_fees') {
      const validation = calculateFeesSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.error.flatten() },
          { status: 400 }
        );
      }

      const { amount, paymentMethodType, organizationId } = validation.data;

      // Get organization's fee configuration
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: { feeConfiguration: true },
      });

      if (!org) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }

      const fees = calculateFees(
        amount,
        paymentMethodType,
        org.feeConfiguration as 'LANDLORD_ABSORBS' | 'TENANT_PAYS' | 'SPLIT_FEES'
      );

      return NextResponse.json({ fees });
    }

    // Process actual payment
    const validation = processPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const result = await processPayment(validation.data);

    if (result.success) {
      return NextResponse.json({
        success: true,
        paymentId: result.paymentId,
        status: result.status,
        amount: result.amount,
        fees: result.fees,
        netAmountToLandlord: result.netAmountToLandlord,
        receiptUrl: result.receiptUrl,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.failureReason,
          paymentId: result.paymentId,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process payment' },
      { status: 500 }
    );
  }
}
