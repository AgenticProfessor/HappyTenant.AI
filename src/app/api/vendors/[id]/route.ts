import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for updating a vendor
const vendorUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum([
    'PLUMBER',
    'ELECTRICIAN',
    'HVAC',
    'GENERAL_CONTRACTOR',
    'HANDYMAN',
    'LANDSCAPER',
    'PEST_CONTROL',
    'CLEANING',
    'LOCKSMITH',
    'APPLIANCE_REPAIR',
    'PAINTER',
    'ROOFER',
    'FLOORING',
    'INSPECTOR',
    'OTHER'
  ]).optional(),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  website: z.string().optional(),
  licenseNumber: z.string().optional(),
  insuranceInfo: z.string().optional(),
  w9OnFile: z.boolean().optional(),
  hourlyRate: z.number().optional(),
  notes: z.string().optional(),
  isPreferred: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']).optional(),
  rating: z.number().min(1).max(5).optional(),
})

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/vendors/[id] - Get a single vendor with work history
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

    const vendor = await prisma.vendor.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        maintenanceRequests: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            unit: {
              include: {
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
        workOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            maintenanceRequest: {
              include: {
                unit: {
                  include: {
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
          },
        },
        _count: {
          select: {
            maintenanceRequests: true,
            workOrders: true,
          },
        },
      },
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Calculate work order stats
    const completedWorkOrders = await prisma.workOrder.count({
      where: {
        vendorId: vendor.id,
        status: 'COMPLETED',
      },
    })

    const totalSpent = await prisma.workOrder.aggregate({
      where: {
        vendorId: vendor.id,
        status: 'COMPLETED',
      },
      _sum: {
        actualCost: true,
      },
    })

    const avgCompletionTime = await prisma.workOrder.aggregate({
      where: {
        vendorId: vendor.id,
        status: 'COMPLETED',
        completedAt: { not: null },
      },
      _avg: {
        // We'd calculate this from created to completed if we had the data
      },
    })

    return NextResponse.json({
      vendor,
      stats: {
        totalJobs: vendor._count.workOrders,
        completedJobs: completedWorkOrders,
        totalSpent: Number(totalSpent._sum.actualCost || 0),
        completionRate: vendor._count.workOrders > 0
          ? Math.round((completedWorkOrders / vendor._count.workOrders) * 100)
          : 0,
      },
    })
  } catch (error) {
    console.error('Error fetching vendor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/vendors/[id] - Update a vendor
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

    // Check if vendor exists and belongs to user's organization
    const existingVendor = await prisma.vendor.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    })

    if (!existingVendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = vendorUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Update vendor
    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.contactName !== undefined && { contactName: data.contactName }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.licenseNumber !== undefined && { licenseNumber: data.licenseNumber }),
        ...(data.insuranceInfo !== undefined && { insuranceInfo: data.insuranceInfo }),
        ...(data.w9OnFile !== undefined && { w9OnFile: data.w9OnFile }),
        ...(data.hourlyRate !== undefined && { hourlyRate: data.hourlyRate }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.isPreferred !== undefined && { isPreferred: data.isPreferred }),
        ...(data.status && { status: data.status }),
        ...(data.rating !== undefined && { rating: data.rating }),
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'UPDATE',
        entityType: 'vendor',
        entityId: vendor.id,
        description: `Updated vendor: ${vendor.name}`,
        previousValues: JSON.parse(JSON.stringify(existingVendor)),
        newValues: JSON.parse(JSON.stringify(vendor)),
      },
    })

    return NextResponse.json({ vendor })
  } catch (error) {
    console.error('Error updating vendor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/vendors/[id] - Delete a vendor (soft delete - mark as inactive)
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

    // Check if vendor exists and belongs to user's organization
    const existingVendor = await prisma.vendor.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        maintenanceRequests: {
          where: {
            status: { notIn: ['COMPLETED', 'CANCELLED'] },
          },
        },
        workOrders: {
          where: {
            status: { notIn: ['COMPLETED', 'CANCELLED'] },
          },
        },
      },
    })

    if (!existingVendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Check for active work
    if (existingVendor.maintenanceRequests.length > 0 || existingVendor.workOrders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete vendor with active maintenance requests or work orders' },
        { status: 400 }
      )
    }

    // Soft delete - mark as inactive
    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        status: 'INACTIVE',
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'DELETE',
        entityType: 'vendor',
        entityId: id,
        description: `Deactivated vendor: ${existingVendor.name}`,
        previousValues: JSON.parse(JSON.stringify(existingVendor)),
      },
    })

    return NextResponse.json({ success: true, vendor })
  } catch (error) {
    console.error('Error deleting vendor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
