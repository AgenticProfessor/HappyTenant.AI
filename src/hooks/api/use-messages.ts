'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export type MessageChannel = 'PORTAL' | 'EMAIL' | 'SMS'

export interface Message {
  id: string
  subject?: string | null
  content: string
  channel: MessageChannel
  isRead: boolean
  readAt?: string | null
  createdAt: string
  updatedAt: string
  senderUser?: {
    id: string
    firstName: string
    lastName: string
    email: string
  } | null
  senderTenant?: {
    id: string
    firstName: string
    lastName: string
    email: string
  } | null
  recipientUser?: {
    id: string
    firstName: string
    lastName: string
    email: string
  } | null
  recipientTenant?: {
    id: string
    firstName: string
    lastName: string
    email: string
  } | null
  recipientVendor?: {
    id: string
    name: string
    email?: string | null
  } | null
  property?: {
    id: string
    name: string
  } | null
  unit?: {
    id: string
    unitNumber: string
  } | null
  replies?: Message[]
}

export interface SendMessageInput {
  recipientId: string
  recipientType: 'TENANT' | 'USER' | 'VENDOR'
  subject?: string
  content: string
  propertyId?: string
  unitId?: string
  leaseId?: string
  maintenanceRequestId?: string
  channel?: MessageChannel
  sendEmail?: boolean
  sendSms?: boolean
}

// API Functions
async function fetchMessages(filters?: {
  folder?: string
  isRead?: string
  propertyId?: string
  tenantId?: string
  search?: string
}): Promise<{
  messages: Message[]
  summary: { total: number; unread: number }
}> {
  const params = new URLSearchParams()
  if (filters?.folder) params.set('folder', filters.folder)
  if (filters?.isRead) params.set('isRead', filters.isRead)
  if (filters?.propertyId) params.set('propertyId', filters.propertyId)
  if (filters?.tenantId) params.set('tenantId', filters.tenantId)
  if (filters?.search) params.set('search', filters.search)

  const response = await fetch(`/api/messages?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch messages')
  }
  return response.json()
}

async function fetchMessage(id: string): Promise<{ message: Message }> {
  const response = await fetch(`/api/messages/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch message')
  }
  return response.json()
}

async function sendMessage(data: SendMessageInput): Promise<{ message: Message }> {
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to send message')
  }
  return response.json()
}

async function updateMessage(
  id: string,
  data: { isRead?: boolean }
): Promise<{ message: Message }> {
  const response = await fetch(`/api/messages/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update message')
  }
  return response.json()
}

async function deleteMessage(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/messages/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete message')
  }
  return response.json()
}

// Query Keys
export const messageKeys = {
  all: ['messages'] as const,
  lists: () => [...messageKeys.all, 'list'] as const,
  list: (filters?: Record<string, string | undefined>) =>
    [...messageKeys.lists(), filters] as const,
  details: () => [...messageKeys.all, 'detail'] as const,
  detail: (id: string) => [...messageKeys.details(), id] as const,
}

// Hooks
export function useMessages(filters?: {
  folder?: string
  isRead?: string
  propertyId?: string
  tenantId?: string
  search?: string
}) {
  return useQuery({
    queryKey: messageKeys.list(filters),
    queryFn: () => fetchMessages(filters),
  })
}

export function useMessage(id: string) {
  return useQuery({
    queryKey: messageKeys.detail(id),
    queryFn: () => fetchMessage(id),
    enabled: !!id,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() })
    },
  })
}

export function useUpdateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { isRead?: boolean } }) =>
      updateMessage(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() })
      queryClient.invalidateQueries({ queryKey: messageKeys.detail(id) })
    },
  })
}

export function useDeleteMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() })
    },
  })
}

// Utility functions
export function getSenderName(message: Message): string {
  if (message.senderUser) {
    return `${message.senderUser.firstName} ${message.senderUser.lastName}`
  }
  if (message.senderTenant) {
    return `${message.senderTenant.firstName} ${message.senderTenant.lastName}`
  }
  return 'Unknown'
}

export function getRecipientName(message: Message): string {
  if (message.recipientUser) {
    return `${message.recipientUser.firstName} ${message.recipientUser.lastName}`
  }
  if (message.recipientTenant) {
    return `${message.recipientTenant.firstName} ${message.recipientTenant.lastName}`
  }
  if (message.recipientVendor) {
    return message.recipientVendor.name
  }
  return 'Unknown'
}

export function formatMessageDate(date: string): string {
  const messageDate = new Date(date)
  const now = new Date()
  const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    return messageDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  } else if (diffInHours < 48) {
    return 'Yesterday'
  } else {
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }
}
