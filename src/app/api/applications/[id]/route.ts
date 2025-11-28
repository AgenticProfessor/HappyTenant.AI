import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for updating an application status
const applicationUpdateSchema = z.object({
  status: z.enum([
    'SUBMITTED',
    'UNDER_REVIEW',
    'PENDING_SCREENING',
    'SCREENING_COMPLETE',
    'APPROVED',
    'CONDITIONALLY_APPROVED',
    'DENIED',
    'WITHDRAWN',
    'LEASE_OFFERED',
    'LEASE_SIGNED'
  ]).optional(),
  reviewNotes: z.string().optional(),
  denialReason: z.string().optional(),
  conditionalApprovalTerms: z.string().optional(),
  applicationFeeReceived: z.boolean().optional(),
  applicationFeePaidAt: z.string().optional(),
})

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/applications/[id] - Get a single application with full details
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const application = await prisma.application.findFirst({
      where: {
        id,
        unit: {
          property: {
            organizationId: user.organizationId,
          },
        },
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        screeningResult: true,
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Calculate application score (simple example based on income-to-rent ratio)
    let score = 0
    const unit = application.unit
    const monthlyRent = Number(unit.marketRent)

    if (application.monthlyIncome) {
      const incomeToRentRatio = application.monthlyIncome / monthlyRent
      if (incomeToRentRatio >= 3) score += 30
      else if (incomeToRentRatio >= 2.5) score += 20
      else if (incomeToRentRatio >= 2) score += 10
    }

    if (application.employmentStatus === 'EMPLOYED_FULL_TIME') score += 20
    else if (application.employmentStatus === 'EMPLOYED_PART_TIME') score += 10
    else if (application.employmentStatus === 'SELF_EMPLOYED') score += 15

    if (application.rentalHistory && Array.isArray(application.rentalHistory)) {
      const historyLength = (application.rentalHistory as Array<unknown>).length
      if (historyLength >= 2) score += 20
      else if (historyLength >= 1) score += 10
    }

    if (application.references && Array.isArray(application.references)) {
      const refsLength = (application.references as Array<unknown>).length
      if (refsLength >= 2) score += 10
      else if (refsLength >= 1) score += 5
    }

    if (application.consentToBackgroundCheck && application.consentToCreditCheck) {
      score += 10
    }

    return NextResponse.json({
      application,
      analysis: {
        score: Math.min(score, 100),
        incomeToRentRatio: application.monthlyIncome ? (application.monthlyIncome / monthlyRent).toFixed(2) : null,
        hasRentalHistory: application.rentalHistory && Array.isArray(application.rentalHistory) && (application.rentalHistory as Array<unknown>).length > 0,
        hasReferences: application.references && Array.isArray(application.references) && (application.references as Array<unknown>).length > 0,
        hasScreeningConsent: application.consentToBackgroundCheck && application.consentToCreditCheck,
      },
    })
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/applications/[id] - Update an application (status, notes, etc.)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if application exists and belongs to user's organization
    const existingApplication = await prisma.application.findFirst({
      where: {
        id,
        unit: {
          property: {
            organizationId: user.organizationId,
          },
        },
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
      },
    })

    if (!existingApplication) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = applicationUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Update application in a transaction
    const application = await prisma.$transaction(async (tx) => {
      const updatedApplication = await tx.application.update({
        where: { id },
        data: {
          ...(data.status && { status: data.status }),
          ...(data.status === 'UNDER_REVIEW' && !existingApplication.reviewedAt && {
            reviewedAt: new Date(),
            reviewedBy: user.id,
          }),
          ...(data.reviewNotes !== undefined && { reviewNotes: data.reviewNotes }),
          ...(data.denialReason !== undefined && { denialReason: data.denialReason }),
          ...(data.conditionalApprovalTerms !== undefined && {
            conditionalApprovalTerms: data.conditionalApprovalTerms
          }),
          ...(data.applicationFeeReceived !== undefined && {
            applicationFeeReceived: data.applicationFeeReceived
          }),
          ...(data.applicationFeePaidAt !== undefined && {
            applicationFeePaidAt: data.applicationFeePaidAt ? new Date(data.applicationFeePaidAt) : null
          }),
        },
        include: {
          unit: {
            include: {
              property: true,
            },
          },
          screeningResult: true,
        },
      })

      // Handle status-specific side effects
      if (data.status) {
        // If approved and this is the only active application, keep unit as UNDER_APPLICATION
        // If denied/withdrawn, check if there are other active applications
        if (data.status === 'DENIED' || data.status === 'WITHDRAWN') {
          const otherActiveApplications = await tx.application.count({
            where: {
              unitId: existingApplication.unitId,
              id: { not: id },
              status: {
                notIn: ['DENIED', 'WITHDRAWN', 'LEASE_SIGNED'],
              },
            },
          })

          if (otherActiveApplications === 0) {
            await tx.unit.update({
              where: { id: existingApplication.unitId },
              data: { status: 'VACANT' },
            })
          }
        }

        // If lease is signed, convert to tenant
        if (data.status === 'LEASE_SIGNED') {
          // Check if tenant already exists for this email
          let tenant = await tx.tenant.findFirst({
            where: {
              organizationId: user.organizationId,
              email: existingApplication.email,
            },
          })

          if (!tenant) {
            // Create new tenant from application data
            tenant = await tx.tenant.create({
              data: {
                organizationId: user.organizationId,
                firstName: existingApplication.firstName,
                lastName: existingApplication.lastName,
                email: existingApplication.email,
                phone: existingApplication.phone,
                dateOfBirth: existingApplication.dateOfBirth,
                driversLicense: existingApplication.driversLicense,
                driversLicenseState: existingApplication.driversLicenseState,
                employmentStatus: existingApplication.employmentStatus,
                employerName: existingApplication.employerName,
                employerPhone: existingApplication.employerPhone,
                jobTitle: existingApplication.jobTitle,
                monthlyIncome: existingApplication.monthlyIncome,
                hasPets: existingApplication.hasPets,
                petDetails: existingApplication.pets ? JSON.stringify(existingApplication.pets) : null,
                hasVehicles: existingApplication.hasVehicles,
                vehicleDetails: existingApplication.vehicles ? JSON.stringify(existingApplication.vehicles) : null,
                householdMembers: existingApplication.additionalOccupants as Record<string, unknown>[] | undefined,
                emergencyContactName: existingApplication.emergencyContactName,
                emergencyContactPhone: existingApplication.emergencyContactPhone,
                emergencyContactRelation: existingApplication.emergencyContactRelation,
                screeningStatus: 'PASSED',
                isActive: true,
              },
            })
          }

          // Link application to the created tenant
          await tx.application.update({
            where: { id },
            data: { convertedToTenantId: tenant.id },
          })
        }
      }

      return updatedApplication
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'UPDATE',
        entityType: 'application',
        entityId: application.id,
        description: `Updated application for ${application.firstName} ${application.lastName}${data.status ? ` - Status: ${data.status}` : ''}`,
        previousValues: JSON.parse(JSON.stringify(existingApplication)),
        newValues: JSON.parse(JSON.stringify(application)),
      },
    })

    return NextResponse.json({ application })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/applications/[id] - Delete an application (only if not processed)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if application exists and belongs to user's organization
    const existingApplication = await prisma.application.findFirst({
      where: {
        id,
        unit: {
          property: {
            organizationId: user.organizationId,
          },
        },
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
      },
    })

    if (!existingApplication) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Only allow deleting unprocessed applications
    if (!['SUBMITTED', 'WITHDRAWN'].includes(existingApplication.status)) {
      return NextResponse.json(
        { error: 'Cannot delete application that has been processed. Mark as withdrawn instead.' },
        { status: 400 }
      )
    }

    // Delete application and update unit status if needed
    await prisma.$transaction(async (tx) => {
      await tx.application.delete({
        where: { id },
      })

      // Check if there are other active applications for the unit
      const otherActiveApplications = await tx.application.count({
        where: {
          unitId: existingApplication.unitId,
          status: {
            notIn: ['DENIED', 'WITHDRAWN', 'LEASE_SIGNED'],
          },
        },
      })

      if (otherActiveApplications === 0 && existingApplication.unit.status === 'UNDER_APPLICATION') {
        await tx.unit.update({
          where: { id: existingApplication.unitId },
          data: { status: 'VACANT' },
        })
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'DELETE',
        entityType: 'application',
        entityId: id,
        description: `Deleted application from ${existingApplication.firstName} ${existingApplication.lastName}`,
        previousValues: JSON.parse(JSON.stringify(existingApplication)),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
