import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating a maintenance request
const maintenanceSchema = z.object({
  unitId: z.string().min(1, 'Unit is required'),
  tenantId: z.string().optional(), // Optional - can be submitted by tenant or staff
  category: z.enum([
    'PLUMBING',
    'ELECTRICAL',
    'HVAC',
    'APPLIANCE',
    'STRUCTURAL',
    'PEST_CONTROL',
    'LANDSCAPING',
    'CLEANING',
    'LOCK_KEY',
    'GENERAL',
    'EMERGENCY',
    'OTHER'
  ]),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  permissionToEnter: z.boolean().default(true),
  preferredSchedule: z.string().optional(),
  photos: z.array(z.string()).optional(),
})

// GET /api/maintenance - List all maintenance requests for the organization
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
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    const propertyId = searchParams.get('propertyId')
    const unitId = searchParams.get('unitId')
    const tenantId = searchParams.get('tenantId')
    const assignedTo = searchParams.get('assignedTo')

    // Build filter
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

    if (priority) {
      where.priority = priority
    }

    if (category) {
      where.category = category
    }

    if (unitId) {
      where.unitId = unitId
    } else if (propertyId) {
      where.unit = {
        ...where.unit as Record<string, unknown>,
        propertyId,
      }
    }

    if (tenantId) {
      where.tenantId = tenantId
    }

    if (assignedTo) {
      where.assignedToId = assignedTo
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where,
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
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        assignedToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        assignedToVendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    // Calculate summary
    const openCount = requests.filter(r =>
      !['COMPLETED', 'CANCELLED'].includes(r.status)
    ).length
    const urgentCount = requests.filter(r =>
      r.priority === 'EMERGENCY' && !['COMPLETED', 'CANCELLED'].includes(r.status)
    ).length
    const completedThisMonth = requests.filter(r => {
      const resolvedAt = r.resolvedAt
      if (!resolvedAt) return false
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      return new Date(resolvedAt) >= startOfMonth
    }).length

    return NextResponse.json({
      requests,
      summary: {
        total: requests.length,
        open: openCount,
        urgent: urgentCount,
        completedThisMonth,
      },
    })
  } catch (error) {
    console.error('Error fetching maintenance requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/maintenance - Create a new maintenance request
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
    const validationResult = maintenanceSchema.safeParse(body)

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

    // If tenant specified, verify they're on an active lease for this unit
    if (data.tenantId) {
      const leaseTenant = await prisma.leaseTenant.findFirst({
        where: {
          tenantId: data.tenantId,
          lease: {
            unitId: data.unitId,
            status: 'ACTIVE',
          },
        },
      })

      if (!leaseTenant) {
        return NextResponse.json(
          { error: 'Tenant is not on an active lease for this unit' },
          { status: 400 }
        )
      }
    }

    // Create maintenance request
    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        unitId: data.unitId,
        tenantId: data.tenantId,
        category: data.category === 'LOCK_KEY' ? 'LOCKS_SECURITY' : (data.category as any),
        priority: data.priority === 'URGENT' ? 'EMERGENCY' : (data.priority as any),
        title: data.title,
        description: data.description,
        entryPermissionGranted: data.permissionToEnter,
        // preferredSchedule: data.preferredSchedule, // Field does not exist
        photos: data.photos || [],
        status: 'SUBMITTED',
      },
      include: {
        unit: {
          include: {
            property: true,
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
        entityType: 'maintenance_request',
        entityId: maintenanceRequest.id,
        description: `Maintenance request: ${data.title} for ${unit.unitNumber} at ${unit.property.name}`,
        newValues: JSON.parse(JSON.stringify(maintenanceRequest)),
      },
    })

    return NextResponse.json({ request: maintenanceRequest }, { status: 201 })
  } catch (error) {
    console.error('Error creating maintenance request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
