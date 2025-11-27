"use client"

import * as React from "react"
import { useDropzone } from "react-dropzone"
import { UploadIcon, XIcon, FileIcon, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { toast } from "sonner"

export interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
  maxSize?: number // in bytes
  maxFiles?: number
  multiple?: boolean
  disabled?: boolean
  className?: string
  value?: File[]
  onRemove?: (index: number) => void
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

function FileUpload({
  onFilesSelected,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  multiple = false,
  disabled = false,
  className,
  value = [],
  onRemove,
}: FileUploadProps) {
  const [files, setFiles] = React.useState<File[]>(value)
  const [previews, setPreviews] = React.useState<{ [key: string]: string }>({})

  React.useEffect(() => {
    setFiles(value)
  }, [value])

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File ${file.name} is too large. Maximum size is ${formatFileSize(maxSize)}.`
    }

    if (accept) {
      const acceptedTypes = accept.split(",").map((type) => type.trim())
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`
      const mimeType = file.type

      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          return fileExtension === type.toLowerCase()
        }
        if (type.endsWith("/*")) {
          const baseType = type.split("/")[0]
          return mimeType.startsWith(baseType + "/")
        }
        return mimeType === type
      })

      if (!isAccepted) {
        return `File ${file.name} is not an accepted file type. Accepted types: ${accept}`
      }
    }

    return null
  }

  const generatePreview = (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews((prev) => ({
          ...prev,
          [file.name]: reader.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = multiple ? [...files, ...acceptedFiles] : acceptedFiles

      // Validate files
      const errors: string[] = []
      const validFiles: File[] = []

      newFiles.forEach((file) => {
        const error = validateFile(file)
        if (error) {
          errors.push(error)
        } else {
          validFiles.push(file)
        }
      })

      // Check max files limit
      if (maxFiles && validFiles.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} file(s) allowed`)
        validFiles.splice(maxFiles)
      }

      // Show errors
      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error))
      }

      // Update files
      if (validFiles.length > 0) {
        setFiles(validFiles)
        validFiles.forEach(generatePreview)
        onFilesSelected(validFiles)
      }
    },
    [files, multiple, maxFiles, onFilesSelected, maxSize, accept]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: accept
        ? accept.split(",").reduce(
            (acc, curr) => {
              const trimmed = curr.trim()
              if (trimmed.startsWith(".")) {
                // File extension
                if (!acc["application/octet-stream"]) {
                  acc["application/octet-stream"] = []
                }
                acc["application/octet-stream"].push(trimmed)
              } else if (trimmed.includes("/")) {
                // MIME type
                const [type] = trimmed.split("/")
                if (!acc[trimmed]) {
                  acc[trimmed] = []
                }
              }
              return acc
            },
            {} as Record<string, string[]>
          )
        : undefined,
      disabled,
      multiple,
      maxSize,
    })

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFilesSelected(newFiles)

    if (onRemove) {
      onRemove(index)
    }

    // Remove preview
    const removedFile = files[index]
    if (removedFile && previews[removedFile.name]) {
      setPreviews((prev) => {
        const newPreviews = { ...prev }
        delete newPreviews[removedFile.name]
        return newPreviews
      })
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          isDragActive && !isDragReject && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
          !isDragActive && !isDragReject && "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-muted p-3">
            <UploadIcon className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragActive
                ? isDragReject
                  ? "File type not accepted"
                  : "Drop files here"
                : "Drag and drop files here, or click to select"}
            </p>
            <p className="text-xs text-muted-foreground">
              {accept && `Accepted formats: ${accept}`}
              {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
              {maxFiles && ` • Max files: ${maxFiles}`}
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Selected Files ({files.length})
          </p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                {previews[file.name] ? (
                  <img
                    src={previews[file.name]}
                    alt={file.name}
                    className="size-12 rounded object-cover"
                  />
                ) : file.type.startsWith("image/") ? (
                  <div className="flex size-12 items-center justify-center rounded bg-muted">
                    <ImageIcon className="size-6 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex size-12 items-center justify-center rounded bg-muted">
                    <FileIcon className="size-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                >
                  <XIcon className="size-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { FileUpload, formatFileSize }
