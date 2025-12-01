import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateApplicationLinkSchema } from '@/lib/schemas/application'

// GET /api/applications/links/[linkId] - Get a specific application link
export async function GET(
  request: Request,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { userId } = await auth()
    const { linkId } = await params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const link = await prisma.applicationLink.findFirst({
      where: {
        id: linkId,
        organizationId: user.organizationId,
      },
      include: {
        unit: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                addressLine1: true,
                city: true,
                state: true,
              },
            },
          },
        },
        applications: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
            submittedAt: true,
          },
          orderBy: { submittedAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    })

    if (!link) {
      return NextResponse.json({ error: 'Application link not found' }, { status: 404 })
    }

    return NextResponse.json({ link })
  } catch (error) {
    console.error('Error fetching application link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/applications/links/[linkId] - Update an application link
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { userId } = await auth()
    const { linkId } = await params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify link belongs to organization
    const existingLink = await prisma.applicationLink.findFirst({
      where: {
        id: linkId,
        organizationId: user.organizationId,
      },
    })

    if (!existingLink) {
      return NextResponse.json({ error: 'Application link not found' }, { status: 404 })
    }

    const body = await request.json()
    const validationResult = updateApplicationLinkSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const link = await prisma.applicationLink.update({
      where: { id: linkId },
      data: {
        name: data.name,
        isActive: data.isActive,
        applicationFee: data.applicationFee,
        collectFeeOnline: data.collectFeeOnline,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        maxApplications: data.maxApplications,
        requiredDocuments: data.requiredDocuments,
        customQuestions: data.customQuestions,
      },
      include: {
        unit: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                addressLine1: true,
                city: true,
                state: true,
              },
            },
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
        entityType: 'application_link',
        entityId: link.id,
        description: `Updated application link: ${link.name || link.token}`,
        previousValues: JSON.parse(JSON.stringify(existingLink)),
        newValues: JSON.parse(JSON.stringify(link)),
      },
    })

    return NextResponse.json({ link })
  } catch (error) {
    console.error('Error updating application link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/applications/links/[linkId] - Deactivate an application link
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { userId } = await auth()
    const { linkId } = await params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify link belongs to organization
    const existingLink = await prisma.applicationLink.findFirst({
      where: {
        id: linkId,
        organizationId: user.organizationId,
      },
    })

    if (!existingLink) {
      return NextResponse.json({ error: 'Application link not found' }, { status: 404 })
    }

    // Soft delete by deactivating
    const link = await prisma.applicationLink.update({
      where: { id: linkId },
      data: {
        isActive: false,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: 'DELETE',
        entityType: 'application_link',
        entityId: link.id,
        description: `Deactivated application link: ${link.name || link.token}`,
        previousValues: JSON.parse(JSON.stringify(existingLink)),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting application link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
