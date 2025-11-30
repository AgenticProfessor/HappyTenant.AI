import { auth } from '@/lib/auth'
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
    const search = searchParams.get('search')

    // Find conversations where user is a participant
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: userId,
          },
        },
      },
      select: { id: true },
    })

    const conversationIds = conversations.map((c) => c.id)

    // Build filter based on folder
    let where: any = {
      conversationId: { in: conversationIds },
    }

    if (folder === 'inbox') {
      // Messages where sender is NOT the user
      where.senderUserId = { not: userId }
    } else if (folder === 'sent') {
      // Messages where sender IS the user
      where.senderUserId = userId
    }

    if (search) {
      where.content = { contains: search, mode: 'insensitive' }
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
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
                tenant: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      messages,
      summary: {
        total: messages.length,
        unread: 0, // TODO: Calculate unread based on ConversationParticipant
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
    }

    // Find or create conversation
    // Simplified logic: find conversation with these two participants
    // In a real app, we'd need more robust logic to handle multiple conversations
    let conversation = await prisma.conversation.findFirst({
      where: {
        organizationId: user.organizationId,
        participants: {
          every: {
            OR: [
              { userId: userId },
              { userId: recipientUserId },
              { tenantId: recipientTenantId },
            ],
          },
        },
      },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          organizationId: user.organizationId,
          type: recipientTenantId ? 'LANDLORD_TENANT' : 'INTERNAL',
          participants: {
            create: [
              { userId: userId, role: 'OWNER' },
              ...(recipientUserId ? [{ userId: recipientUserId }] : []),
              ...(recipientTenantId ? [{ tenantId: recipientTenantId }] : []),
            ],
          },
        },
      })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderUserId: userId,
        content: data.content,
        channel: data.channel as any,
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
      },
    })

    // Create notification for recipient
    if (recipientTenantId) {
      await prisma.notification.create({
        data: {
          tenantId: recipientTenantId,
          type: 'NEW_MESSAGE',
          title: data.subject || 'New Message',
          body: `You have a new message from ${user.firstName} ${user.lastName}`,
          channels: ['IN_APP', 'EMAIL'],
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
