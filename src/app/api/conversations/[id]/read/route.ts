import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api/auth';
import {
  ApiError,
  errorResponse,
  validateBody,
  successResponse,
} from '@/lib/api/handlers';
import { emitMessageRead } from '@/lib/realtime/socket-server';

// Schema for marking messages as read
const markReadSchema = z.object({
  messageIds: z.array(z.string()).min(1, 'At least one message ID is required'),
});

// POST /api/conversations/[id]/read - Mark messages as read
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: conversationId } = await params;
    const body = await request.json();
    const data = validateBody(markReadSchema, body);

    // Verify user is a participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: user.id,
      },
    });

    if (!participant) {
      throw new ApiError('Conversation not found or access denied', 404, 'NOT_FOUND');
    }

    const now = new Date();

    // Update messages as read
    await prisma.message.updateMany({
      where: {
        id: { in: data.messageIds },
        conversationId,
        readAt: null,
        // Don't mark own messages as read
        senderUserId: { not: user.id },
      },
      data: {
        readAt: now,
      },
    });

    // Update participant's last read time and reset unread count
    await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: {
        lastReadAt: now,
        unreadCount: 0,
      },
    });

    // Emit real-time event
    try {
      emitMessageRead(conversationId, {
        conversationId,
        messageIds: data.messageIds,
        readerId: user.id,
        readAt: now.toISOString(),
      });
    } catch (socketError) {
      console.error('Socket emit error:', socketError);
    }

    return successResponse({
      success: true,
      readAt: now.toISOString(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
