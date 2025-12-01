import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api/auth';
import {
  ApiError,
  errorResponse,
  validateBody,
  successResponse,
  noContentResponse,
} from '@/lib/api/handlers';

// Update schema
const updateConversationSchema = z.object({
  subject: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'CLOSED']).optional(),
});

// Helper to get conversation with access check
async function getConversationWithAccess(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          tenant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!conversation) {
    throw new ApiError('Conversation not found or access denied', 404, 'NOT_FOUND');
  }

  return conversation;
}

// Format conversation for response
function formatConversation(conversation: Awaited<ReturnType<typeof getConversationWithAccess>>) {
  return {
    id: conversation.id,
    organizationId: conversation.organizationId,
    type: conversation.type,
    subject: conversation.subject,
    status: conversation.status,
    contextType: conversation.contextType,
    contextId: conversation.contextId,
    lastMessageAt: conversation.lastMessageAt?.toISOString(),
    lastMessagePreview: conversation.lastMessagePreview,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    participants: conversation.participants.map((p) => {
      const person = p.user || p.tenant;
      // Only User has avatarUrl
      const avatarUrl = p.user?.avatarUrl || null;
      return {
        id: p.id,
        userId: p.userId,
        tenantId: p.tenantId,
        name: person ? `${person.firstName} ${person.lastName}` : 'Unknown',
        email: person?.email,
        avatarUrl,
        type: p.userId ? 'USER' : 'TENANT',
        role: p.role,
        lastReadAt: p.lastReadAt?.toISOString(),
        unreadCount: p.unreadCount,
      };
    }),
  };
}

// GET /api/conversations/[id] - Get a specific conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const conversation = await getConversationWithAccess(id, user.id);
    return successResponse(formatConversation(conversation));
  } catch (error) {
    return errorResponse(error);
  }
}

// PATCH /api/conversations/[id] - Update a conversation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const data = validateBody(updateConversationSchema, body);

    // Verify access
    await getConversationWithAccess(id, user.id);

    // Update conversation
    const updated = await prisma.conversation.update({
      where: { id },
      data: {
        ...(data.subject !== undefined && { subject: data.subject }),
        ...(data.status && { status: data.status }),
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return successResponse(formatConversation(updated));
  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE /api/conversations/[id] - Archive/delete a conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Verify access
    await getConversationWithAccess(id, user.id);

    // Soft delete by archiving
    await prisma.conversation.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    return noContentResponse();
  } catch (error) {
    return errorResponse(error);
  }
}
