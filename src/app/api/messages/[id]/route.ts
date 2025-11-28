import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/messages/[id] - Get a single message
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

    const message = await prisma.message.findFirst({
      where: {
        id,
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
        recipientVendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        property: true,
        unit: true,
        lease: true,
        maintenanceRequest: true,
        parentMessage: true,
        replies: {
          include: {
            senderUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            senderTenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Mark as read if user is the recipient
    if (message.recipientUserId === userId && !message.isRead) {
      await prisma.message.update({
        where: { id },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      })
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error fetching message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/messages/[id] - Update message (mark as read/unread)
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

    // Check if message exists and user has access
    const existingMessage = await prisma.message.findFirst({
      where: {
        id,
        OR: [
          { recipientUserId: userId },
          {
            recipientTenant: {
              organizationId: user.organizationId,
            },
          },
        ],
      },
    })

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const body = await request.json()
    const { isRead } = body

    const message = await prisma.message.update({
      where: { id },
      data: {
        isRead: isRead ?? existingMessage.isRead,
        readAt: isRead ? new Date() : null,
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
      },
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/messages/[id] - Delete a message
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

    // Only sender can delete their own messages
    const existingMessage = await prisma.message.findFirst({
      where: {
        id,
        senderUserId: userId,
      },
    })

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message not found or you do not have permission to delete' }, { status: 404 })
    }

    // Delete message and its replies
    await prisma.$transaction(async (tx) => {
      await tx.message.deleteMany({
        where: { parentMessageId: id },
      })
      await tx.message.delete({
        where: { id },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
