import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating/updating a property
const propertySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['SINGLE_FAMILY', 'MULTI_FAMILY', 'APARTMENT', 'CONDO', 'TOWNHOUSE', 'COMMERCIAL']),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(5, 'Postal code is required'),
  country: z.string().default('USA'),
  yearBuilt: z.number().optional(),
  squareFeet: z.number().optional(),
  lotSize: z.number().optional(),
  parkingSpaces: z.number().optional(),
  purchasePrice: z.number().optional(),
  purchaseDate: z.string().optional(),
  currentValue: z.number().optional(),
  photos: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

// GET /api/properties - List all properties for the organization
export async function GET(request: Request) {
  try {
    const { userId, organizationId } = await auth()

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    // Build filter
    const where: Record<string, unknown> = {
      organizationId,
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { addressLine1: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ]
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        units: {
          select: {
            id: true,
            unitNumber: true,
            status: true,
            marketRent: true,
            bedrooms: true,
            bathrooms: true,
          },
        },
        _count: {
          select: {
            units: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ properties })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/properties - Create a new property
export async function POST(request: Request) {
  try {
    const { userId, organizationId } = await auth()

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = propertySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Create property
    const property = await prisma.property.create({
      data: {
        organizationId,
        name: data.name,
        type: data.type,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        yearBuilt: data.yearBuilt,
        squareFeet: data.squareFeet,
        lotSize: data.lotSize,
        parkingSpaces: data.parkingSpaces,
        purchasePrice: data.purchasePrice,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        currentValue: data.currentValue,
        photos: data.photos || [],
        notes: data.notes,
        status: 'ACTIVE',
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
        organizationId,
        userId,
        action: 'CREATE',
        entityType: 'property',
        entityId: property.id,
        description: `Created property: ${property.name}`,
        newValues: JSON.parse(JSON.stringify(property)),
      },
    })

    return NextResponse.json({ property }, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
