"use client"

import { FileText } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

export interface EmptyDocumentsProps {
  onUploadDocument?: () => void
}

export function EmptyDocuments({ onUploadDocument }: EmptyDocumentsProps) {
  return (
    <EmptyState
      icon={FileText}
      title="No documents uploaded"
      description="Store and organize all your property-related documents securely. Upload leases, contracts, receipts, and more."
      action={
        onUploadDocument
          ? {
              label: "Upload a Document",
              onClick: onUploadDocument,
            }
          : undefined
      }
      iconClassName="bg-indigo-50 dark:bg-indigo-950/30"
    />
  )
}
