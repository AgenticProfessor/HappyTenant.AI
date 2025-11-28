import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for updating a maintenance request
const maintenanceUpdateSchema = z.object({
  status: z.enum([
    'SUBMITTED',
    'ACKNOWLEDGED',
    'SCHEDULED',
    'IN_PROGRESS',
    'ON_HOLD',
    'COMPLETED',
    'CANCELLED'
  ]).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedToId: z.string().optional(),
  vendorId: z.string().optional(),
  scheduledDate: z.string().optional(),
  estimatedCost: z.number().optional(),
  actualCost: z.number().optional(),
  internalNotes: z.string().optional(),
  tenantNotes: z.string().optional(),
  resolutionNotes: z.string().optional(),
  completedAt: z.string().optional(),
})

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/maintenance/[id] - Get a single maintenance request with full details
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

    const maintenanceRequest = await prisma.maintenanceRequest.findFirst({
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
        tenant: true,
        assignedTo: true,
        vendor: true,
        workOrders: {
          include: {
            vendor: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!maintenanceRequest) {
      return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 })
    }

    // Calculate time metrics
    const createdAt = new Date(maintenanceRequest.createdAt)
    const now = new Date()
    const ageInHours = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60))
    const ageInDays = Math.floor(ageInHours / 24)

    let responseTime: number | null = null
    if (maintenanceRequest.acknowledgedAt) {
      const acknowledgedAt = new Date(maintenanceRequest.acknowledgedAt)
      responseTime = Math.floor((acknowledgedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60))
    }

    let completionTime: number | null = null
    if (maintenanceRequest.completedAt) {
      const completedAt = new Date(maintenanceRequest.completedAt)
      completionTime = Math.floor((completedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60))
    }

    return NextResponse.json({
      request: maintenanceRequest,
      metrics: {
        ageInHours,
        ageInDays,
        responseTimeHours: responseTime,
        completionTimeHours: completionTime,
        isOverdue: ageInDays > 7 && !['COMPLETED', 'CANCELLED'].includes(maintenanceRequest.status),
      },
    })
  } catch (error) {
    console.error('Error fetching maintenance request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/maintenance/[id] - Update a maintenance request
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

    // Check if request exists and belongs to user's organization
    const existingRequest = await prisma.maintenanceRequest.findFirst({
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

    if (!existingRequest) {
      return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = maintenanceUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Verify vendor if specified
    if (data.vendorId) {
      const vendor = await prisma.vendor.findFirst({
        where: {
          id: data.vendorId,
          organizationId: user.organizationId,
        },
      })

      if (!vendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
      }
    }

    // Verify assignee if specified
    if (data.assignedToId) {
      const assignee = await prisma.user.findFirst({
        where: {
          id: data.assignedToId,
          organizationId: user.organizationId,
        },
      })

      if (!assignee) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
    }

    // Update maintenance request
    const maintenanceRequest = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.status === 'ACKNOWLEDGED' && !existingRequest.acknowledgedAt && {
          acknowledgedAt: new Date(),
        }),
        ...(data.status === 'COMPLETED' && !existingRequest.completedAt && {
          completedAt: new Date(),
        }),
        ...(data.priority && { priority: data.priority }),
        ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId || null }),
        ...(data.vendorId !== undefined && { vendorId: data.vendorId || null }),
        ...(data.scheduledDate !== undefined && {
          scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null
        }),
        ...(data.estimatedCost !== undefined && { estimatedCost: data.estimatedCost }),
        ...(data.actualCost !== undefined && { actualCost: data.actualCost }),
        ...(data.internalNotes !== undefined && { internalNotes: data.internalNotes }),
        ...(data.tenantNotes !== undefined && { tenantNotes: data.tenantNotes }),
        ...(data.resolutionNotes !== undefined && { resolutionNotes: data.resolutionNotes }),
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        tenant: true,
        assignedTo: true,
        vendor: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'UPDATE',
        entityType: 'maintenance_request',
        entityId: maintenanceRequest.id,
        description: `Updated maintenance request: ${maintenanceRequest.title}${data.status ? ` - Status: ${data.status}` : ''}`,
        previousValues: JSON.parse(JSON.stringify(existingRequest)),
        newValues: JSON.parse(JSON.stringify(maintenanceRequest)),
      },
    })

    return NextResponse.json({ request: maintenanceRequest })
  } catch (error) {
    console.error('Error updating maintenance request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/maintenance/[id] - Delete a maintenance request (only if not started)
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

    // Check if request exists and belongs to user's organization
    const existingRequest = await prisma.maintenanceRequest.findFirst({
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
        workOrders: true,
      },
    })

    if (!existingRequest) {
      return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 })
    }

    // Only allow deleting if not in progress
    if (!['SUBMITTED', 'ACKNOWLEDGED', 'CANCELLED'].includes(existingRequest.status)) {
      return NextResponse.json(
        { error: 'Cannot delete maintenance request that is in progress. Cancel it instead.' },
        { status: 400 }
      )
    }

    // Check for work orders
    if (existingRequest.workOrders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete maintenance request with work orders' },
        { status: 400 }
      )
    }

    // Delete request
    await prisma.maintenanceRequest.delete({
      where: { id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'DELETE',
        entityType: 'maintenance_request',
        entityId: id,
        description: `Deleted maintenance request: ${existingRequest.title}`,
        previousValues: JSON.parse(JSON.stringify(existingRequest)),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting maintenance request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
