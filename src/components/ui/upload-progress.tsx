"use client"

import * as React from "react"
import { CheckCircle2Icon, XCircleIcon, XIcon, RotateCcwIcon, FileIcon } from "lucide-react"
import { Progress } from "./progress"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export interface UploadProgressProps {
  fileName: string
  progress: number // 0-100
  status: "uploading" | "success" | "error"
  error?: string
  onCancel?: () => void
  onRetry?: () => void
  className?: string
  fileSize?: number
  uploadedSize?: number
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

function UploadProgress({
  fileName,
  progress,
  status,
  error,
  onCancel,
  onRetry,
  className,
  fileSize,
  uploadedSize,
}: UploadProgressProps) {
  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-600 dark:text-green-400"
      case "error":
        return "text-destructive"
      case "uploading":
      default:
        return "text-primary"
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle2Icon className="size-5 text-green-600 dark:text-green-400" />
      case "error":
        return <XCircleIcon className="size-5 text-destructive" />
      case "uploading":
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "success":
        return "Upload complete"
      case "error":
        return error || "Upload failed"
      case "uploading":
        if (fileSize && uploadedSize !== undefined) {
          return `${formatFileSize(uploadedSize)} / ${formatFileSize(fileSize)}`
        }
        return `${progress}%`
      default:
        return ""
    }
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 shadow-sm transition-all",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* File Icon */}
        <div className="flex size-10 shrink-0 items-center justify-center rounded bg-muted">
          {status === "success" || status === "error" ? (
            getStatusIcon()
          ) : (
            <FileIcon className="size-5 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* File Name and Actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileName}</p>
              <p className={cn("text-xs", getStatusColor())}>
                {getStatusText()}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex shrink-0 gap-1">
              {status === "uploading" && onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={onCancel}
                  title="Cancel upload"
                >
                  <XIcon className="size-4" />
                </Button>
              )}
              {status === "error" && onRetry && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={onRetry}
                  title="Retry upload"
                >
                  <RotateCcwIcon className="size-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {status === "uploading" && (
            <Progress
              value={progress}
              className="h-1.5"
            />
          )}

          {/* Error Message */}
          {status === "error" && error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export interface MultipleUploadProgressProps {
  uploads: Array<{
    id: string
    fileName: string
    progress: number
    status: "uploading" | "success" | "error"
    error?: string
    fileSize?: number
    uploadedSize?: number
  }>
  onCancel?: (id: string) => void
  onRetry?: (id: string) => void
  onClearCompleted?: () => void
  className?: string
}

function MultipleUploadProgress({
  uploads,
  onCancel,
  onRetry,
  onClearCompleted,
  className,
}: MultipleUploadProgressProps) {
  const completedCount = uploads.filter(
    (u) => u.status === "success" || u.status === "error"
  ).length
  const totalCount = uploads.length

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            Uploading Files ({completedCount}/{totalCount})
          </p>
        </div>
        {completedCount > 0 && onClearCompleted && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearCompleted}
          >
            Clear Completed
          </Button>
        )}
      </div>

      {/* Upload Items */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {uploads.map((upload) => (
          <UploadProgress
            key={upload.id}
            fileName={upload.fileName}
            progress={upload.progress}
            status={upload.status}
            error={upload.error}
            fileSize={upload.fileSize}
            uploadedSize={upload.uploadedSize}
            onCancel={onCancel ? () => onCancel(upload.id) : undefined}
            onRetry={onRetry ? () => onRetry(upload.id) : undefined}
          />
        ))}
      </div>
    </div>
  )
}

export { UploadProgress, MultipleUploadProgress, formatFileSize }
