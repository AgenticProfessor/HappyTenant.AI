import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating a document record
const documentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum([
    'LEASE',
    'ADDENDUM',
    'APPLICATION',
    'ID_DOCUMENT',
    'PROOF_OF_INCOME',
    'INSPECTION_REPORT',
    'MOVE_IN_CHECKLIST',
    'MOVE_OUT_CHECKLIST',
    'NOTICE',
    'INVOICE',
    'RECEIPT',
    'INSURANCE',
    'TAX_DOCUMENT',
    'PHOTO',
    'OTHER'
  ]),
  description: z.string().optional(),
  fileUrl: z.string().min(1, 'File URL is required'),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  // Association - at least one must be provided
  propertyId: z.string().optional(),
  unitId: z.string().optional(),
  tenantId: z.string().optional(),
  leaseId: z.string().optional(),
  applicationId: z.string().optional(),
  maintenanceRequestId: z.string().optional(),
  vendorId: z.string().optional(),
  // Metadata
  expiresAt: z.string().optional(),
  isSharedWithTenant: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
})

// GET /api/documents - List documents for the organization
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
    const propertyId = searchParams.get('propertyId')
    const unitId = searchParams.get('unitId')
    const tenantId = searchParams.get('tenantId')
    const leaseId = searchParams.get('leaseId')
    const search = searchParams.get('search')

    // Build filter - documents associated with the organization
    const where: Record<string, unknown> = {
      OR: [
        {
          property: {
            organizationId: user.organizationId,
          },
        },
        {
          unit: {
            property: {
              organizationId: user.organizationId,
            },
          },
        },
        {
          tenant: {
            organizationId: user.organizationId,
          },
        },
        {
          lease: {
            unit: {
              property: {
                organizationId: user.organizationId,
              },
            },
          },
        },
        {
          vendor: {
            organizationId: user.organizationId,
          },
        },
      ],
    }

    if (type) {
      where.type = type
    }

    if (propertyId) {
      where.propertyId = propertyId
    }

    if (unitId) {
      where.unitId = unitId
    }

    if (tenantId) {
      where.tenantId = tenantId
    }

    if (leaseId) {
      where.leaseId = leaseId
    }

    if (search) {
      where.AND = [
        where,
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      ]
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            name: true,
          },
        },
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
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        lease: {
          select: {
            id: true,
            status: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    })

    // Group by type for summary
    const byType = documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      documents,
      summary: {
        total: documents.length,
        byType,
      },
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/documents - Create a document record (after file upload)
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
    const validationResult = documentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Verify at least one association is provided
    if (!data.propertyId && !data.unitId && !data.tenantId && !data.leaseId &&
        !data.applicationId && !data.maintenanceRequestId && !data.vendorId) {
      return NextResponse.json(
        { error: 'Document must be associated with at least one entity' },
        { status: 400 }
      )
    }

    // Verify associations belong to organization
    if (data.propertyId) {
      const property = await prisma.property.findFirst({
        where: { id: data.propertyId, organizationId: user.organizationId },
      })
      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      }
    }

    if (data.tenantId) {
      const tenant = await prisma.tenant.findFirst({
        where: { id: data.tenantId, organizationId: user.organizationId },
      })
      if (!tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
      }
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        propertyId: data.propertyId,
        unitId: data.unitId,
        tenantId: data.tenantId,
        leaseId: data.leaseId,
        applicationId: data.applicationId,
        maintenanceRequestId: data.maintenanceRequestId,
        vendorId: data.vendorId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        isSharedWithTenant: data.isSharedWithTenant,
        tags: data.tags || [],
        uploadedById: userId,
        uploadedAt: new Date(),
      },
      include: {
        property: true,
        unit: true,
        tenant: true,
        lease: true,
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'CREATE',
        entityType: 'document',
        entityId: document.id,
        description: `Uploaded document: ${document.name}`,
        newValues: JSON.parse(JSON.stringify(document)),
      },
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
