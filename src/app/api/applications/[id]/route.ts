import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for updating an application status
const applicationUpdateSchema = z.object({
  status: z.enum([
    'NEW',
    'UNDER_REVIEW',
    'SCREENING_IN_PROGRESS',
    'APPROVED',
    'DECLINED',
    'WAITLIST',
    'WITHDRAWN',
    'LEASE_SIGNED'
  ]).optional(),
  notes: z.string().optional(),
  decisionReason: z.string().optional(),
  applicationFeePaid: z.boolean().optional(),
  statusReason: z.string().optional(),
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

    // Try to find application by organization (either through unit or direct organizationId)
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
        applicationLink: true,
        applicationNotes: {
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        screeningResults: true,
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Return the full application data
    return NextResponse.json(application)
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
          ...(data.status && {
            status: data.status,
            ...(data.status === 'APPROVED' || data.status === 'DECLINED' ? {
              decidedAt: new Date(),
              decidedByUserId: user.id,
            } : {}),
          }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.decisionReason !== undefined && { decisionReason: data.decisionReason }),
          ...(data.applicationFeePaid !== undefined && {
            applicationFeePaid: data.applicationFeePaid
          }),
        },
        include: {
          unit: {
            include: {
              property: true,
            },
          },
          screeningResults: true,
        },
      })

      // Track status history if status changed
      if (data.status && data.status !== existingApplication.status) {
        await tx.applicationStatusHistory.create({
          data: {
            applicationId: id,
            fromStatus: existingApplication.status,
            toStatus: data.status,
            changedByUserId: user.id,
            reason: data.statusReason || data.decisionReason || null,
          },
        })
      }

      // Handle status-specific side effects
      if (data.status) {
        // If approved and this is the only active application, keep unit as UNDER_APPLICATION
        // If denied/withdrawn/rejected, check if there are other active applications
        if (data.status === 'DECLINED' || data.status === 'WITHDRAWN') {
          const otherActiveApplications = await tx.application.count({
            where: {
              unitId: existingApplication.unitId,
              id: { not: id },
              status: {
                notIn: ['DECLINED', 'WITHDRAWN', 'LEASE_SIGNED'],
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
                employerName: existingApplication.employerName,
                jobTitle: existingApplication.jobTitle,
                monthlyIncome: existingApplication.monthlyIncome,
                hasPets: existingApplication.hasPets,
                petDetails: existingApplication.petDetails,
                hasVehicles: existingApplication.hasVehicles,
                vehicleDetails: existingApplication.vehicleDetails,
                householdMembers: existingApplication.coApplicants ?? undefined,
                screeningStatus: 'PASSED',
                isActive: true,
              },
            })
          }

          // Link application to the created tenant
          await tx.application.update({
            where: { id },
            data: { tenantId: tenant.id },
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
    if (!['NEW', 'WITHDRAWN'].includes(existingApplication.status)) {
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
            notIn: ['DECLINED', 'WITHDRAWN', 'LEASE_SIGNED'],
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
