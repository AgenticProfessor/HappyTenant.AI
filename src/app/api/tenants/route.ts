import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating a tenant
const tenantSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
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
  hasPets: z.boolean().default(false),
  petDetails: z.string().optional(),
  hasVehicles: z.boolean().default(false),
  vehicleDetails: z.string().optional(),
  householdMembers: z.array(z.object({
    name: z.string(),
    relationship: z.string(),
    age: z.number().optional(),
  })).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  notes: z.string().optional(),
})

// GET /api/tenants - List all tenants for the organization
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
    const search = searchParams.get('search')
    const status = searchParams.get('status') // 'active', 'inactive', 'all'
    const screeningStatus = searchParams.get('screeningStatus')

    // Build filter
    const where: Record<string, unknown> = {
      organizationId: user.organizationId,
    }

    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }

    if (screeningStatus) {
      where.screeningStatus = screeningStatus
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    const tenants = await prisma.tenant.findMany({
      where,
      include: {
        leaseTenants: {
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
          },
        },
        _count: {
          select: {
            leaseTenants: true,
            payments: true,
            maintenanceRequests: true,
          },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    })

    return NextResponse.json({ tenants })
  } catch (error) {
    console.error('Error fetching tenants:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/tenants - Create a new tenant
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
    const validationResult = tenantSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        organizationId: user.organizationId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        driversLicense: data.driversLicense,
        driversLicenseState: data.driversLicenseState,
        employmentStatus: data.employmentStatus,
        employerName: data.employerName,
        employerPhone: data.employerPhone,
        jobTitle: data.jobTitle,
        monthlyIncome: data.monthlyIncome,
        hasPets: data.hasPets,
        petDetails: data.petDetails,
        hasVehicles: data.hasVehicles,
        vehicleDetails: data.vehicleDetails,
        householdMembers: data.householdMembers,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        emergencyContactRelation: data.emergencyContactRelation,
        notes: data.notes,
        screeningStatus: 'NOT_STARTED',
        isActive: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'CREATE',
        entityType: 'tenant',
        entityId: tenant.id,
        description: `Created tenant: ${tenant.firstName} ${tenant.lastName}`,
        newValues: JSON.parse(JSON.stringify(tenant)),
      },
    })

    return NextResponse.json({ tenant }, { status: 201 })
  } catch (error) {
    console.error('Error creating tenant:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
