import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for updating a property
const propertyUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['SINGLE_FAMILY', 'MULTI_FAMILY', 'APARTMENT', 'CONDO', 'TOWNHOUSE', 'COMMERCIAL']).optional(),
  addressLine1: z.string().min(1).optional(),
  addressLine2: z.string().optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(2).optional(),
  postalCode: z.string().min(5).optional(),
  country: z.string().optional(),
  yearBuilt: z.number().optional(),
  squareFeet: z.number().optional(),
  lotSize: z.number().optional(),
  parkingSpaces: z.number().optional(),
  purchasePrice: z.number().optional(),
  purchaseDate: z.string().optional(),
  currentValue: z.number().optional(),
  photos: z.array(z.string()).optional(),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SOLD']).optional(),
})

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/properties/[id] - Get a single property
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

    const property = await prisma.property.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        units: {
          include: {
            leases: {
              where: {
                status: 'ACTIVE',
              },
              include: {
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
              },
            },
            maintenanceRequests: {
              where: {
                status: {
                  in: ['SUBMITTED', 'ACKNOWLEDGED', 'SCHEDULED', 'IN_PROGRESS'],
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
          orderBy: { unitNumber: 'asc' },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            units: true,
          },
        },
      },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json({ property })
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/properties/[id] - Update a property
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

    // Check if property exists and belongs to user's organization
    const existingProperty = await prisma.property.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    })

    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = propertyUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Update property
    const property = await prisma.property.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.addressLine1 && { addressLine1: data.addressLine1 }),
        ...(data.addressLine2 !== undefined && { addressLine2: data.addressLine2 }),
        ...(data.city && { city: data.city }),
        ...(data.state && { state: data.state }),
        ...(data.postalCode && { postalCode: data.postalCode }),
        ...(data.country && { country: data.country }),
        ...(data.yearBuilt !== undefined && { yearBuilt: data.yearBuilt }),
        ...(data.squareFeet !== undefined && { squareFeet: data.squareFeet }),
        ...(data.lotSize !== undefined && { lotSize: data.lotSize }),
        ...(data.parkingSpaces !== undefined && { parkingSpaces: data.parkingSpaces }),
        ...(data.purchasePrice !== undefined && { purchasePrice: data.purchasePrice }),
        ...(data.purchaseDate !== undefined && { purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null }),
        ...(data.currentValue !== undefined && { currentValue: data.currentValue }),
        ...(data.photos && { photos: data.photos }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.status && { status: data.status }),
      },
      include: {
        units: true,
        _count: {
          select: {
            units: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'UPDATE',
        entityType: 'property',
        entityId: property.id,
        description: `Updated property: ${property.name}`,
        previousValues: JSON.parse(JSON.stringify(existingProperty)),
        newValues: JSON.parse(JSON.stringify(property)),
      },
    })

    return NextResponse.json({ property })
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/properties/[id] - Delete a property
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

    // Check if property exists and belongs to user's organization
    const existingProperty = await prisma.property.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        units: {
          include: {
            leases: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
    })

    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Check if any units have active leases
    const hasActiveLeases = existingProperty.units.some(
      (unit) => unit.leases.length > 0
    )

    if (hasActiveLeases) {
      return NextResponse.json(
        { error: 'Cannot delete property with active leases' },
        { status: 400 }
      )
    }

    // Delete property (this will cascade delete units due to schema)
    await prisma.property.delete({
      where: { id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'DELETE',
        entityType: 'property',
        entityId: id,
        description: `Deleted property: ${existingProperty.name}`,
        previousValues: JSON.parse(JSON.stringify(existingProperty)),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
