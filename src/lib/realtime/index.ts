// Real-time messaging infrastructure using Socket.io

// Event types and constants
export * from './events';

// Server-side utilities (use only in API routes or server components)
export {
  initializeSocketServer,
  getSocketServer,
  emitNewMessage,
  emitMessageRead,
  emitTyping,
  emitConversationCreated,
  emitNotification,
  emitConversationUpdated,
  type TypedSocketServer,
} from './socket-server';

// Client-side utilities (use only in client components)
export {
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
} from './socket-client';
