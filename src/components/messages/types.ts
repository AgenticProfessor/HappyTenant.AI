// Types for messaging components

export interface ConversationParticipant {
  id: string;
  userId?: string;
  tenantId?: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  type: 'USER' | 'TENANT';
  role: 'OWNER' | 'PARTICIPANT' | 'AI_AGENT';
  lastReadAt?: string;
  unreadCount: number;
}

export interface Conversation {
  id: string;
  organizationId: string;
  type: 'LANDLORD_TENANT' | 'INTERNAL' | 'SUPPORT' | 'AI_ASSISTANT';
  subject?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'CLOSED';
  contextType?: string;
  contextId?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  contentType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' | 'AI_SUGGESTION';
  attachments: string[];
  senderUserId?: string;
  senderTenantId?: string;
  senderName: string;
  senderAvatarUrl?: string;
  senderType: 'USER' | 'TENANT' | 'SYSTEM';
  isSystemMessage: boolean;
  isAiGenerated: boolean;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

// API Response types
export interface ConversationsResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MessagesResponse {
  messages: Message[];
  total: number;
  cursor?: string;
  hasMore: boolean;
}

// Create types
export interface CreateConversationData {
  type: 'LANDLORD_TENANT' | 'INTERNAL' | 'SUPPORT';
  participantIds: Array<{ userId?: string; tenantId?: string }>;
  subject?: string;
  contextType?: string;
  contextId?: string;
  initialMessage?: string;
}

export interface SendMessageData {
  conversationId: string;
  content: string;
  contentType?: 'TEXT' | 'IMAGE' | 'FILE';
  attachments?: string[];
}
