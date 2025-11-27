"use client"

import { MessageSquare } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

export interface EmptyMessagesProps {
  onStartConversation?: () => void
}

export function EmptyMessages({ onStartConversation }: EmptyMessagesProps) {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No messages yet"
      description="Stay connected with your tenants. Send messages, share updates, and keep all your communications organized in one place."
      action={
        onStartConversation
          ? {
              label: "Start a Conversation",
              onClick: onStartConversation,
            }
          : undefined
      }
      iconClassName="bg-purple-50 dark:bg-purple-950/30"
    />
  )
}
