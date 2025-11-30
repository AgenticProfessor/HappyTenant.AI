import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for updating a tenant
const tenantUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  driversLicense: z.string().optional(),
  driversLicenseState: z.string().optional(),
  employmentStatus: z.enum([
    'EMPLOYED_FULL_TIME',
    'EMPLOYED_PART_TIME',
    'SELF_EMPLOYED',
    'UNEMPLOYED',
    'RETIRED',
    'STUDENT',
    'OTHER'
  ]).optional(),
  employerName: z.string().optional(),
  employerPhone: z.string().optional(),
  jobTitle: z.string().optional(),
  monthlyIncome: z.number().optional(),
  incomeVerified: z.boolean().optional(),
  hasPets: z.boolean().optional(),
  petDetails: z.string().optional(),
  hasVehicles: z.boolean().optional(),
  vehicleDetails: z.string().optional(),
  householdMembers: z.array(z.object({
    name: z.string(),
    relationship: z.string(),
    age: z.number().optional(),
  })).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  screeningStatus: z.enum(['NOT_STARTED', 'PENDING', 'PASSED', 'FAILED', 'REVIEW_NEEDED']).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
})

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/tenants/[id] - Get a single tenant with full details
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

    const tenant = await prisma.tenant.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        leaseTenants: {
          include: {
            lease: {
              include: {
                unit: {
                  include: {
                    property: true,
                  },
                },
                charges: {
                  orderBy: { dueDate: 'desc' },
                  take: 10,
                },
              },
            },
          },
        },
        screeningResults: {
          orderBy: { requestedAt: 'desc' },
        },
        payments: {
          orderBy: { receivedAt: 'desc' },
          take: 10,
        },
        charges: {
          orderBy: { dueDate: 'desc' },
          take: 10,
        },
        maintenanceRequests: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            unit: {
              select: {
                id: true,
                unitNumber: true,
                property: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
          take: 10,
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Calculate balance due across all active leases
    let totalBalance = 0
    for (const leaseTenant of tenant.leaseTenants) {
      if (leaseTenant.lease.status === 'ACTIVE') {
        const chargesTotal = leaseTenant.lease.charges
          .filter(c => c.status !== 'VOID' && c.status !== 'WAIVED')
          .reduce((sum, c) => sum + Number(c.amount), 0)

        const paymentsTotal = tenant.payments
          .filter(p => p.leaseId === leaseTenant.lease.id && p.status === 'COMPLETED')
          .reduce((sum, p) => sum + Number(p.amount), 0)

        totalBalance += chargesTotal - paymentsTotal
      }
    }

    return NextResponse.json({
      tenant,
      summary: {
        totalBalance,
        activeLeases: tenant.leaseTenants.filter(lt => lt.lease.status === 'ACTIVE').length,
        totalPayments: tenant.payments.length,
        openMaintenanceRequests: tenant.maintenanceRequests.filter(
          mr => !['COMPLETED', 'CANCELLED'].includes(mr.status)
        ).length,
      }
    })
  } catch (error) {
    console.error('Error fetching tenant:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/tenants/[id] - Update a tenant
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

    // Check if tenant exists and belongs to user's organization
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    })

    if (!existingTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = tenantUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Update tenant
    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.email && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.dateOfBirth !== undefined && {
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null
        }),
        ...(data.driversLicense !== undefined && { driversLicense: data.driversLicense }),
        ...(data.driversLicenseState !== undefined && { driversLicenseState: data.driversLicenseState }),
        ...(data.employmentStatus && { employmentStatus: data.employmentStatus }),
        ...(data.employerName !== undefined && { employerName: data.employerName }),
        ...(data.employerPhone !== undefined && { employerPhone: data.employerPhone }),
        ...(data.jobTitle !== undefined && { jobTitle: data.jobTitle }),
        ...(data.monthlyIncome !== undefined && { monthlyIncome: data.monthlyIncome }),
        ...(data.incomeVerified !== undefined && { incomeVerified: data.incomeVerified }),
        ...(data.hasPets !== undefined && { hasPets: data.hasPets }),
        ...(data.petDetails !== undefined && { petDetails: data.petDetails }),
        ...(data.hasVehicles !== undefined && { hasVehicles: data.hasVehicles }),
        ...(data.vehicleDetails !== undefined && { vehicleDetails: data.vehicleDetails }),
        ...(data.householdMembers !== undefined && { householdMembers: data.householdMembers }),
        ...(data.emergencyContactName !== undefined && { emergencyContactName: data.emergencyContactName }),
        ...(data.emergencyContactPhone !== undefined && { emergencyContactPhone: data.emergencyContactPhone }),
        ...(data.emergencyContactRelation !== undefined && { emergencyContactRelation: data.emergencyContactRelation }),
        ...(data.screeningStatus && { screeningStatus: data.screeningStatus }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'UPDATE',
        entityType: 'tenant',
        entityId: tenant.id,
        description: `Updated tenant: ${tenant.firstName} ${tenant.lastName}`,
        previousValues: JSON.parse(JSON.stringify(existingTenant)),
        newValues: JSON.parse(JSON.stringify(tenant)),
      },
    })

    return NextResponse.json({ tenant })
  } catch (error) {
    console.error('Error updating tenant:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/tenants/[id] - Delete (soft) a tenant
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

    // Check if tenant exists and belongs to user's organization
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        leaseTenants: {
          include: {
            lease: true,
          },
        },
      },
    })

    if (!existingTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Check if tenant has active leases
    const hasActiveLeases = existingTenant.leaseTenants.some(
      lt => lt.lease.status === 'ACTIVE'
    )

    if (hasActiveLeases) {
      return NextResponse.json(
        { error: 'Cannot delete tenant with active leases. Terminate leases first.' },
        { status: 400 }
      )
    }

    // Soft delete - mark tenant as inactive
    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        isActive: false,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'DELETE',
        entityType: 'tenant',
        entityId: tenant.id,
        description: `Deactivated tenant: ${tenant.firstName} ${tenant.lastName}`,
        previousValues: JSON.parse(JSON.stringify(existingTenant)),
      },
    })

    return NextResponse.json({ success: true, tenant })
  } catch (error) {
    console.error('Error deleting tenant:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
