import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { createApplicationLinkSchema } from '@/lib/schemas/application'

// GET /api/applications/links - List all application links for the organization
export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url)
    const unitId = searchParams.get('unitId')
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {
      organizationId: user.organizationId,
    }

    if (unitId) {
      where.unitId = unitId
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const links = await prisma.applicationLink.findMany({
      where,
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
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ links })
  } catch (error) {
    console.error('Error fetching application links:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/applications/links - Create a new application link
export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const validationResult = createApplicationLinkSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // If unitId provided, verify it belongs to the organization
    if (data.unitId) {
      const unit = await prisma.unit.findFirst({
        where: {
          id: data.unitId,
          property: {
            organizationId: user.organizationId,
          },
        },
      })

      if (!unit) {
        return NextResponse.json(
          { error: 'Unit not found or not accessible' },
          { status: 404 }
        )
      }
    }

    // Generate a unique URL-safe token
    const token = nanoid(12)

    const link = await prisma.applicationLink.create({
      data: {
        organizationId: user.organizationId,
        token,
        name: data.name,
        unitId: data.unitId,
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
        action: 'CREATE',
        entityType: 'application_link',
        entityId: link.id,
        description: `Created application link: ${link.name || link.token}`,
        newValues: JSON.parse(JSON.stringify(link)),
      },
    })

    return NextResponse.json({ link }, { status: 201 })
  } catch (error) {
    console.error('Error creating application link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
