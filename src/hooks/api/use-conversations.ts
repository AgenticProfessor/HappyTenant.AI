'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Conversation,
  Message,
  ConversationsResponse,
  MessagesResponse,
  CreateConversationData,
  SendMessageData,
} from '@/components/messages/types';

// Query keys
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...conversationKeys.lists(), filters] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
  messages: (conversationId: string) =>
    [...conversationKeys.detail(conversationId), 'messages'] as const,
};

// Fetch conversations
async function fetchConversations(params?: {
  type?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<ConversationsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set('type', params.type);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());

  const response = await fetch(`/api/conversations?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch conversations');
  }
  return response.json();
}

// Fetch single conversation
async function fetchConversation(id: string): Promise<Conversation> {
  const response = await fetch(`/api/conversations/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch conversation');
  }
  return response.json();
}

// Fetch messages for a conversation
async function fetchMessages(
  conversationId: string,
  params?: { cursor?: string; limit?: number }
): Promise<MessagesResponse> {
  const searchParams = new URLSearchParams();
  if (params?.cursor) searchParams.set('cursor', params.cursor);
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const response = await fetch(
    `/api/conversations/${conversationId}/messages?${searchParams.toString()}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  return response.json();
}

// Create conversation
async function createConversation(data: CreateConversationData): Promise<Conversation> {
  const response = await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create conversation');
  }
  return response.json();
}

// Send message
async function sendMessage(data: SendMessageData): Promise<Message> {
  const response = await fetch(`/api/conversations/${data.conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: data.content,
      contentType: data.contentType || 'TEXT',
      attachments: data.attachments,
    }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send message');
  }
  return response.json();
}

// Mark messages as read
async function markMessagesAsRead(
  conversationId: string,
  messageIds: string[]
): Promise<void> {
  const response = await fetch(`/api/conversations/${conversationId}/read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageIds }),
  });
  if (!response.ok) {
    throw new Error('Failed to mark messages as read');
  }
}

// Hook: Get conversations list
export function useConversations(params?: {
  type?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: conversationKeys.list(params || {}),
    queryFn: () => fetchConversations(params),
    staleTime: 1000 * 60, // 1 minute
  });
}

// Hook: Get single conversation
export function useConversation(id: string | null) {
  return useQuery({
    queryKey: conversationKeys.detail(id || ''),
    queryFn: () => fetchConversation(id!),
    enabled: !!id,
    staleTime: 1000 * 30, // 30 seconds
  });
}

// Hook: Get messages for a conversation
export function useConversationMessages(
  conversationId: string | null,
  params?: { cursor?: string; limit?: number }
) {
  return useQuery({
    queryKey: conversationKeys.messages(conversationId || ''),
    queryFn: () => fetchMessages(conversationId!, params),
    enabled: !!conversationId,
    staleTime: 1000 * 10, // 10 seconds
  });
}

// Hook: Create conversation
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConversation,
    onSuccess: (newConversation) => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      // Add to cache
      queryClient.setQueryData(
        conversationKeys.detail(newConversation.id),
        newConversation
      );
    },
  });
}

// Hook: Send message
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (newMessage, variables) => {
      // Optimistically add message to cache
      queryClient.setQueryData<MessagesResponse>(
        conversationKeys.messages(variables.conversationId),
        (old) => {
          if (!old) return { messages: [newMessage], total: 1, hasMore: false };
          return {
            ...old,
            messages: [...old.messages, newMessage],
            total: old.total + 1,
          };
        }
      );

      // Update conversation's last message
      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(variables.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}

// Hook: Mark messages as read
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      messageIds,
    }: {
      conversationId: string;
      messageIds: string[];
    }) => markMessagesAsRead(conversationId, messageIds),
    onSuccess: (_, variables) => {
      // Update messages in cache
      queryClient.setQueryData<MessagesResponse>(
        conversationKeys.messages(variables.conversationId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: old.messages.map((m) =>
              variables.messageIds.includes(m.id)
                ? { ...m, readAt: new Date().toISOString() }
                : m
            ),
          };
        }
      );

      // Update unread count
      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(variables.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}

// Helper: Add message from real-time event
export function useAddRealtimeMessage() {
  const queryClient = useQueryClient();

  return (message: Message) => {
    // Add to messages cache
    queryClient.setQueryData<MessagesResponse>(
      conversationKeys.messages(message.conversationId),
      (old) => {
        if (!old) return { messages: [message], total: 1, hasMore: false };
        // Avoid duplicates
        if (old.messages.some((m) => m.id === message.id)) return old;
        return {
          ...old,
          messages: [...old.messages, message],
          total: old.total + 1,
        };
      }
    );

    // Invalidate conversations list to update last message preview
    queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
  };
}
