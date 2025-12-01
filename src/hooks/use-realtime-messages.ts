'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import {
  initializeSocket,
  getSocket,
  disconnectSocket,
  joinConversation,
  leaveConversation,
  sendTypingStart,
  sendTypingStop,
  sendMessageRead,
  isSocketConnected,
  type TypedSocket,
} from '@/lib/realtime/socket-client';
import {
  SOCKET_EVENTS,
  type MessageNewPayload,
  type MessageReadPayload,
  type TypingPayload,
  type ConversationCreatedPayload,
  type NotificationPayload,
} from '@/lib/realtime/events';

interface UseRealtimeMessagesOptions {
  userId: string;
  userType: 'USER' | 'TENANT';
  userName: string;
  organizationId?: string;
  token: string;
  onNewMessage?: (message: MessageNewPayload) => void;
  onMessageRead?: (payload: MessageReadPayload) => void;
  onTypingStart?: (payload: TypingPayload) => void;
  onTypingStop?: (payload: TypingPayload) => void;
  onConversationCreated?: (conversation: ConversationCreatedPayload) => void;
  onNotification?: (notification: NotificationPayload) => void;
}

interface UseRealtimeMessagesReturn {
  isConnected: boolean;
  joinRoom: (conversationId: string) => void;
  leaveRoom: (conversationId: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  markAsRead: (conversationId: string, messageIds: string[]) => void;
  typingUsers: Map<string, Set<string>>; // conversationId -> Set of typing userIds
}

export function useRealtimeMessages(
  options: UseRealtimeMessagesOptions
): UseRealtimeMessagesReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  const socketRef = useRef<TypedSocket | null>(null);
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Initialize socket connection
  useEffect(() => {
    if (!options.userId || !options.token) return;

    const socket = initializeSocket({
      userId: options.userId,
      userType: options.userType,
      userName: options.userName,
      organizationId: options.organizationId,
      token: options.token,
    });

    socketRef.current = socket;

    // Connection status handlers
    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    // Message handlers
    const handleNewMessage = (message: MessageNewPayload) => {
      options.onNewMessage?.(message);
    };

    const handleMessageRead = (payload: MessageReadPayload) => {
      options.onMessageRead?.(payload);
    };

    // Typing handlers
    const handleTypingStart = (payload: TypingPayload) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        const conversationTyping = newMap.get(payload.conversationId) || new Set();
        conversationTyping.add(payload.userId);
        newMap.set(payload.conversationId, conversationTyping);
        return newMap;
      });

      // Auto-clear typing after 5 seconds (in case stop event is missed)
      const timeoutKey = `${payload.conversationId}:${payload.userId}`;
      const existingTimeout = typingTimeoutsRef.current.get(timeoutKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      const timeout = setTimeout(() => {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          const conversationTyping = newMap.get(payload.conversationId);
          if (conversationTyping) {
            conversationTyping.delete(payload.userId);
            if (conversationTyping.size === 0) {
              newMap.delete(payload.conversationId);
            }
          }
          return newMap;
        });
      }, 5000);

      typingTimeoutsRef.current.set(timeoutKey, timeout);
      options.onTypingStart?.(payload);
    };

    const handleTypingStop = (payload: TypingPayload) => {
      const timeoutKey = `${payload.conversationId}:${payload.userId}`;
      const existingTimeout = typingTimeoutsRef.current.get(timeoutKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        typingTimeoutsRef.current.delete(timeoutKey);
      }

      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        const conversationTyping = newMap.get(payload.conversationId);
        if (conversationTyping) {
          conversationTyping.delete(payload.userId);
          if (conversationTyping.size === 0) {
            newMap.delete(payload.conversationId);
          }
        }
        return newMap;
      });

      options.onTypingStop?.(payload);
    };

    // Conversation handlers
    const handleConversationCreated = (conversation: ConversationCreatedPayload) => {
      options.onConversationCreated?.(conversation);
    };

    // Notification handlers
    const handleNotification = (notification: NotificationPayload) => {
      options.onNotification?.(notification);
    };

    // Register event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on(SOCKET_EVENTS.MESSAGE_NEW, handleNewMessage);
    socket.on(SOCKET_EVENTS.MESSAGE_READ, handleMessageRead);
    socket.on(SOCKET_EVENTS.TYPING_START, handleTypingStart);
    socket.on(SOCKET_EVENTS.TYPING_STOP, handleTypingStop);
    socket.on(SOCKET_EVENTS.CONVERSATION_CREATED, handleConversationCreated);
    socket.on(SOCKET_EVENTS.NOTIFICATION, handleNotification);

    // Set initial connected state
    setIsConnected(socket.connected);

    // Cleanup on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off(SOCKET_EVENTS.MESSAGE_NEW, handleNewMessage);
      socket.off(SOCKET_EVENTS.MESSAGE_READ, handleMessageRead);
      socket.off(SOCKET_EVENTS.TYPING_START, handleTypingStart);
      socket.off(SOCKET_EVENTS.TYPING_STOP, handleTypingStop);
      socket.off(SOCKET_EVENTS.CONVERSATION_CREATED, handleConversationCreated);
      socket.off(SOCKET_EVENTS.NOTIFICATION, handleNotification);

      // Clear all typing timeouts
      typingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeoutsRef.current.clear();
    };
  }, [options.userId, options.token, options.userType, options.userName, options.organizationId]);

  // Room management functions
  const joinRoom = useCallback((conversationId: string) => {
    joinConversation(conversationId);
  }, []);

  const leaveRoom = useCallback((conversationId: string) => {
    leaveConversation(conversationId);
  }, []);

  // Typing indicator functions with debounce
  const typingDebounceRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const startTyping = useCallback((conversationId: string) => {
    sendTypingStart(conversationId);

    // Auto-stop typing after 3 seconds of inactivity
    const existingTimeout = typingDebounceRef.current.get(conversationId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(() => {
      sendTypingStop(conversationId);
      typingDebounceRef.current.delete(conversationId);
    }, 3000);

    typingDebounceRef.current.set(conversationId, timeout);
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    const existingTimeout = typingDebounceRef.current.get(conversationId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      typingDebounceRef.current.delete(conversationId);
    }
    sendTypingStop(conversationId);
  }, []);

  // Mark messages as read
  const markAsRead = useCallback((conversationId: string, messageIds: string[]) => {
    sendMessageRead(conversationId, messageIds);
  }, []);

  return {
    isConnected,
    joinRoom,
    leaveRoom,
    startTyping,
    stopTyping,
    markAsRead,
    typingUsers,
  };
}

// Hook for a single conversation
export function useConversationSocket(conversationId: string | null) {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    // Join the conversation room
    joinConversation(conversationId);
    setCurrentRoom(conversationId);

    return () => {
      // Leave the room on cleanup
      if (currentRoom) {
        leaveConversation(currentRoom);
      }
    };
  }, [conversationId]);

  return { currentRoom };
}
