import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating a vendor
const vendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
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
  ]),
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
  w9OnFile: z.boolean().default(false),
  hourlyRate: z.number().optional(),
  notes: z.string().optional(),
  isPreferred: z.boolean().default(false),
})

// GET /api/vendors - List all vendors for the organization
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
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const isPreferred = searchParams.get('isPreferred')

    // Build filter
    const where: Record<string, unknown> = {
      organizationId: user.organizationId,
    }

    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
    }

    if (isPreferred === 'true') {
      where.isPreferred = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        _count: {
          select: {
            maintenanceRequests: true,
            workOrders: true,
          },
        },
      },
      orderBy: [
        { isPreferred: 'desc' },
        { name: 'asc' },
      ],
    })

    // Calculate summary
    const activeVendors = vendors.filter(v => v.status === 'ACTIVE').length
    const preferredVendors = vendors.filter(v => v.isPreferred).length

    return NextResponse.json({
      vendors,
      summary: {
        total: vendors.length,
        active: activeVendors,
        preferred: preferredVendors,
      },
    })
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/vendors - Create a new vendor
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
    const validationResult = vendorSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Create vendor
    const vendor = await prisma.vendor.create({
      data: {
        organizationId: user.organizationId,
        name: data.name,
        type: data.type,
        contactName: data.contactName,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        website: data.website,
        licenseNumber: data.licenseNumber,
        insuranceInfo: data.insuranceInfo,
        w9OnFile: data.w9OnFile,
        hourlyRate: data.hourlyRate,
        notes: data.notes,
        isPreferred: data.isPreferred,
        status: 'ACTIVE',
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'CREATE',
        entityType: 'vendor',
        entityId: vendor.id,
        description: `Created vendor: ${vendor.name}`,
        newValues: JSON.parse(JSON.stringify(vendor)),
      },
    })

    return NextResponse.json({ vendor }, { status: 201 })
  } catch (error) {
    console.error('Error creating vendor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
