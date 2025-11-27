"use client"

import * as React from "react"
import { GripVerticalIcon, StarIcon, XIcon, ImageIcon } from "lucide-react"
import { FileUpload } from "./file-upload"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export interface ImageFile {
  file: File
  preview: string
  isPrimary?: boolean
  caption?: string
}

export interface ImageUploadProps {
  onImagesSelected: (images: ImageFile[]) => void
  maxSize?: number
  maxFiles?: number
  multiple?: boolean
  disabled?: boolean
  className?: string
  value?: ImageFile[]
  showCaptions?: boolean
  showPrimarySelection?: boolean
}

function ImageUpload({
  onImagesSelected,
  maxSize = 5 * 1024 * 1024, // 5MB default for images
  maxFiles = 10,
  multiple = true,
  disabled = false,
  className,
  value = [],
  showCaptions = false,
  showPrimarySelection = false,
}: ImageUploadProps) {
  const [images, setImages] = React.useState<ImageFile[]>(value)
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)

  React.useEffect(() => {
    setImages(value)
  }, [value])

  const handleFilesSelected = (files: File[]) => {
    const imageFiles: ImageFile[] = files.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      isPrimary: images.length === 0 && index === 0, // First image is primary by default
      caption: "",
    }))

    const newImages = multiple ? [...images, ...imageFiles] : imageFiles
    setImages(newImages)
    onImagesSelected(newImages)
  }

  const removeImage = (index: number) => {
    const removedImage = images[index]
    const newImages = images.filter((_, i) => i !== index)

    // Revoke object URL to free memory
    if (removedImage) {
      URL.revokeObjectURL(removedImage.preview)
    }

    // If removed image was primary, make the first remaining image primary
    if (removedImage?.isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true
    }

    setImages(newImages)
    onImagesSelected(newImages)
  }

  const setPrimaryImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }))
    setImages(newImages)
    onImagesSelected(newImages)
    toast.success("Primary image updated")
  }

  const updateCaption = (index: number, caption: string) => {
    const newImages = [...images]
    newImages[index] = { ...newImages[index], caption }
    setImages(newImages)
    onImagesSelected(newImages)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedImage)

    setImages(newImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    onImagesSelected(images)
  }

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      images.forEach((image) => {
        URL.revokeObjectURL(image.preview)
      })
    }
  }, [])

  return (
    <div className={cn("space-y-4", className)}>
      <FileUpload
        onFilesSelected={handleFilesSelected}
        accept="image/*"
        maxSize={maxSize}
        maxFiles={maxFiles}
        multiple={multiple}
        disabled={disabled}
        value={images.map((img) => img.file)}
      />

      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Uploaded Images ({images.length})
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <div
                key={`${image.file.name}-${index}`}
                draggable={multiple && !disabled}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "group relative rounded-lg border bg-card overflow-hidden transition-shadow",
                  multiple && "cursor-move",
                  draggedIndex === index && "opacity-50",
                  image.isPrimary && "ring-2 ring-primary"
                )}
              >
                {/* Image Preview */}
                <div className="relative aspect-video bg-muted">
                  <img
                    src={image.preview}
                    alt={image.caption || image.file.name}
                    className="size-full object-cover"
                  />

                  {/* Overlay with controls */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {showPrimarySelection && (
                      <Button
                        type="button"
                        size="icon-sm"
                        variant={image.isPrimary ? "default" : "secondary"}
                        onClick={() => setPrimaryImage(index)}
                        disabled={disabled}
                        title={image.isPrimary ? "Primary image" : "Set as primary"}
                      >
                        <StarIcon
                          className={cn(
                            "size-4",
                            image.isPrimary && "fill-current"
                          )}
                        />
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="destructive"
                      onClick={() => removeImage(index)}
                      disabled={disabled}
                      title="Remove image"
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </div>

                  {/* Drag handle */}
                  {multiple && (
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="rounded bg-black/50 p-1">
                        <GripVerticalIcon className="size-4 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Primary badge */}
                  {image.isPrimary && (
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                        <StarIcon className="size-3 fill-current" />
                        Primary
                      </div>
                    </div>
                  )}
                </div>

                {/* Caption input */}
                {showCaptions && (
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Add a caption..."
                      value={image.caption || ""}
                      onChange={(e) => updateCaption(index, e.target.value)}
                      disabled={disabled}
                      className="w-full bg-transparent border-none text-xs focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
                    />
                  </div>
                )}

                {/* File name */}
                {!showCaptions && (
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground truncate">
                      {image.file.name}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {showPrimarySelection && images.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Drag images to reorder. Click the star icon to set the primary image.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export { ImageUpload }
