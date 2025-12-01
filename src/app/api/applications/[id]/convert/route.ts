import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const convertSchema = z.object({
  leaseType: z.enum(['fixed', 'month_to_month']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  rentAmount: z.number().min(1, 'Rent amount is required'),
  rentDueDay: z.number().min(1).max(28),
  securityDeposit: z.number().min(0),
  sendWelcomeEmail: z.boolean(),
  createUserAccount: z.boolean(),
})

// POST /api/applications/[id]/convert - Convert application to tenant
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Validate input
    const validationResult = convertSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Get application and verify access
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        unit: {
          include: {
            property: {
              include: {
                organization: true,
              },
            },
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Verify user has access to this organization
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { organizationId: true },
    })

    if (!user || user.organizationId !== application.unit?.property?.organization?.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check application status - must be APPROVED
    if (application.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Application must be approved before converting to tenant' },
        { status: 400 }
      )
    }

    // Use transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Create or update tenant
      let tenant
      if (application.tenantId) {
        // Update existing tenant record
        tenant = await tx.tenant.update({
          where: { id: application.tenantId },
          data: {
            monthlyIncome: application.monthlyIncome ? Number(application.monthlyIncome) : undefined,
            employerName: application.employerName,
          },
        })
      } else {
        // Create new tenant
        tenant = await tx.tenant.create({
          data: {
            organizationId: user.organizationId,
            firstName: application.firstName,
            lastName: application.lastName,
            email: application.email,
            phone: application.phone,
            monthlyIncome: application.monthlyIncome ? Number(application.monthlyIncome) : undefined,
            employerName: application.employerName,
            emergencyContactName: application.emergencyContactName,
            emergencyContactPhone: application.emergencyContactPhone,
          },
        })

        // Link tenant to application
        await tx.application.update({
          where: { id },
          data: { tenantId: tenant.id },
        })
      }

      // Create user account if requested
      if (data.createUserAccount) {
        // Check if user already exists with this email
        const existingUser = await tx.user.findUnique({
          where: { email: application.email },
        })

        if (!existingUser) {
          // Create user account for tenant
          const tenantUser = await tx.user.create({
            data: {
              organizationId: user.organizationId,
              email: application.email,
              firstName: application.firstName,
              lastName: application.lastName,
              phone: application.phone,
              role: 'STAFF', // Limited role for tenants
              isActive: true,
            },
          })

          // Link user to tenant
          await tx.tenant.update({
            where: { id: tenant.id },
            data: { userId: tenantUser.id },
          })
        }
      }

      // Create lease
      const lease = await tx.lease.create({
        data: {
          unitId: application.unitId,
          leaseType: data.leaseType === 'fixed' ? 'FIXED' : 'MONTH_TO_MONTH',
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          rentAmount: data.rentAmount,
          rentDueDay: data.rentDueDay,
          securityDeposit: data.securityDeposit,
          status: 'ACTIVE',
          lateFeeAmount: 50, // Default late fee
          lateFeeGraceDays: 5, // Default grace period
        },
      })

      // Create lease-tenant relationship
      await tx.leaseTenant.create({
        data: {
          leaseId: lease.id,
          tenantId: tenant.id,
          role: 'PRIMARY',
          moveInDate: new Date(data.startDate),
        },
      })

      // Update unit status to OCCUPIED
      await tx.unit.update({
        where: { id: application.unitId },
        data: { status: 'OCCUPIED' },
      })

      // Update application status to LEASE_SIGNED
      await tx.application.update({
        where: { id },
        data: { status: 'LEASE_SIGNED' },
      })

      // Add status history
      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus: 'APPROVED',
          toStatus: 'LEASE_SIGNED',
          changedByUserId: session.userId,
          reason: 'Converted to tenant and lease created',
        },
      })

      // Create security deposit charge if any
      if (data.securityDeposit > 0) {
        await tx.charge.create({
          data: {
            leaseId: lease.id,
            tenantId: tenant.id,
            type: 'SECURITY_DEPOSIT',
            amount: data.securityDeposit,
            description: 'Security deposit',
            dueDate: new Date(data.startDate),
            status: 'PENDING',
          },
        })
      }

      // Create first month's rent charge
      await tx.charge.create({
        data: {
          leaseId: lease.id,
          tenantId: tenant.id,
          type: 'RENT',
          amount: data.rentAmount,
          description: `Rent for ${new Date(data.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          dueDate: new Date(data.startDate),
          status: 'PENDING',
        },
      })

      return {
        tenantId: tenant.id,
        leaseId: lease.id,
      }
    })

    // TODO: Send welcome email if requested
    // if (data.sendWelcomeEmail) {
    //   await sendWelcomeEmail(application.email, application.firstName, ...)
    // }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error converting application:', error)
    return NextResponse.json(
      { error: 'Failed to convert application to tenant' },
      { status: 500 }
    )
  }
}
