import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating a document record
const documentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum([
    'LEASE_AGREEMENT',
    'LEASE_ADDENDUM',
    'RENTAL_APPLICATION',
    'ID_DOCUMENT',
    'INCOME_VERIFICATION',
    'SCREENING_REPORT',
    'MOVE_IN_INSPECTION',
    'MOVE_OUT_INSPECTION',
    'PAYMENT_RECEIPT',
    'INSURANCE_CERTIFICATE',
    'NOTICE',
    'INVOICE',
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
    const { userId, organizationId } = await auth()

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
            organizationId: organizationId,
          },
        },
        {
          unit: {
            property: {
              organizationId: organizationId,
            },
          },
        },
        {
          tenant: {
            organizationId: organizationId,
          },
        },
        {
          lease: {
            unit: {
              property: {
                organizationId: organizationId,
              },
            },
          },
        },
        {
          vendor: {
            organizationId: organizationId,
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
    const { userId, organizationId } = await auth()

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        where: { id: data.propertyId, organizationId: organizationId },
      })
      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      }
    }

    if (data.tenantId) {
      const tenant = await prisma.tenant.findFirst({
        where: { id: data.tenantId, organizationId: organizationId },
      })
      if (!tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
      }
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        organizationId: organizationId,
        name: data.name,
        fileName: data.name, // Using name as filename for simplicity
        type: data.type,
        description: data.description,
        fileUrl: data.fileUrl,
        storageKey: data.fileUrl, // Using URL as storage key
        fileSize: data.fileSize ?? 0,
        mimeType: data.mimeType ?? 'application/octet-stream',
        propertyId: data.propertyId,
        unitId: data.unitId,
        tenantId: data.tenantId,
        leaseId: data.leaseId,
        applicationId: data.applicationId,
        maintenanceRequestId: data.maintenanceRequestId,
        vendorId: data.vendorId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        isPublic: data.isSharedWithTenant ?? false,
        tags: data.tags || [],
        uploadedByUserId: userId,
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
        organizationId: organizationId,
        userId,
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
