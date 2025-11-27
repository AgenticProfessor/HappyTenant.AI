"use client"

import * as React from "react"
import {
  FileTextIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileIcon,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface DocumentViewerDocument {
  name: string
  url: string
  type: string
  size: number
}

export interface DocumentViewerProps {
  document: DocumentViewerDocument
  onDownload?: () => void
  className?: string
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) {
    return ImageIcon
  }
  if (type === "application/pdf" || type.includes("pdf")) {
    return FileTextIcon
  }
  return FileIcon
}

function getFileTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    "application/pdf": "PDF Document",
    "image/jpeg": "JPEG Image",
    "image/jpg": "JPG Image",
    "image/png": "PNG Image",
    "image/gif": "GIF Image",
    "image/webp": "WebP Image",
    "application/msword": "Word Document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "Word Document",
    "application/vnd.ms-excel": "Excel Spreadsheet",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "Excel Spreadsheet",
    "text/plain": "Text File",
    "text/csv": "CSV File",
  }

  return typeMap[type] || type
}

function DocumentViewer({
  document,
  onDownload,
  className,
}: DocumentViewerProps) {
  const [imageError, setImageError] = React.useState(false)
  const FileIconComponent = getFileIcon(document.type)
  const isImage = document.type.startsWith("image/")
  const isPDF = document.type === "application/pdf" || document.type.includes("pdf")

  const handleDownload = () => {
    if (onDownload) {
      onDownload()
    } else {
      // Default download behavior
      const link = window.document.createElement("a")
      link.href = document.url
      link.download = document.name
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
    }
  }

  const handleOpenInNewTab = () => {
    window.open(document.url, "_blank", "noopener,noreferrer")
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="rounded-lg bg-muted p-2.5 shrink-0">
              <FileIconComponent className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">
                {document.name}
              </CardTitle>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{getFileTypeLabel(document.type)}</span>
                <span>•</span>
                <span>{formatFileSize(document.size)}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDownload}
              title="Download"
            >
              <DownloadIcon className="size-4" />
              <span className="sr-only">Download</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleOpenInNewTab}
              title="Open in new tab"
            >
              <ExternalLinkIcon className="size-4" />
              <span className="sr-only">Open in new tab</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Image Preview */}
        {isImage && !imageError ? (
          <div className="relative bg-muted">
            <img
              src={document.url}
              alt={document.name}
              className="w-full h-auto max-h-96 object-contain"
              onError={() => setImageError(true)}
            />
          </div>
        ) : isPDF ? (
          /* PDF Placeholder */
          <div className="bg-muted p-8 flex flex-col items-center justify-center gap-4">
            <div className="rounded-full bg-background p-6">
              <FileTextIcon className="size-12 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-medium">PDF Document</p>
              <p className="text-sm text-muted-foreground">
                Click &quot;Open&quot; to view this document
              </p>
            </div>
            <Button onClick={handleOpenInNewTab} className="mt-2">
              <ExternalLinkIcon className="size-4" />
              Open PDF
            </Button>
          </div>
        ) : (
          /* Generic File Placeholder */
          <div className="bg-muted p-8 flex flex-col items-center justify-center gap-4">
            <div className="rounded-full bg-background p-6">
              <FileIconComponent className="size-12 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-medium">{getFileTypeLabel(document.type)}</p>
              <p className="text-sm text-muted-foreground">
                Preview not available for this file type
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              <Button onClick={handleOpenInNewTab} variant="outline">
                <ExternalLinkIcon className="size-4" />
                Open
              </Button>
              <Button onClick={handleDownload}>
                <DownloadIcon className="size-4" />
                Download
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { DocumentViewer }
