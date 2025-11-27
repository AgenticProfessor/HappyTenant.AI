"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  AlertCircle,
  CheckCircle2,
  Info,
  XCircle,
  X,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const alertBannerVariants = cva(
  "relative w-full border px-4 py-3 text-sm [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-3.5 [&>svg~*]:pl-8",
  {
    variants: {
      variant: {
        info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-200 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
        warning:
          "bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950/30 dark:border-yellow-900 dark:text-yellow-200 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400",
        error:
          "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/30 dark:border-red-900 dark:text-red-200 [&>svg]:text-red-600 dark:[&>svg]:text-red-400",
        success:
          "bg-green-50 border-green-200 text-green-900 dark:bg-green-950/30 dark:border-green-900 dark:text-green-200 [&>svg]:text-green-600 dark:[&>svg]:text-green-400",
      },
      mode: {
        fullWidth: "rounded-none",
        contained: "rounded-lg",
      },
    },
    defaultVariants: {
      variant: "info",
      mode: "contained",
    },
  }
)

const variantIcons: Record<string, LucideIcon> = {
  info: Info,
  warning: AlertCircle,
  error: XCircle,
  success: CheckCircle2,
}

export interface AlertBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertBannerVariants> {
  dismissible?: boolean
  onDismiss?: () => void
  icon?: LucideIcon
}

export function AlertBanner({
  className,
  variant = "info",
  mode = "contained",
  dismissible = false,
  onDismiss,
  icon,
  children,
  ...props
}: AlertBannerProps) {
  const [isDismissed, setIsDismissed] = React.useState(false)

  const Icon = icon || variantIcons[variant || "info"]

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  if (isDismissed) {
    return null
  }

  return (
    <div
      role="alert"
      className={cn(alertBannerVariants({ variant, mode }), className)}
      {...props}
    >
      <Icon className="h-4 w-4" />
      <div className={cn("flex-1", dismissible && "pr-8")}>{children}</div>
      {dismissible && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-2 h-6 w-6 rounded-sm opacity-70 hover:opacity-100"
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

export interface AlertBannerTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export function AlertBannerTitle({
  className,
  ...props
}: AlertBannerTitleProps) {
  return (
    <h5
      className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
}

export interface AlertBannerDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export function AlertBannerDescription({
  className,
  ...props
}: AlertBannerDescriptionProps) {
  return (
    <div
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
}
