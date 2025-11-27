"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  onConfirm: () => void | Promise<void>
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
}: ConfirmationDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleConfirm = async () => {
    try {
      setIsLoading(true)
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error("Confirmation action failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (!isLoading) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!isLoading}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export interface UseConfirmationDialogReturn {
  confirmDialog: React.ReactElement
  confirm: (props: Omit<ConfirmationDialogProps, "open" | "onOpenChange">) => Promise<boolean>
}

export function useConfirmationDialog(): UseConfirmationDialogReturn {
  const [dialogProps, setDialogProps] = React.useState<
    Omit<ConfirmationDialogProps, "open" | "onOpenChange"> | null
  >(null)
  const [isOpen, setIsOpen] = React.useState(false)
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null)

  const confirm = React.useCallback(
    (props: Omit<ConfirmationDialogProps, "open" | "onOpenChange">) => {
      return new Promise<boolean>((resolve) => {
        resolveRef.current = resolve
        setDialogProps(props)
        setIsOpen(true)
      })
    },
    []
  )

  const handleOpenChange = React.useCallback((open: boolean) => {
    setIsOpen(open)
    if (!open && resolveRef.current) {
      resolveRef.current(false)
      resolveRef.current = null
    }
  }, [])

  const handleConfirm = React.useCallback(async () => {
    if (dialogProps?.onConfirm) {
      await dialogProps.onConfirm()
    }
    if (resolveRef.current) {
      resolveRef.current(true)
      resolveRef.current = null
    }
    setIsOpen(false)
  }, [dialogProps])

  const confirmDialog = dialogProps ? (
    <ConfirmationDialog
      {...dialogProps}
      open={isOpen}
      onOpenChange={handleOpenChange}
      onConfirm={handleConfirm}
    />
  ) : null

  return {
    confirmDialog: confirmDialog as React.ReactElement,
    confirm,
  }
}
