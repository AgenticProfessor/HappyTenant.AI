import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api/auth';
import {
  ApiError,
  errorResponse,
  validateBody,
  validateQuery,
  successResponse,
  createdResponse,
} from '@/lib/api/handlers';
import { emitNewMessage, emitConversationUpdated } from '@/lib/realtime/socket-server';

// Query schema for listing messages
const listQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

// Schema for sending a message
const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  contentType: z.enum(['TEXT', 'IMAGE', 'FILE']).default('TEXT'),
  attachments: z.array(z.string()).optional(),
});

// Helper to verify conversation access
async function verifyConversationAccess(conversationId: string, userId: string) {
  const participant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId,
      userId,
    },
    include: {
      conversation: true,
    },
  });

  if (!participant) {
    throw new ApiError('Conversation not found or access denied', 404, 'NOT_FOUND');
  }

  return participant;
}

// GET /api/conversations/[id]/messages - List messages in a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: conversationId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const query = validateQuery(listQuerySchema, searchParams);

    // Verify access
    await verifyConversationAccess(conversationId, user.id);

    // Build query with cursor-based pagination
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        ...(query.cursor && {
          createdAt: { lt: new Date(query.cursor) },
        }),
      },
      include: {
        senderUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
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
      orderBy: { createdAt: 'desc' },
      take: query.limit + 1, // Take one extra to check if there are more
    });

    // Check if there are more messages
    const hasMore = messages.length > query.limit;
    const resultMessages = hasMore ? messages.slice(0, query.limit) : messages;

    // Format messages (reverse to get chronological order)
    const formattedMessages = resultMessages.reverse().map((msg) => {
      const sender = msg.senderUser || msg.senderTenant;
      const senderName = sender
        ? `${sender.firstName} ${sender.lastName}`
        : msg.isSystemMessage
        ? 'System'
        : 'Unknown';
      // Only User has avatarUrl
      const senderAvatarUrl = msg.senderUser?.avatarUrl || null;

      return {
        id: msg.id,
        conversationId: msg.conversationId,
        content: msg.content,
        contentType: msg.contentType,
        attachments: msg.attachments,
        senderUserId: msg.senderUserId,
        senderTenantId: msg.senderTenantId,
        senderName,
        senderAvatarUrl,
        senderType: msg.senderUserId ? 'USER' : msg.senderTenantId ? 'TENANT' : 'SYSTEM',
        isSystemMessage: msg.isSystemMessage,
        isAiGenerated: msg.isAiGenerated,
        sentAt: msg.sentAt.toISOString(),
        deliveredAt: msg.deliveredAt?.toISOString(),
        readAt: msg.readAt?.toISOString(),
        createdAt: msg.createdAt.toISOString(),
      };
    });

    // Get cursor for next page
    const nextCursor = hasMore
      ? resultMessages[resultMessages.length - 1]?.createdAt.toISOString()
      : undefined;

    return successResponse({
      messages: formattedMessages,
      total: await prisma.message.count({ where: { conversationId } }),
      cursor: nextCursor,
      hasMore,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/conversations/[id]/messages - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: conversationId } = await params;
    const body = await request.json();
    const data = validateBody(sendMessageSchema, body);

    // Verify access
    const participant = await verifyConversationAccess(conversationId, user.id);

    // Get user info for sender name
    const senderUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
    });

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderUserId: user.id,
        content: data.content,
        contentType: data.contentType,
        attachments: data.attachments || [],
        sentAt: new Date(),
      },
    });

    // Update conversation with last message info
    const messagePreview =
      data.content.length > 100 ? `${data.content.slice(0, 100)}...` : data.content;

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: message.sentAt,
        lastMessagePreview: messagePreview,
      },
    });

    // Increment unread count for other participants
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: { not: user.id },
      },
      data: {
        unreadCount: { increment: 1 },
      },
    });

    // Format response
    const formattedMessage = {
      id: message.id,
      conversationId: message.conversationId,
      content: message.content,
      contentType: message.contentType,
      attachments: message.attachments,
      senderUserId: message.senderUserId,
      senderTenantId: message.senderTenantId,
      senderName: senderUser
        ? `${senderUser.firstName} ${senderUser.lastName}`
        : 'Unknown',
      senderAvatarUrl: senderUser?.avatarUrl,
      senderType: 'USER' as const,
      isSystemMessage: message.isSystemMessage,
      isAiGenerated: message.isAiGenerated,
      sentAt: message.sentAt.toISOString(),
      deliveredAt: message.deliveredAt?.toISOString(),
      readAt: message.readAt?.toISOString(),
      createdAt: message.createdAt.toISOString(),
    };

    // Emit real-time event
    try {
      // Create socket payload matching MessageNewPayload type
      const socketPayload = {
        id: message.id,
        conversationId: message.conversationId,
        senderId: user.id,
        senderType: 'USER' as const,
        senderName: senderUser
          ? `${senderUser.firstName} ${senderUser.lastName}`
          : 'Unknown',
        content: message.content,
        contentType: message.contentType as 'TEXT' | 'IMAGE' | 'FILE',
        attachmentUrl: message.attachments?.[0],
        createdAt: message.createdAt.toISOString(),
      };
      emitNewMessage(conversationId, socketPayload);

      // Get all participant IDs for conversation update
      const participants = await prisma.conversationParticipant.findMany({
        where: { conversationId },
        select: { userId: true, tenantId: true },
      });
      const participantIds = participants
        .map((p) => p.userId || p.tenantId)
        .filter(Boolean) as string[];

      emitConversationUpdated(participantIds, conversationId, message.sentAt.toISOString());
    } catch (socketError) {
      // Log but don't fail the request if socket emit fails
      console.error('Socket emit error:', socketError);
    }

    return createdResponse(formattedMessage);
  } catch (error) {
    return errorResponse(error);
  }
}
