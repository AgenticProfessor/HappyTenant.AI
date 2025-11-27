"use client"

import { Building2 } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

export interface EmptyPropertiesProps {
  onAddProperty?: () => void
}

export function EmptyProperties({ onAddProperty }: EmptyPropertiesProps) {
  return (
    <EmptyState
      icon={Building2}
      title="No properties yet"
      description="Get started by adding your first property. You can manage units, tenants, and track payments all in one place."
      action={
        onAddProperty
          ? {
              label: "Add Your First Property",
              onClick: onAddProperty,
            }
          : undefined
      }
      iconClassName="bg-primary/10"
    />
  )
}
