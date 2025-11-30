'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, type LucideIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * FormDialog - A reusable, beautifully animated dialog wrapper for forms
 *
 * Features:
 * - Smooth enter/exit animations with staggered children
 * - Consistent header with icon support
 * - Loading states with elegant spinner
 * - Responsive sizing with mobile-first design
 * - Keyboard accessible (Escape to close)
 * - Focus trap for accessibility
 */

export interface FormDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Optional description shown below title */
  description?: string;
  /** Optional icon shown next to title */
  icon?: LucideIcon;
  /** Dialog content (form, etc.) */
  children: React.ReactNode;
  /** Whether to show the footer with action buttons */
  showFooter?: boolean;
  /** Loading state - disables buttons and shows spinner */
  isLoading?: boolean;
  /** Submit handler for primary action */
  onSubmit?: () => void | Promise<void>;
  /** Primary button label */
  submitLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Whether to disable the submit button */
  submitDisabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
  /** Additional class names for dialog content */
  className?: string;
  /** Whether to show close button in header */
  showCloseButton?: boolean;
  /** Variant style for the submit button */
  submitVariant?: 'default' | 'destructive';
}

const sizeClasses = {
  sm: 'sm:max-w-[400px]',
  default: 'sm:max-w-[500px]',
  lg: 'sm:max-w-[700px]',
  xl: 'sm:max-w-[900px]',
  full: 'sm:max-w-[95vw] max-h-[90vh]',
};

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  children,
  showFooter = true,
  isLoading = false,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  submitDisabled = false,
  size = 'default',
  className,
  showCloseButton = true,
  submitVariant = 'default',
}: FormDialogProps) {
  const handleSubmit = async () => {
    if (onSubmit) {
      await onSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey && onSubmit && !isLoading && !submitDisabled) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          sizeClasses[size],
          'overflow-hidden p-0',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          className
        )}
        onKeyDown={handleKeyDown}
      >
        {/* Header with gradient accent */}
        <div className="relative">
          {/* Subtle gradient accent line */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

          <DialogHeader className="px-6 pt-6 pb-4">
            <div className="flex items-start justify-between gap-4">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                {Icon && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="space-y-1">
                  <DialogTitle className="text-lg font-semibold tracking-tight">
                    {title}
                  </DialogTitle>
                  {description && (
                    <DialogDescription className="text-sm text-muted-foreground">
                      {description}
                    </DialogDescription>
                  )}
                </div>
              </motion.div>

              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 rounded-lg opacity-70 hover:opacity-100 transition-opacity"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              )}
            </div>
          </DialogHeader>
        </div>

        {/* Content with scroll area */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className={cn(
            'px-6 pb-6',
            size === 'full' && 'overflow-y-auto max-h-[calc(90vh-200px)]'
          )}
        >
          {children}
        </motion.div>

        {/* Footer with actions */}
        {showFooter && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="flex items-center justify-end gap-3 border-t bg-muted/30 px-6 py-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {cancelLabel}
            </Button>
            {onSubmit && (
              <Button
                type="button"
                variant={submitVariant}
                onClick={handleSubmit}
                disabled={isLoading || submitDisabled}
                className="min-w-[100px] relative"
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {submitLabel}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            )}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * FormDialogSection - A section wrapper for organizing form content
 */
export interface FormDialogSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormDialogSection({
  title,
  description,
  children,
  className,
}: FormDialogSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h4 className="text-sm font-medium text-foreground">{title}</h4>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * FormDialogRow - A responsive row layout for form fields
 */
export interface FormDialogRowProps {
  children: React.ReactNode;
  className?: string;
}

export function FormDialogRow({ children, className }: FormDialogRowProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
      {children}
    </div>
  );
}

/**
 * FormDialogDivider - A visual separator for form sections
 */
export function FormDialogDivider() {
  return <div className="my-6 h-px bg-border" />;
}
