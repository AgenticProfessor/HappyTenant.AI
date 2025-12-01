import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
  MessageNewPayload,
  MessageReadPayload,
  TypingPayload,
  ConversationCreatedPayload,
  NotificationPayload,
} from './events';
import { SOCKET_EVENTS } from './events';

// Typed Socket.io server
export type TypedSocketServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

// Global socket server instance
let io: TypedSocketServer | null = null;

// Initialize Socket.io server
export function initializeSocketServer(httpServer: HTTPServer): TypedSocketServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    Record<string, never>,
    SocketData
  >(httpServer, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const userType = socket.handshake.auth.userType as 'USER' | 'TENANT';

      if (!token) {
        return next(new Error('Authentication required'));
      }

      // In production, verify JWT/session token here
      // For now, we'll use the provided user info
      const userId = socket.handshake.auth.userId;
      const organizationId = socket.handshake.auth.organizationId;

      if (!userId) {
        return next(new Error('Invalid authentication'));
      }

      // Attach user data to socket
      socket.data.userId = userId;
      socket.data.userType = userType || 'USER';
      socket.data.organizationId = organizationId;

      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.data.userId})`);

    // Auto-join user's personal room for direct notifications
    const userRoom = `user:${socket.data.userId}`;
    socket.join(userRoom);

    // Join conversation room
    socket.on(SOCKET_EVENTS.JOIN_CONVERSATION, (conversationId: string) => {
      const room = `conversation:${conversationId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined ${room}`);
    });

    // Leave conversation room
    socket.on(SOCKET_EVENTS.LEAVE_CONVERSATION, (conversationId: string) => {
      const room = `conversation:${conversationId}`;
      socket.leave(room);
      console.log(`Socket ${socket.id} left ${room}`);
    });

    // Typing start
    socket.on(SOCKET_EVENTS.TYPING_START, ({ conversationId }) => {
      const room = `conversation:${conversationId}`;
      socket.to(room).emit(SOCKET_EVENTS.TYPING_START, {
        conversationId,
        userId: socket.data.userId,
        userName: socket.handshake.auth.userName || 'User',
        isTyping: true,
      });
    });

    // Typing stop
    socket.on(SOCKET_EVENTS.TYPING_STOP, ({ conversationId }) => {
      const room = `conversation:${conversationId}`;
      socket.to(room).emit(SOCKET_EVENTS.TYPING_STOP, {
        conversationId,
        userId: socket.data.userId,
        userName: socket.handshake.auth.userName || 'User',
        isTyping: false,
      });
    });

    // Mark messages as read
    socket.on(SOCKET_EVENTS.MESSAGE_READ, ({ conversationId, messageIds }) => {
      const room = `conversation:${conversationId}`;
      socket.to(room).emit(SOCKET_EVENTS.MESSAGE_READ, {
        conversationId,
        messageIds,
        readerId: socket.data.userId,
        readAt: new Date().toISOString(),
      });
    });

    // Disconnect handler
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });

  return io;
}

// Get the socket server instance
export function getSocketServer(): TypedSocketServer | null {
  return io;
}

// Emit a new message to a conversation room
export function emitNewMessage(conversationId: string, message: MessageNewPayload): void {
  if (!io) return;

  const room = `conversation:${conversationId}`;
  io.to(room).emit(SOCKET_EVENTS.MESSAGE_NEW, message);
}

// Emit message read status
export function emitMessageRead(conversationId: string, payload: MessageReadPayload): void {
  if (!io) return;

  const room = `conversation:${conversationId}`;
  io.to(room).emit(SOCKET_EVENTS.MESSAGE_READ, payload);
}

// Emit typing indicator
export function emitTyping(conversationId: string, payload: TypingPayload): void {
  if (!io) return;

  const room = `conversation:${conversationId}`;
  const event = payload.isTyping ? SOCKET_EVENTS.TYPING_START : SOCKET_EVENTS.TYPING_STOP;
  io.to(room).emit(event, payload);
}

// Emit new conversation to all participants
export function emitConversationCreated(
  participantIds: string[],
  conversation: ConversationCreatedPayload
): void {
  if (!io) return;

  participantIds.forEach((userId) => {
    io?.to(`user:${userId}`).emit(SOCKET_EVENTS.CONVERSATION_CREATED, conversation);
  });
}

// Emit notification to a specific user
export function emitNotification(userId: string, notification: NotificationPayload): void {
  if (!io) return;

  io.to(`user:${userId}`).emit(SOCKET_EVENTS.NOTIFICATION, notification);
}

// Emit conversation update (e.g., new message timestamp)
export function emitConversationUpdated(
  participantIds: string[],
  conversationId: string,
  lastMessageAt: string
): void {
  if (!io) return;

  participantIds.forEach((userId) => {
    io?.to(`user:${userId}`).emit(SOCKET_EVENTS.CONVERSATION_UPDATED, {
      conversationId,
      lastMessageAt,
    });
  });
}
