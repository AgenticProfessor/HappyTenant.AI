import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api/auth';
import {
  errorResponse,
  validateBody,
  validateQuery,
  successResponse,
  createdResponse,
} from '@/lib/api/handlers';

// Query schema for listing conversations
const listQuerySchema = z.object({
  type: z.enum(['LANDLORD_TENANT', 'INTERNAL', 'SUPPORT', 'AI_ASSISTANT']).optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'CLOSED']).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(20),
});

// Schema for creating a conversation
const createConversationSchema = z.object({
  type: z.enum(['LANDLORD_TENANT', 'INTERNAL', 'SUPPORT']),
  participantIds: z.array(
    z.object({
      userId: z.string().optional(),
      tenantId: z.string().optional(),
    })
  ).min(1, 'At least one participant is required'),
  subject: z.string().optional(),
  contextType: z.string().optional(),
  contextId: z.string().optional(),
  initialMessage: z.string().optional(),
});

// GET /api/conversations - List conversations for current user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const query = validateQuery(listQuerySchema, searchParams);

    const skip = (query.page - 1) * query.pageSize;

    // Build where clause
    const where = {
      organizationId: user.organizationId,
      ...(query.type && { type: query.type }),
      ...(query.status && { status: query.status }),
      // User must be a participant
      participants: {
        some: {
          userId: user.id,
        },
      },
    };

    // Get conversations with pagination
    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
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
        orderBy: {
          lastMessageAt: { sort: 'desc', nulls: 'last' },
        },
        skip,
        take: query.pageSize,
      }),
      prisma.conversation.count({ where }),
    ]);

    // Transform to response format
    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      organizationId: conv.organizationId,
      type: conv.type,
      subject: conv.subject,
      status: conv.status,
      contextType: conv.contextType,
      contextId: conv.contextId,
      lastMessageAt: conv.lastMessageAt?.toISOString(),
      lastMessagePreview: conv.lastMessagePreview,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      participants: conv.participants.map((p) => {
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
    }));

    return successResponse({
      conversations: formattedConversations,
      total,
      page: query.page,
      pageSize: query.pageSize,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const data = validateBody(createConversationSchema, body);

    // Verify all participants exist and belong to the organization
    const participantChecks = await Promise.all(
      data.participantIds.map(async (p) => {
        if (p.userId) {
          const userExists = await prisma.user.findFirst({
            where: { id: p.userId, organizationId: user.organizationId },
          });
          return userExists ? { userId: p.userId } : null;
        }
        if (p.tenantId) {
          const tenantExists = await prisma.tenant.findFirst({
            where: { id: p.tenantId, organizationId: user.organizationId },
          });
          return tenantExists ? { tenantId: p.tenantId } : null;
        }
        return null;
      })
    );

    const validParticipants = participantChecks.filter(Boolean);
    if (validParticipants.length === 0) {
      return errorResponse(
        { message: 'No valid participants found', status: 400 },
        400
      );
    }

    // Create conversation with participants
    const conversation = await prisma.conversation.create({
      data: {
        organizationId: user.organizationId,
        type: data.type,
        subject: data.subject,
        contextType: data.contextType,
        contextId: data.contextId,
        status: 'ACTIVE',
        participants: {
          create: [
            // Add current user as owner
            {
              userId: user.id,
              role: 'OWNER',
            },
            // Add other participants
            ...validParticipants.map((p) => ({
              ...p,
              role: 'PARTICIPANT' as const,
            })),
          ],
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

    // Create initial message if provided
    if (data.initialMessage) {
      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderUserId: user.id,
          content: data.initialMessage,
          contentType: 'TEXT',
          sentAt: new Date(),
        },
      });

      // Update conversation with last message info
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: message.sentAt,
          lastMessagePreview:
            data.initialMessage.length > 100
              ? `${data.initialMessage.slice(0, 100)}...`
              : data.initialMessage,
        },
      });

      // Increment unread count for other participants
      await prisma.conversationParticipant.updateMany({
        where: {
          conversationId: conversation.id,
          userId: { not: user.id },
        },
        data: {
          unreadCount: { increment: 1 },
        },
      });
    }

    // Format response
    const formattedConversation = {
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

    return createdResponse(formattedConversation);
  } catch (error) {
    return errorResponse(error);
  }
}
