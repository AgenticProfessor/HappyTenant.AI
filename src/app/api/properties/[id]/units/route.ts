import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating a unit
const unitSchema = z.object({
  unitNumber: z.string().min(1, 'Unit number is required'),
  name: z.string().optional(),
  bedrooms: z.number().min(0).default(1),
  bathrooms: z.number().min(0).default(1),
  squareFeet: z.number().optional(),
  floorNumber: z.number().optional(),
  amenities: z.array(z.string()).optional(),
  marketRent: z.number().min(0, 'Rent must be positive'),
  depositAmount: z.number().min(0, 'Deposit must be positive'),
  petsAllowed: z.boolean().default(false),
  petDeposit: z.number().optional(),
  petRent: z.number().optional(),
  smokingAllowed: z.boolean().default(false),
  utilitiesIncluded: z.array(z.string()).optional(),
  status: z.enum(['VACANT', 'OCCUPIED', 'NOTICE_GIVEN', 'UNDER_APPLICATION', 'MAINTENANCE', 'OFF_MARKET']).default('VACANT'),
  isListed: z.boolean().default(false),
  listingTitle: z.string().optional(),
  listingDescription: z.string().optional(),
  listingPhotos: z.array(z.string()).optional(),
  availableDate: z.string().optional(),
  photos: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/properties/[id]/units - List all units for a property
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId, organizationId } = await auth()
    const { id: propertyId } = await params

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify property belongs to user's organization
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        organizationId,
      },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Build filter
    const where: Record<string, unknown> = {
      propertyId,
    }

    if (status) {
      where.status = status
    }

    const units = await prisma.unit.findMany({
      where,
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
          take: 3,
        },
        _count: {
          select: {
            leases: true,
            maintenanceRequests: true,
          },
        },
      },
      orderBy: { unitNumber: 'asc' },
    })

    return NextResponse.json({ units })
  } catch (error) {
    console.error('Error fetching units:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/properties/[id]/units - Create a new unit
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { userId, organizationId } = await auth()
    const { id: propertyId } = await params

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify property belongs to user's organization
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        organizationId,
      },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = unitSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if unit number already exists for this property
    const existingUnit = await prisma.unit.findFirst({
      where: {
        propertyId,
        unitNumber: data.unitNumber,
      },
    })

    if (existingUnit) {
      return NextResponse.json(
        { error: 'Unit number already exists for this property' },
        { status: 400 }
      )
    }

    // Create unit
    const unit = await prisma.unit.create({
      data: {
        propertyId,
        unitNumber: data.unitNumber,
        name: data.name,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        squareFeet: data.squareFeet,
        floorNumber: data.floorNumber,
        amenities: data.amenities || [],
        marketRent: data.marketRent,
        depositAmount: data.depositAmount,
        petsAllowed: data.petsAllowed,
        petDeposit: data.petDeposit,
        petRent: data.petRent,
        smokingAllowed: data.smokingAllowed,
        utilitiesIncluded: data.utilitiesIncluded || [],
        status: data.status,
        isListed: data.isListed,
        listingTitle: data.listingTitle,
        listingDescription: data.listingDescription,
        listingPhotos: data.listingPhotos || [],
        availableDate: data.availableDate ? new Date(data.availableDate) : undefined,
        photos: data.photos || [],
        notes: data.notes,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId,
        action: 'CREATE',
        entityType: 'unit',
        entityId: unit.id,
        description: `Created unit ${unit.unitNumber} in property: ${property.name}`,
        newValues: JSON.parse(JSON.stringify(unit)),
      },
    })

    return NextResponse.json({ unit }, { status: 201 })
  } catch (error) {
    console.error('Error creating unit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
