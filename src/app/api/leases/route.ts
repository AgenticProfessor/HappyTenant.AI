import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating a lease
const leaseSchema = z.object({
  unitId: z.string().min(1, 'Unit is required'),
  tenantIds: z.array(z.string()).min(1, 'At least one tenant is required'),
  primaryTenantId: z.string().min(1, 'Primary tenant is required'),
  leaseType: z.enum(['FIXED', 'MONTH_TO_MONTH', 'WEEK_TO_WEEK']).default('FIXED'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  rentAmount: z.number().min(0, 'Rent must be positive'),
  rentDueDay: z.number().min(1).max(28).default(1),
  rentFrequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']).default('MONTHLY'),
  securityDeposit: z.number().min(0, 'Security deposit must be positive'),
  petDeposit: z.number().optional(),
  otherDeposits: z.array(z.object({
    name: z.string(),
    amount: z.number(),
  })).optional(),
  lateFeeAmount: z.number().optional(),
  lateFeeType: z.enum(['FLAT', 'PERCENTAGE', 'DAILY']).default('FLAT'),
  lateFeeGraceDays: z.number().min(0).default(5),
  recurringCharges: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    frequency: z.string(),
  })).optional(),
  proratedFirstMonth: z.number().optional(),
  notes: z.string().optional(),
  generateInitialCharges: z.boolean().default(true),
})

// GET /api/leases - List all leases for the organization
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
    const propertyId = searchParams.get('propertyId')
    const unitId = searchParams.get('unitId')

    // Build filter - get leases through units that belong to properties in the organization
    const where: Record<string, unknown> = {
      unit: {
        property: {
          organizationId: user.organizationId,
        },
      },
    }

    if (status) {
      where.status = status
    }

    if (unitId) {
      where.unitId = unitId
    } else if (propertyId) {
      where.unit = {
        ...where.unit as Record<string, unknown>,
        propertyId,
      }
    }

    const leases = await prisma.lease.findMany({
      where,
      include: {
        unit: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                addressLine1: true,
                city: true,
                state: true,
              },
            },
          },
        },
        leaseTenants: {
          include: {
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        _count: {
          select: {
            charges: true,
            payments: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    })

    return NextResponse.json({ leases })
  } catch (error) {
    console.error('Error fetching leases:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/leases - Create a new lease
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
    const validationResult = leaseSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Verify unit belongs to user's organization
    const unit = await prisma.unit.findFirst({
      where: {
        id: data.unitId,
        property: {
          organizationId: user.organizationId,
        },
      },
      include: {
        property: true,
      },
    })

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    // Verify all tenants belong to user's organization
    const tenants = await prisma.tenant.findMany({
      where: {
        id: { in: data.tenantIds },
        organizationId: user.organizationId,
      },
    })

    if (tenants.length !== data.tenantIds.length) {
      return NextResponse.json(
        { error: 'One or more tenants not found' },
        { status: 404 }
      )
    }

    // Check for overlapping leases on the same unit
    const startDate = new Date(data.startDate)
    const endDate = data.endDate ? new Date(data.endDate) : null

    const overlappingLeases = await prisma.lease.findMany({
      where: {
        unitId: data.unitId,
        status: { in: ['ACTIVE', 'PENDING_SIGNATURE'] },
        OR: [
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: startDate } },
            ],
          },
          {
            AND: [
              { startDate: { lte: endDate || startDate } },
              { endDate: null },
            ],
          },
        ],
      },
    })

    if (overlappingLeases.length > 0) {
      return NextResponse.json(
        { error: 'Unit already has an overlapping active lease' },
        { status: 400 }
      )
    }

    // Create lease with tenants in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the lease
      const lease = await tx.lease.create({
        data: {
          unitId: data.unitId,
          leaseType: data.leaseType,
          startDate,
          endDate,
          rentAmount: data.rentAmount,
          rentDueDay: data.rentDueDay,
          rentFrequency: data.rentFrequency,
          securityDeposit: data.securityDeposit,
          petDeposit: data.petDeposit,
          otherDeposits: data.otherDeposits,
          lateFeeAmount: data.lateFeeAmount,
          lateFeeType: data.lateFeeType,
          lateFeeGraceDays: data.lateFeeGraceDays,
          recurringCharges: data.recurringCharges,
          proratedFirstMonth: data.proratedFirstMonth,
          status: 'DRAFT',
          notes: data.notes,
        },
      })

      // Create lease-tenant relationships
      await tx.leaseTenant.createMany({
        data: data.tenantIds.map(tenantId => ({
          leaseId: lease.id,
          tenantId,
          role: tenantId === data.primaryTenantId ? 'PRIMARY' : 'CO_TENANT',
        })),
      })

      // Generate initial charges if requested
      if (data.generateInitialCharges) {
        const charges = []

        // Security deposit charge
        if (data.securityDeposit > 0) {
          charges.push({
            leaseId: lease.id,
            tenantId: data.primaryTenantId,
            type: 'SECURITY_DEPOSIT' as const,
            description: 'Security Deposit',
            amount: data.securityDeposit,
            dueDate: startDate,
            status: 'DUE' as const,
            isAutoGenerated: true,
          })
        }

        // Pet deposit charge
        if (data.petDeposit && data.petDeposit > 0) {
          charges.push({
            leaseId: lease.id,
            tenantId: data.primaryTenantId,
            type: 'PET_DEPOSIT' as const,
            description: 'Pet Deposit',
            amount: data.petDeposit,
            dueDate: startDate,
            status: 'DUE' as const,
            isAutoGenerated: true,
          })
        }

        // First month's rent (or prorated amount)
        const rentCharge = data.proratedFirstMonth || data.rentAmount
        charges.push({
          leaseId: lease.id,
          tenantId: data.primaryTenantId,
          type: 'RENT' as const,
          description: data.proratedFirstMonth
            ? `First Month's Rent (Prorated)`
            : `First Month's Rent`,
          amount: rentCharge,
          dueDate: startDate,
          billingPeriodStart: startDate,
          billingPeriodEnd: new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0),
          status: 'DUE' as const,
          isAutoGenerated: true,
        })

        if (charges.length > 0) {
          await tx.charge.createMany({ data: charges })
        }
      }

      // Update unit status
      await tx.unit.update({
        where: { id: data.unitId },
        data: { status: 'OCCUPIED' },
      })

      return lease
    })

    // Fetch the complete lease with relations
    const lease = await prisma.lease.findUnique({
      where: { id: result.id },
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
        charges: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'LEASE_CREATED',
        entityType: 'lease',
        entityId: result.id,
        description: `Created lease for unit ${unit.unitNumber} at ${unit.property.name}`,
        newValues: JSON.parse(JSON.stringify(lease)),
      },
    })

    return NextResponse.json({ lease }, { status: 201 })
  } catch (error) {
    console.error('Error creating lease:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
