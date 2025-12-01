// Socket.io event type definitions for real-time messaging

export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Message events
  MESSAGE_NEW: 'message:new',
  MESSAGE_READ: 'message:read',
  MESSAGE_DELETED: 'message:deleted',

  // Typing indicators
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',

  // Conversation events
  CONVERSATION_CREATED: 'conversation:created',
  CONVERSATION_UPDATED: 'conversation:updated',

  // Room management
  JOIN_CONVERSATION: 'join:conversation',
  LEAVE_CONVERSATION: 'leave:conversation',
  JOIN_USER_ROOM: 'join:user',

  // Notifications
  NOTIFICATION: 'notification',
} as const;

// Payload types for each event
export interface MessageNewPayload {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'USER' | 'TENANT';
  senderName: string;
  content: string;
  contentType: 'TEXT' | 'IMAGE' | 'FILE';
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
}

export interface MessageReadPayload {
  conversationId: string;
  messageIds: string[];
  readerId: string;
  readAt: string;
}

export interface TypingPayload {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface ConversationCreatedPayload {
  id: string;
  type: 'LANDLORD_TENANT' | 'INTERNAL' | 'SUPPORT' | 'AI_ASSISTANT';
  title?: string;
  participants: Array<{
    id: string;
    name: string;
    type: 'USER' | 'TENANT';
  }>;
  createdAt: string;
}

export interface NotificationPayload {
  id: string;
  type: 'NEW_MESSAGE' | 'PAYMENT_RECEIVED' | 'MAINTENANCE_UPDATE' | 'LEASE_REMINDER';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

// Server to client events
export interface ServerToClientEvents {
  [SOCKET_EVENTS.MESSAGE_NEW]: (payload: MessageNewPayload) => void;
  [SOCKET_EVENTS.MESSAGE_READ]: (payload: MessageReadPayload) => void;
  [SOCKET_EVENTS.MESSAGE_DELETED]: (payload: { conversationId: string; messageId: string }) => void;
  [SOCKET_EVENTS.TYPING_START]: (payload: TypingPayload) => void;
  [SOCKET_EVENTS.TYPING_STOP]: (payload: TypingPayload) => void;
  [SOCKET_EVENTS.CONVERSATION_CREATED]: (payload: ConversationCreatedPayload) => void;
  [SOCKET_EVENTS.CONVERSATION_UPDATED]: (payload: { conversationId: string; lastMessageAt: string }) => void;
  [SOCKET_EVENTS.NOTIFICATION]: (payload: NotificationPayload) => void;
}

// Client to server events
export interface ClientToServerEvents {
  [SOCKET_EVENTS.JOIN_CONVERSATION]: (conversationId: string) => void;
  [SOCKET_EVENTS.LEAVE_CONVERSATION]: (conversationId: string) => void;
  [SOCKET_EVENTS.JOIN_USER_ROOM]: (userId: string) => void;
  [SOCKET_EVENTS.TYPING_START]: (payload: { conversationId: string }) => void;
  [SOCKET_EVENTS.TYPING_STOP]: (payload: { conversationId: string }) => void;
  [SOCKET_EVENTS.MESSAGE_READ]: (payload: { conversationId: string; messageIds: string[] }) => void;
}

// Socket data attached to each connection
export interface SocketData {
  userId: string;
  userType: 'USER' | 'TENANT';
  organizationId?: string;
}
