'use server'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import Stripe from 'stripe'

// Initialize Stripe for payment verification
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Lazy initialization to avoid build-time errors when API key is not set
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set - email sending will be disabled')
    return null
  }
  return new Resend(apiKey)
}

// Simple encryption for SSN (in production, use proper key management)
function encryptSSN(ssn: string): string {
  // Simple base64 encoding - in production use proper AES-256-GCM
  return Buffer.from(ssn).toString('base64')
}

// POST /api/applications/public/submit - Submit a new application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, formData } = body

    // Validate the token and get the application link
    const applicationLink = await prisma.applicationLink.findUnique({
      where: { token },
      include: {
        unit: {
          include: {
            property: {
              include: {
                organization: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!applicationLink) {
      return NextResponse.json(
        { error: 'Invalid application link' },
        { status: 404 }
      )
    }

    // Validate link is active
    if (!applicationLink.isActive) {
      return NextResponse.json(
        { error: 'This application link is no longer active' },
        { status: 410 }
      )
    }

    if (applicationLink.expiresAt && new Date() > applicationLink.expiresAt) {
      return NextResponse.json(
        { error: 'This application link has expired' },
        { status: 410 }
      )
    }

    if (
      applicationLink.maxApplications &&
      applicationLink.applicationsReceived >= applicationLink.maxApplications
    ) {
      return NextResponse.json(
        { error: 'Maximum applications reached' },
        { status: 410 }
      )
    }

    // unitId is required for Application
    if (!applicationLink.unitId) {
      return NextResponse.json(
        { error: 'This application link is not associated with a specific unit' },
        { status: 400 }
      )
    }

    // Extract data from the wizard form
    const { personalInfo, employment, rentalHistory, references, additionalInfo, consent, payment } = formData

    // Check if payment is required and verify it
    const applicationFee = applicationLink.applicationFee ? Number(applicationLink.applicationFee) : 0
    const requiresPayment = applicationFee > 0 && applicationLink.collectFeeOnline
    let applicationFeePaid = false
    let stripePaymentIntentId: string | null = null

    if (requiresPayment) {
      // Payment is required - verify the payment intent
      if (!payment?.paymentIntentId) {
        return NextResponse.json(
          { error: 'Payment is required for this application' },
          { status: 400 }
        )
      }

      try {
        // Verify the payment with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(payment.paymentIntentId)

        if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'processing') {
          return NextResponse.json(
            { error: 'Payment has not been completed. Please complete payment before submitting.' },
            { status: 400 }
          )
        }

        // Verify the payment amount matches the application fee
        const expectedAmount = Math.round(applicationFee * 100)
        if (paymentIntent.amount !== expectedAmount) {
          return NextResponse.json(
            { error: 'Payment amount does not match the required application fee' },
            { status: 400 }
          )
        }

        // Verify the payment is for this application link (via metadata)
        if (paymentIntent.metadata?.applicationLinkId !== applicationLink.id) {
          return NextResponse.json(
            { error: 'Payment is not associated with this application' },
            { status: 400 }
          )
        }

        applicationFeePaid = true
        stripePaymentIntentId = payment.paymentIntentId
      } catch (stripeError) {
        console.error('Error verifying payment:', stripeError)
        return NextResponse.json(
          { error: 'Unable to verify payment. Please try again.' },
          { status: 400 }
        )
      }
    }

    // Encrypt SSN if provided
    let ssnEncrypted: string | null = null
    if (personalInfo?.ssn) {
      ssnEncrypted = encryptSSN(personalInfo.ssn)
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationExpiry = new Date()
    verificationExpiry.setHours(verificationExpiry.getHours() + 24)

    // Create the application
    const application = await prisma.application.create({
      data: {
        // Required relations
        unitId: applicationLink.unitId,
        applicationLinkId: applicationLink.id,

        // Personal Info
        firstName: personalInfo?.firstName || '',
        lastName: personalInfo?.lastName || '',
        email: personalInfo?.email || '',
        phone: personalInfo?.phone || null,
        dateOfBirth: personalInfo?.dateOfBirth
          ? new Date(personalInfo.dateOfBirth)
          : null,
        ssnEncrypted,
        driversLicense: personalInfo?.driversLicense || null,
        driversLicenseState: personalInfo?.driversLicenseState || null,

        // Employment
        employmentStatus: employment?.employmentStatus || null,
        employerName: employment?.employerName || null,
        employerPhone: employment?.employerPhone || null,
        employerAddress: employment?.employerAddress || null,
        jobTitle: employment?.jobTitle || null,
        monthlyIncome: employment?.monthlyIncome || null,
        additionalIncome: employment?.additionalIncome || null,
        additionalIncomeSource: employment?.additionalIncomeSource || null,

        // Rental History
        currentAddress: rentalHistory?.currentAddress || null,
        currentCity: rentalHistory?.currentCity || null,
        currentState: rentalHistory?.currentState || null,
        currentZip: rentalHistory?.currentZip || null,
        currentLandlordName: rentalHistory?.currentLandlordName || null,
        currentLandlordPhone: rentalHistory?.currentLandlordPhone || null,
        currentRent: rentalHistory?.currentRent || null,
        currentMoveInDate: rentalHistory?.currentMoveInDate
          ? new Date(rentalHistory.currentMoveInDate)
          : null,
        reasonForMoving: rentalHistory?.reasonForMoving || null,
        rentalHistoryJson: rentalHistory?.previousAddresses || null,

        // References
        references: references?.references || null,

        // Additional Info
        hasPets: additionalInfo?.hasPets || false,
        petsJson: additionalInfo?.pets || null,
        hasVehicles: additionalInfo?.hasVehicles || false,
        vehiclesJson: additionalInfo?.vehicles || null,
        additionalOccupantsJson: additionalInfo?.additionalOccupants || null,
        emergencyContactName: additionalInfo?.emergencyContact?.name || null,
        emergencyContactRelation: additionalInfo?.emergencyContact?.relationship || null,
        emergencyContactPhone: additionalInfo?.emergencyContact?.phone || null,
        coApplicants: additionalInfo?.coApplicants || null,

        // Consent & Move-in
        desiredMoveInDate: consent?.desiredMoveInDate
          ? new Date(consent.desiredMoveInDate)
          : null,
        desiredLeaseTermMonths: consent?.desiredLeaseTermMonths || null,
        consentToBackgroundCheck: consent?.consentToBackgroundCheck || false,
        consentToCreditCheck: consent?.consentToCreditCheck || false,
        notes: consent?.additionalComments || null,

        // Status
        status: 'NEW',

        // Payment info
        applicationFeePaid,
        stripePaymentIntentId,
      },
    })

    // Create email verification record
    await prisma.applicationVerification.create({
      data: {
        applicationId: application.id,
        email: personalInfo?.email || '',
        code: verificationCode,
        expiresAt: verificationExpiry,
      },
    })

    // Update application count on link
    await prisma.applicationLink.update({
      where: { id: applicationLink.id },
      data: { applicationsReceived: { increment: 1 } },
    })

    // Get organization name for email
    const organizationName = applicationLink.unit?.property?.organization?.name || 'Property Manager'
    const propertyName = applicationLink.unit?.property?.name || 'the property'
    const propertyAddress = applicationLink.unit?.property?.addressLine1 || ''
    const propertyCity = applicationLink.unit?.property?.city || ''
    const propertyState = applicationLink.unit?.property?.state || ''

    // Send verification email with code
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/apply/verify?applicationId=${application.id}`

    try {
      const resend = getResendClient()
      if (!resend) {
        console.warn('Email sending skipped - Resend not configured')
      } else {
        await resend.emails.send({
        from: `${organizationName} <applications@${process.env.RESEND_DOMAIN || 'happytenant.ai'}>`,
        to: personalInfo?.email || '',
        subject: `Verify your application for ${propertyName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your Application</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #10b981; margin-bottom: 10px;">Application Received!</h1>
                <p style="color: #64748b; font-size: 16px;">Thank you for applying, ${personalInfo?.firstName || 'Applicant'}!</p>
              </div>

              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                <h2 style="color: #065f46; margin-top: 0;">Please verify your email</h2>
                <p style="color: #047857;">
                  Use the verification code below to confirm your email address.
                </p>
                <div style="text-align: center; margin: 24px 0;">
                  <div style="display: inline-block; background: white; border: 2px dashed #10b981; padding: 16px 32px; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #065f46;">
                    ${verificationCode}
                  </div>
                </div>
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Or <a href="${verificationUrl}" style="color: #10b981;">click here</a> to enter the code on our website.
                </p>
                <p style="color: #6b7280; font-size: 14px;">
                  This code will expire in 24 hours.
                </p>
              </div>

              <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h3 style="color: #334155; margin-top: 0;">Application Details</h3>
                <p style="margin: 8px 0; color: #475569;">
                  <strong>Property:</strong> ${propertyName}
                </p>
                ${applicationLink.unit ? `
                  <p style="margin: 8px 0; color: #475569;">
                    <strong>Unit:</strong> ${applicationLink.unit.unitNumber || 'N/A'}
                  </p>
                  <p style="margin: 8px 0; color: #475569;">
                    <strong>Address:</strong> ${propertyAddress}, ${propertyCity}, ${propertyState}
                  </p>
                ` : ''}
                <p style="margin: 8px 0; color: #475569;">
                  <strong>Application ID:</strong> ${application.id.slice(-8).toUpperCase()}
                </p>
              </div>

              <div style="text-align: center; color: #94a3b8; font-size: 14px;">
                <p>If you didn't submit this application, please ignore this email.</p>
                <p style="margin-top: 20px;">
                  Powered by <a href="https://happytenant.ai" style="color: #10b981; text-decoration: none;">HappyTenant.AI</a>
                </p>
              </div>
            </body>
          </html>
        `,
        })
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      message: 'Application submitted successfully. Please check your email to verify.',
    })
  } catch (error) {
    console.error('Error submitting application:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
