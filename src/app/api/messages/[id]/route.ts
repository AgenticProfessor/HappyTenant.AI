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

    const message = await prisma.message.findUnique({
      where: { id },
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
            participants: true,
          },
        },
      },
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Check if user is a participant
    const isParticipant = message.conversation.participants.some(p => p.userId === userId)
    if (!isParticipant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Mark as read if user is not the sender
    if (message.senderUserId !== userId && !message.readAt) {
      await prisma.message.update({
        where: { id },
        data: {
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

    const existingMessage = await prisma.message.findUnique({
      where: { id },
      include: {
        conversation: {
          include: {
            participants: true,
          },
        },
      },
    })

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Check if user is a participant
    const isParticipant = existingMessage.conversation.participants.some(p => p.userId === userId)
    if (!isParticipant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { isRead } = body

    const message = await prisma.message.update({
      where: { id },
      data: {
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
      // await tx.message.deleteMany({
      //   where: { parentMessageId: id },
      // })
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
