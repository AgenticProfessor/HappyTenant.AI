import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating a charge
const chargeSchema = z.object({
  leaseId: z.string().min(1, 'Lease is required'),
  tenantId: z.string().min(1, 'Tenant is required'),
  type: z.enum([
    'RENT',
    'SECURITY_DEPOSIT',
    'PET_DEPOSIT',
    'LATE_FEE',
    'UTILITY',
    'PARKING',
    'STORAGE',
    'PET_RENT',
    'MAINTENANCE_REIMBURSEMENT',
    'NSF_FEE',
    'LEASE_VIOLATION_FEE',
    'MOVE_IN_FEE',
    'MOVE_OUT_FEE',
    'OTHER'
  ]),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
  billingPeriodStart: z.string().optional(),
  billingPeriodEnd: z.string().optional(),
  notes: z.string().optional(),
})

// GET /api/charges - List all charges for the organization
export async function GET(request: Request) {
  try {
    const { userId } = await auth()

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

    // Get query params for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const leaseId = searchParams.get('leaseId')
    const tenantId = searchParams.get('tenantId')
    const propertyId = searchParams.get('propertyId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build filter
    const where: Record<string, unknown> = {
      lease: {
        unit: {
          property: {
            organizationId: user.organizationId,
          },
        },
      },
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    if (leaseId) {
      where.leaseId = leaseId
    }

    if (tenantId) {
      where.tenantId = tenantId
    }

    if (propertyId) {
      where.lease = {
        ...where.lease as Record<string, unknown>,
        unit: {
          propertyId,
        },
      }
    }

    if (startDate || endDate) {
      where.dueDate = {}
      if (startDate) {
        (where.dueDate as Record<string, unknown>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.dueDate as Record<string, unknown>).lte = new Date(endDate)
      }
    }

    const charges = await prisma.charge.findMany({
      where,
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: {
                  select: {
                    id: true,
                    name: true,
                    addressLine1: true,
                  },
                },
              },
            },
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        paymentAllocations: {
          include: {
            payment: {
              select: {
                id: true,
                amount: true,
                method: true,
                status: true,
                receivedAt: true,
              },
            },
          },
        },
      },
      orderBy: { dueDate: 'desc' },
    })

    // Calculate totals
    const totalDue = charges
      .filter(c => ['DUE', 'PARTIAL'].includes(c.status))
      .reduce((sum, c) => sum + Number(c.amount), 0)

    const totalPaid = charges
      .filter(c => c.status === 'PAID')
      .reduce((sum, c) => sum + Number(c.amount), 0)

    // Calculate overdue as charges that are DUE and past due date
    const now = new Date()
    const totalOverdue = charges
      .filter(c => c.status === 'DUE' && c.dueDate < now)
      .reduce((sum, c) => sum + Number(c.amount), 0)

    return NextResponse.json({
      charges,
      summary: {
        totalDue,
        totalPaid,
        totalOverdue,
        count: charges.length,
      },
    })
  } catch (error) {
    console.error('Error fetching charges:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/charges - Create a new charge
export async function POST(request: Request) {
  try {
    const { userId } = await auth()

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

    // Parse and validate request body
    const body = await request.json()
    const validationResult = chargeSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Verify lease belongs to user's organization
    const lease = await prisma.lease.findFirst({
      where: {
        id: data.leaseId,
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

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    // Verify tenant exists and is on the lease
    const leaseTenant = await prisma.leaseTenant.findFirst({
      where: {
        leaseId: data.leaseId,
        tenantId: data.tenantId,
      },
    })

    if (!leaseTenant) {
      return NextResponse.json(
        { error: 'Tenant is not on this lease' },
        { status: 400 }
      )
    }

    const dueDate = new Date(data.dueDate)
    const isOverdue = dueDate < new Date()

    // Create charge
    const charge = await prisma.charge.create({
      data: {
        leaseId: data.leaseId,
        tenantId: data.tenantId,
        type: data.type,
        description: data.description,
        amount: data.amount,
        dueDate,
        billingPeriodStart: data.billingPeriodStart ? new Date(data.billingPeriodStart) : undefined,
        billingPeriodEnd: data.billingPeriodEnd ? new Date(data.billingPeriodEnd) : undefined,
        status: 'DUE',
        isAutoGenerated: false,
        notes: data.notes,
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
        tenant: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'CREATE',
        entityType: 'charge',
        entityId: charge.id,
        description: `Created ${data.type} charge of $${data.amount} for ${lease.unit.unitNumber}`,
        newValues: JSON.parse(JSON.stringify(charge)),
      },
    })

    return NextResponse.json({ charge }, { status: 201 })
  } catch (error) {
    console.error('Error creating charge:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
