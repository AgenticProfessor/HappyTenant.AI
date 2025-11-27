"use client"

import { CreditCard } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

export interface EmptyPaymentsProps {
  onRecordPayment?: () => void
}

export function EmptyPayments({ onRecordPayment }: EmptyPaymentsProps) {
  return (
    <EmptyState
      icon={CreditCard}
      title="No payments recorded"
      description="Keep track of all rental payments in one place. Record payments, monitor payment history, and stay on top of your cash flow."
      action={
        onRecordPayment
          ? {
              label: "Record a Payment",
              onClick: onRecordPayment,
            }
          : undefined
      }
      iconClassName="bg-green-50 dark:bg-green-950/30"
    />
  )
}
