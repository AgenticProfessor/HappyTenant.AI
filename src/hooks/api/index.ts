// Central export for all API hooks
export * from './use-properties'
export * from './use-tenants'
export * from './use-leases'
export * from './use-applications'
export * from './use-charges'
export * from './use-payments'
export * from './use-maintenance'
export * from './use-vendors'

// Direct messaging API (one-off messages, email/SMS)
export * from './use-messages'

// Conversations API (real-time chat) - renamed to avoid conflicts
export {
  conversationKeys,
  useConversations,
  useConversation,
  useConversationMessages,
  useCreateConversation,
  useSendMessage as useSendConversationMessage,
  useMarkAsRead as useMarkConversationAsRead,
  useAddRealtimeMessage,
} from './use-conversations'
