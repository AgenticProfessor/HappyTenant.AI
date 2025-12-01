'use client';

import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from './events';

// Typed Socket.io client
export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Global socket instance
let socket: TypedSocket | null = null;

interface SocketAuthOptions {
  userId: string;
  userType: 'USER' | 'TENANT';
  userName: string;
  organizationId?: string;
  token: string;
}

// Initialize socket connection
export function initializeSocket(auth: SocketAuthOptions): TypedSocket {
  if (socket?.connected) {
    return socket;
  }

  const socketUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  socket = io(socketUrl, {
    path: '/api/socket',
    auth: {
      token: auth.token,
      userId: auth.userId,
      userType: auth.userType,
      userName: auth.userName,
      organizationId: auth.organizationId,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  }) as TypedSocket;

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
}

// Get the socket instance
export function getSocket(): TypedSocket | null {
  return socket;
}

// Disconnect socket
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Join a conversation room
export function joinConversation(conversationId: string): void {
  if (socket?.connected) {
    socket.emit('join:conversation', conversationId);
  }
}

// Leave a conversation room
export function leaveConversation(conversationId: string): void {
  if (socket?.connected) {
    socket.emit('leave:conversation', conversationId);
  }
}

// Send typing start indicator
export function sendTypingStart(conversationId: string): void {
  if (socket?.connected) {
    socket.emit('typing:start', { conversationId });
  }
}

// Send typing stop indicator
export function sendTypingStop(conversationId: string): void {
  if (socket?.connected) {
    socket.emit('typing:stop', { conversationId });
  }
}

// Mark messages as read
export function sendMessageRead(conversationId: string, messageIds: string[]): void {
  if (socket?.connected) {
    socket.emit('message:read', { conversationId, messageIds });
  }
}

// Check if socket is connected
export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}
