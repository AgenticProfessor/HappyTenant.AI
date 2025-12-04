import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating a vendor
const vendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum([
    'PLUMBING',
    'ELECTRICAL',
    'HVAC',
    'GENERAL_CONTRACTOR',
    'GENERAL_HANDYMAN',
    'LANDSCAPING',
    'PEST_CONTROL',
    'CLEANING',
    'LOCKSMITH',
    'APPLIANCE',
    'PAINTING',
    'ROOFING',
    'FLOORING',
    'OTHER'
  ]),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  website: z.string().optional(),
  licenseNumber: z.string().optional(),
  hourlyRate: z.number().optional(),
  notes: z.string().optional(),
})

// GET /api/vendors - List all vendors for the organization
export async function GET(request: Request) {
  try {
    const { userId, organizationId } = await auth()

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Build filter
    const where: Record<string, unknown> = {
      organizationId,
    }

    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
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
          },
        },
        maintenanceRequests: {
          select: {
            id: true,
            status: true,
            actualCost: true,
          },
        },
      },
      orderBy: [
        { name: 'asc' },
      ],
    })

    // Calculate summary
    const activeVendors = vendors.filter(v => v.status === 'ACTIVE').length

    // Enhance vendors with calculated stats
    const vendorsWithStats = vendors.map(vendor => {
      const totalJobs = vendor._count.maintenanceRequests;
      const completedJobs = vendor.maintenanceRequests.filter(
        req => req.status === 'COMPLETED'
      ).length;
      const totalSpent = vendor.maintenanceRequests.reduce(
        (sum, req) => sum + Number(req.actualCost || 0),
        0
      );
      const completionRate = totalJobs > 0
        ? Math.round((completedJobs / totalJobs) * 100)
        : 0;

      // Remove maintenanceRequests from response (we only needed it for calculations)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { maintenanceRequests, ...vendorData } = vendor;

      return {
        ...vendorData,
        stats: {
          totalJobs,
          completedJobs,
          totalSpent,
          completionRate,
        },
      };
    });

    return NextResponse.json({
      vendors: vendorsWithStats,
      summary: {
        total: vendors.length,
        active: activeVendors,
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
    const { userId, organizationId } = await auth()

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        organizationId,
        name: data.name,
        categories: data.type ? [data.type] : [],
        contactName: data.contactName,
        email: data.email || null,
        phone: data.phone,
        addressLine1: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        website: data.website,
        licenseNumber: data.licenseNumber,
        hourlyRate: data.hourlyRate,
        notes: data.notes,
        status: 'ACTIVE',
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId,
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
