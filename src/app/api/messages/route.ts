import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for sending a message
const messageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient is required'),
  recipientType: z.enum(['TENANT', 'USER', 'VENDOR']),
  subject: z.string().optional(),
  content: z.string().min(1, 'Message content is required'),
  propertyId: z.string().optional(),
  unitId: z.string().optional(),
  leaseId: z.string().optional(),
  maintenanceRequestId: z.string().optional(),
  channel: z.enum(['PORTAL', 'EMAIL', 'SMS']).default('PORTAL'),
  sendEmail: z.boolean().default(false),
  sendSms: z.boolean().default(false),
})

// GET /api/messages - List messages for the user
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
    const folder = searchParams.get('folder') || 'inbox' // inbox, sent, all
    const isRead = searchParams.get('isRead')
    const propertyId = searchParams.get('propertyId')
    const tenantId = searchParams.get('tenantId')
    const search = searchParams.get('search')

    // Build filter based on folder
    let where: Record<string, unknown> = {}

    if (folder === 'inbox') {
      // Messages received by this user
      where = {
        OR: [
          { recipientUserId: userId },
          {
            recipientTenant: {
              organizationId: user.organizationId,
            },
          },
        ],
      }
    } else if (folder === 'sent') {
      where = {
        senderUserId: userId,
      }
    } else {
      // All messages in organization
      where = {
        OR: [
          { senderUserId: userId },
          { recipientUserId: userId },
          {
            senderTenant: {
              organizationId: user.organizationId,
            },
          },
          {
            recipientTenant: {
              organizationId: user.organizationId,
            },
          },
        ],
      }
    }

    if (isRead !== null && isRead !== undefined) {
      where.isRead = isRead === 'true'
    }

    if (propertyId) {
      where.propertyId = propertyId
    }

    if (tenantId) {
      where.OR = [
        { senderTenantId: tenantId },
        { recipientTenantId: tenantId },
      ]
    }

    if (search) {
      where.AND = [
        where,
        {
          OR: [
            { subject: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        },
      ]
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        senderUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        senderTenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        recipientUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        recipientTenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Count unread
    const unreadCount = await prisma.message.count({
      where: {
        recipientUserId: userId,
        isRead: false,
      },
    })

    return NextResponse.json({
      messages,
      summary: {
        total: messages.length,
        unread: unreadCount,
      },
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/messages - Send a new message
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
    const validationResult = messageSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Verify recipient exists and belongs to organization
    let recipientTenantId: string | undefined
    let recipientUserId: string | undefined
    let recipientVendorId: string | undefined

    if (data.recipientType === 'TENANT') {
      const tenant = await prisma.tenant.findFirst({
        where: {
          id: data.recipientId,
          organizationId: user.organizationId,
        },
      })
      if (!tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
      }
      recipientTenantId = tenant.id
    } else if (data.recipientType === 'USER') {
      const recipientUser = await prisma.user.findFirst({
        where: {
          id: data.recipientId,
          organizationId: user.organizationId,
        },
      })
      if (!recipientUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      recipientUserId = recipientUser.id
    } else if (data.recipientType === 'VENDOR') {
      const vendor = await prisma.vendor.findFirst({
        where: {
          id: data.recipientId,
          organizationId: user.organizationId,
        },
      })
      if (!vendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
      }
      recipientVendorId = vendor.id
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderUserId: userId,
        recipientTenantId,
        recipientUserId,
        recipientVendorId,
        subject: data.subject,
        content: data.content,
        propertyId: data.propertyId,
        unitId: data.unitId,
        leaseId: data.leaseId,
        maintenanceRequestId: data.maintenanceRequestId,
        channel: data.channel,
        isRead: false,
      },
      include: {
        senderUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        recipientTenant: true,
        recipientUser: true,
        property: true,
        unit: true,
      },
    })

    // TODO: If sendEmail or sendSms is true, queue notification
    // This would integrate with email/SMS service in production

    // Create notification for recipient
    if (recipientTenantId) {
      await prisma.notification.create({
        data: {
          tenantId: recipientTenantId,
          type: 'MESSAGE',
          title: data.subject || 'New Message',
          content: `You have a new message from ${user.firstName} ${user.lastName}`,
          relatedEntityType: 'message',
          relatedEntityId: message.id,
        },
      })
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
