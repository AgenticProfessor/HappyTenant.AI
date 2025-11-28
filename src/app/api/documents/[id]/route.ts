import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for updating a document
const documentUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  expiresAt: z.string().optional(),
  isSharedWithTenant: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
})

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/documents/[id] - Get a single document
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

    const document = await prisma.document.findFirst({
      where: {
        id,
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
      },
      include: {
        property: true,
        unit: {
          include: {
            property: true,
          },
        },
        tenant: true,
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
        application: true,
        maintenanceRequest: true,
        vendor: true,
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/documents/[id] - Update a document
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

    // Check if document exists and belongs to user's organization
    const existingDocument = await prisma.document.findFirst({
      where: {
        id,
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
      },
    })

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = documentUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Update document
    const document = await prisma.document.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.expiresAt !== undefined && {
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
        }),
        ...(data.isSharedWithTenant !== undefined && { isSharedWithTenant: data.isSharedWithTenant }),
        ...(data.tags && { tags: data.tags }),
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
        action: 'UPDATE',
        entityType: 'document',
        entityId: document.id,
        description: `Updated document: ${document.name}`,
        previousValues: JSON.parse(JSON.stringify(existingDocument)),
        newValues: JSON.parse(JSON.stringify(document)),
      },
    })

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/documents/[id] - Delete a document
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

    // Check if document exists and belongs to user's organization
    const existingDocument = await prisma.document.findFirst({
      where: {
        id,
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
      },
    })

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Delete document record
    // Note: In production, also delete file from storage
    await prisma.document.delete({
      where: { id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'DELETE',
        entityType: 'document',
        entityId: id,
        description: `Deleted document: ${existingDocument.name}`,
        previousValues: JSON.parse(JSON.stringify(existingDocument)),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
