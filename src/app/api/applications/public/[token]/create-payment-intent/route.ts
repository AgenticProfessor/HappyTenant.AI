/**
 * POST /api/applications/public/[token]/create-payment-intent
 *
 * Creates a Stripe PaymentIntent for the application fee.
 * This is called before the applicant can proceed with the application.
 */

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Get the application link
    const link = await prisma.applicationLink.findUnique({
      where: { token },
      include: {
        unit: {
          select: {
            unitNumber: true,
            property: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    if (!link) {
      return NextResponse.json({ error: 'Application link not found' }, { status: 404 })
    }

    // Get the organization for Stripe Connect info
    const organization = await prisma.organization.findUnique({
      where: { id: link.organizationId },
      select: {
        name: true,
        stripeConnectAccountId: true,
        stripeConnectStatus: true,
      },
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    if (!link.isActive) {
      return NextResponse.json({ error: 'Application link is no longer active' }, { status: 400 })
    }

    // Check if link has expired
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Application link has expired' }, { status: 400 })
    }

    // Check if fee is required
    if (!link.applicationFee || Number(link.applicationFee) <= 0) {
      return NextResponse.json({ error: 'No application fee required' }, { status: 400 })
    }

    if (!link.collectFeeOnline) {
      return NextResponse.json({ error: 'Online fee collection is not enabled' }, { status: 400 })
    }

    const feeAmount = Number(link.applicationFee)

    // Get applicant email from request body (optional, for receipt)
    const body = await request.json().catch(() => ({}))
    const applicantEmail = body.email as string | undefined

    // Create a PaymentIntent
    // For application fees, we route to the organization's connected account if available
    // Platform keeps a small portion as application fee
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(feeAmount * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        type: 'application_fee',
        applicationLinkId: link.id,
        applicationLinkToken: link.token,
        organizationId: link.organizationId,
        unitId: link.unitId || '',
        propertyName: link.unit?.property?.name || '',
        unitNumber: link.unit?.unitNumber || '',
      },
      description: link.unit
        ? `Application fee for ${link.unit.property.name} - Unit ${link.unit.unitNumber}`
        : `Application fee for ${organization.name}`,
    }

    // If organization has an active Stripe Connect account, use destination charge
    // Platform keeps the full application fee (it's a service fee)
    if (
      organization.stripeConnectAccountId &&
      organization.stripeConnectStatus === 'ACTIVE'
    ) {
      // Route to connected account, platform keeps 100% as application fee service
      paymentIntentParams.transfer_data = {
        destination: organization.stripeConnectAccountId,
      }
      // Transfer 0 to landlord (platform keeps the application fee)
      paymentIntentParams.transfer_data.amount = 0
    }

    // Add receipt email if provided
    if (applicantEmail) {
      paymentIntentParams.receipt_email = applicantEmail
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: feeAmount,
    })
  } catch (error) {
    console.error('Error creating payment intent for application fee:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
