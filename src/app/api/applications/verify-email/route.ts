'use server'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/applications/verify-email - Verify email address with code
export async function POST(request: NextRequest) {
  try {
    const { applicationId, code } = await request.json()

    if (!applicationId || !code) {
      return NextResponse.json(
        { error: 'Application ID and verification code are required' },
        { status: 400 }
      )
    }

    // Find the verification record by applicationId and code
    const verification = await prisma.applicationVerification.findFirst({
      where: {
        applicationId,
        code,
      },
      include: {
        application: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
      },
    })

    if (!verification) {
      // Increment attempts to prevent brute force
      await prisma.applicationVerification.updateMany({
        where: { applicationId },
        data: { attempts: { increment: 1 } },
      })

      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 404 }
      )
    }

    // Check if too many attempts
    if (verification.attempts >= 5) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new code.' },
        { status: 429 }
      )
    }

    // Check if already verified
    if (verification.verified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        applicationId: verification.applicationId,
        message: 'Email already verified',
      })
    }

    // Check if expired
    if (new Date() > verification.expiresAt) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new code.' },
        { status: 410 }
      )
    }

    // Mark as verified
    await prisma.$transaction([
      prisma.applicationVerification.update({
        where: { id: verification.id },
        data: {
          verified: true,
          verifiedAt: new Date(),
        },
      }),
      prisma.application.update({
        where: { id: verification.applicationId },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      }),
      // Add status history entry
      prisma.applicationStatusHistory.create({
        data: {
          applicationId: verification.applicationId,
          fromStatus: 'NEW',
          toStatus: 'NEW',
          reason: 'Email verified',
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      applicationId: verification.applicationId,
      propertyName: verification.application.unit?.property?.name,
      message: 'Email verified successfully',
    })
  } catch (error) {
    console.error('Error verifying email:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}
