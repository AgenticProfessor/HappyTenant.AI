"use client"

import { Wrench } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

export interface EmptyMaintenanceProps {
  onCreateRequest?: () => void
}

export function EmptyMaintenance({ onCreateRequest }: EmptyMaintenanceProps) {
  return (
    <EmptyState
      icon={Wrench}
      title="No maintenance requests"
      description="Track and manage all maintenance requests for your properties. Create requests, assign vendors, and monitor completion status."
      action={
        onCreateRequest
          ? {
              label: "Create a Request",
              onClick: onCreateRequest,
            }
          : undefined
      }
      iconClassName="bg-orange-50 dark:bg-orange-950/30"
    />
  )
}
