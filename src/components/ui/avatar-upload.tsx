"use client"

import * as React from "react"
import { CameraIcon, XIcon, UserIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export interface AvatarUploadProps {
  onImageSelected: (file: File | null) => void
  currentImage?: string
  userName?: string
  maxSize?: number
  disabled?: boolean
  className?: string
}

function AvatarUpload({
  onImageSelected,
  currentImage,
  userName,
  maxSize = 2 * 1024 * 1024, // 2MB default
  disabled = false,
  className,
}: AvatarUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(currentImage || null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setPreview(currentImage || null)
  }, [currentImage])

  const getInitials = (name?: string): string => {
    if (!name) return "?"
    const parts = name.trim().split(" ")
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase()
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return false
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      toast.error(`Image must be less than ${maxSizeMB}MB`)
      return false
    }

    return true
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!validateFile(file)) {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
      onImageSelected(file)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setPreview(null)
    onImageSelected(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    toast.success("Avatar removed")
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024)
    return mb < 1 ? `${Math.round(mb * 1024)}KB` : `${mb.toFixed(1)}MB`
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Avatar Display */}
      <div className="relative">
        <Avatar className="size-24 sm:size-32">
          {preview ? (
            <AvatarImage src={preview} alt={userName || "User avatar"} />
          ) : (
            <AvatarFallback className="text-2xl sm:text-3xl">
              {userName ? getInitials(userName) : <UserIcon className="size-12" />}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Upload Button Overlay */}
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className={cn(
            "absolute inset-0 rounded-full bg-black/60 opacity-0 hover:opacity-100 transition-opacity",
            "flex items-center justify-center",
            disabled && "cursor-not-allowed opacity-50"
          )}
          title="Change avatar"
        >
          <CameraIcon className="size-8 text-white" />
        </button>

        {/* Remove Button */}
        {preview && !disabled && (
          <Button
            type="button"
            size="icon-sm"
            variant="destructive"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 rounded-full shadow-lg"
            title="Remove avatar"
          >
            <XIcon className="size-4" />
          </Button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled}
        className="hidden"
        aria-label="Upload avatar image"
      />

      {/* Upload Button and Info */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={disabled}
          >
            <CameraIcon className="size-4" />
            {preview ? "Change Avatar" : "Upload Avatar"}
          </Button>
          {preview && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
            >
              Remove
            </Button>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Recommended: Square image, at least 200x200px
          </p>
          <p className="text-xs text-muted-foreground">
            Max file size: {formatFileSize(maxSize)}
          </p>
        </div>
      </div>
    </div>
  )
}

export { AvatarUpload }
