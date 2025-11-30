/**
 * POST /api/webhooks/stripe
 *
 * Handles incoming Stripe webhook events with idempotency.
 * Processes both platform events and Connect account events.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPaymentProvider } from '@/lib/payments/providers';
import { handleWebhookEvent } from '@/lib/payments/stripe/webhook-handlers';

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Get provider and verify webhook
    const provider = getPaymentProvider();

    // Check if this is a Connect webhook (has Stripe-Account header)
    const connectedAccountId = request.headers.get('stripe-account') || undefined;

    // Verify the webhook signature
    let event;
    try {
      if (connectedAccountId && provider.verifyConnectWebhook) {
        event = await provider.verifyConnectWebhook(body, signature);
      } else {
        event = await provider.verifyWebhook(body, signature);
      }
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Check idempotency - have we processed this event before?
    const existingEvent = await prisma.stripeWebhookEvent.findUnique({
      where: { stripeEventId: event.id },
    });

    if (existingEvent?.processedAt) {
      // Already processed successfully
      console.log(`Event ${event.id} already processed, skipping`);
      return NextResponse.json({
        received: true,
        status: 'already_processed',
      });
    }

    // Record or update the event
    const webhookEvent = await prisma.stripeWebhookEvent.upsert({
      where: { stripeEventId: event.id },
      create: {
        stripeEventId: event.id,
        eventType: event.type,
        payload: body,
      },
      update: {
        retryCount: { increment: 1 },
      },
    });

    // Check retry limit (prevent infinite retries)
    if (webhookEvent.retryCount > 5) {
      console.error(`Event ${event.id} exceeded retry limit`);
      return NextResponse.json({
        received: true,
        status: 'retry_limit_exceeded',
      });
    }

    // Process the event
    try {
      await handleWebhookEvent(event.type, event.data, connectedAccountId);

      // Mark as successfully processed
      await prisma.stripeWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          processedAt: new Date(),
          error: null,
        },
      });

      const duration = Date.now() - startTime;
      console.log(`Webhook ${event.type} processed in ${duration}ms`);

      return NextResponse.json({
        received: true,
        status: 'processed',
        eventType: event.type,
      });
    } catch (error) {
      // Record the error but still return 200 to prevent Stripe retries
      // for errors we can't recover from
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await prisma.stripeWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          error: errorMessage,
        },
      });

      console.error(`Error processing webhook ${event.type}:`, error);

      // Return 200 to acknowledge receipt (we've recorded the error)
      // This prevents Stripe from retrying immediately
      return NextResponse.json({
        received: true,
        status: 'error_recorded',
        error: errorMessage,
      });
    }
  } catch (error) {
    console.error('Webhook handler error:', error);

    // Return 500 for infrastructure errors (database down, etc.)
    // This tells Stripe to retry
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Disable body parsing - we need raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};
