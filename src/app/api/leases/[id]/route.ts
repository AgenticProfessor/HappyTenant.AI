import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for updating a lease
const leaseUpdateSchema = z.object({
  leaseType: z.enum(['FIXED', 'MONTH_TO_MONTH', 'WEEK_TO_WEEK']).optional(),
  endDate: z.string().optional(),
  rentAmount: z.number().min(0).optional(),
  rentDueDay: z.number().min(1).max(28).optional(),
  lateFeeAmount: z.number().optional(),
  lateFeeType: z.enum(['FLAT', 'PERCENTAGE', 'DAILY']).optional(),
  lateFeeGraceDays: z.number().min(0).optional(),
  recurringCharges: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    frequency: z.string(),
  })).optional(),
  status: z.enum(['DRAFT', 'PENDING_SIGNATURE', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED']).optional(),
  terminationDate: z.string().optional(),
  terminationReason: z.string().optional(),
  moveOutDate: z.string().optional(),
  noticeGivenDate: z.string().optional(),
  noticeGivenBy: z.string().optional(),
  notes: z.string().optional(),
})

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/leases/[id] - Get a single lease with full details
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

    const lease = await prisma.lease.findFirst({
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
        leaseTenants: {
          include: {
            tenant: true,
          },
        },
        charges: {
          orderBy: { dueDate: 'desc' },
          include: {
            paymentAllocations: {
              include: {
                payment: true,
              },
            },
          },
        },
        payments: {
          orderBy: { receivedAt: 'desc' },
          include: {
            paymentAllocations: {
              include: {
                charge: true,
              },
            },
          },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
    })

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    // Calculate rent ledger summary
    const totalCharges = lease.charges
      .filter(c => c.status !== 'VOID' && c.status !== 'WAIVED')
      .reduce((sum, c) => sum + Number(c.amount), 0)

    const totalPaid = lease.payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.amount), 0)

    const balance = totalCharges - totalPaid

    // Build rent ledger (charges and payments in chronological order)
    const ledgerItems = [
      ...lease.charges.map(c => ({
        type: 'charge' as const,
        id: c.id,
        date: c.dueDate,
        description: c.description,
        amount: Number(c.amount),
        status: c.status,
        chargeType: c.type,
      })),
      ...lease.payments.map(p => ({
        type: 'payment' as const,
        id: p.id,
        date: p.receivedAt,
        description: `Payment - ${p.method}`,
        amount: -Number(p.amount),
        status: p.status,
      })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate running balance for ledger
    let runningBalance = 0
    const ledgerWithBalance = ledgerItems.map(item => {
      runningBalance += item.amount
      return { ...item, balance: runningBalance }
    })

    return NextResponse.json({
      lease,
      summary: {
        totalCharges,
        totalPaid,
        balance,
        rentAmount: Number(lease.rentAmount),
        securityDeposit: Number(lease.securityDeposit),
        daysUntilEnd: lease.endDate
          ? Math.ceil((new Date(lease.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null,
      },
      ledger: ledgerWithBalance,
    })
  } catch (error) {
    console.error('Error fetching lease:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/leases/[id] - Update a lease
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

    // Check if lease exists and belongs to user's organization
    const existingLease = await prisma.lease.findFirst({
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

    if (!existingLease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = leaseUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Update lease in a transaction
    const lease = await prisma.$transaction(async (tx) => {
      const updatedLease = await tx.lease.update({
        where: { id },
        data: {
          ...(data.leaseType && { leaseType: data.leaseType }),
          ...(data.endDate !== undefined && {
            endDate: data.endDate ? new Date(data.endDate) : null
          }),
          ...(data.rentAmount !== undefined && { rentAmount: data.rentAmount }),
          ...(data.rentDueDay !== undefined && { rentDueDay: data.rentDueDay }),
          ...(data.lateFeeAmount !== undefined && { lateFeeAmount: data.lateFeeAmount }),
          ...(data.lateFeeType && { lateFeeType: data.lateFeeType }),
          ...(data.lateFeeGraceDays !== undefined && { lateFeeGraceDays: data.lateFeeGraceDays }),
          ...(data.recurringCharges !== undefined && { recurringCharges: data.recurringCharges }),
          ...(data.status && { status: data.status }),
          ...(data.terminationDate !== undefined && {
            terminationDate: data.terminationDate ? new Date(data.terminationDate) : null
          }),
          ...(data.terminationReason !== undefined && { terminationReason: data.terminationReason }),
          ...(data.moveOutDate !== undefined && {
            moveOutDate: data.moveOutDate ? new Date(data.moveOutDate) : null
          }),
          ...(data.noticeGivenDate !== undefined && {
            noticeGivenDate: data.noticeGivenDate ? new Date(data.noticeGivenDate) : null
          }),
          ...(data.noticeGivenBy !== undefined && { noticeGivenBy: data.noticeGivenBy }),
          ...(data.notes !== undefined && { notes: data.notes }),
        },
        include: {
          unit: {
            include: {
              property: true,
            },
          },
          leaseTenants: {
            include: {
              tenant: true,
            },
          },
        },
      })

      // Update unit status based on lease status
      if (data.status) {
        let unitStatus: 'VACANT' | 'OCCUPIED' | 'NOTICE_GIVEN' = 'OCCUPIED'

        if (data.status === 'TERMINATED' || data.status === 'EXPIRED') {
          unitStatus = 'VACANT'
        } else if (data.noticeGivenDate) {
          unitStatus = 'NOTICE_GIVEN'
        }

        await tx.unit.update({
          where: { id: existingLease.unitId },
          data: { status: unitStatus },
        })
      }

      return updatedLease
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'UPDATE',
        entityType: 'lease',
        entityId: lease.id,
        description: `Updated lease for unit ${existingLease.unit.unitNumber}`,
        previousValues: JSON.parse(JSON.stringify(existingLease)),
        newValues: JSON.parse(JSON.stringify(lease)),
      },
    })

    return NextResponse.json({ lease })
  } catch (error) {
    console.error('Error updating lease:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/leases/[id] - Delete a lease (only if in DRAFT status)
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

    // Check if lease exists and belongs to user's organization
    const existingLease = await prisma.lease.findFirst({
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
        leaseTenants: {
          include: {
            tenant: true,
          },
        },
      },
    })

    if (!existingLease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    // Only allow deleting draft leases
    if (existingLease.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Can only delete draft leases. Use termination for active leases.' },
        { status: 400 }
      )
    }

    // Delete lease and related records in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete lease tenants
      await tx.leaseTenant.deleteMany({
        where: { leaseId: id },
      })

      // Delete charges
      await tx.charge.deleteMany({
        where: { leaseId: id },
      })

      // Delete the lease
      await tx.lease.delete({
        where: { id },
      })

      // Update unit status back to vacant
      await tx.unit.update({
        where: { id: existingLease.unitId },
        data: { status: 'VACANT' },
      })
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'DELETE',
        entityType: 'lease',
        entityId: id,
        description: `Deleted draft lease for unit ${existingLease.unit.unitNumber}`,
        previousValues: JSON.parse(JSON.stringify(existingLease)),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lease:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
