"use client"

import { Users } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

export interface EmptyTenantsProps {
  onAddTenant?: () => void
}

export function EmptyTenants({ onAddTenant }: EmptyTenantsProps) {
  return (
    <EmptyState
      icon={Users}
      title="No tenants yet"
      description="Start building your tenant roster. Add tenant information, manage leases, and track rental payments efficiently."
      action={
        onAddTenant
          ? {
              label: "Add Your First Tenant",
              onClick: onAddTenant,
            }
          : undefined
      }
      iconClassName="bg-blue-50 dark:bg-blue-950/30"
    />
  )
}
