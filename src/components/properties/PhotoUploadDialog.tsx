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
import { ImageUpload, type ImageFile } from "@/components/ui/image-upload"
import { toast } from "sonner"

export interface PhotoUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (photos: ImageFile[]) => Promise<void> | void
  propertyName?: string
  maxPhotos?: number
  existingPhotos?: ImageFile[]
}

function PhotoUploadDialog({
  open,
  onOpenChange,
  onSave,
  propertyName,
  maxPhotos = 20,
  existingPhotos = [],
}: PhotoUploadDialogProps) {
  const [photos, setPhotos] = React.useState<ImageFile[]>(existingPhotos)
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setPhotos(existingPhotos)
    }
  }, [open, existingPhotos])

  const handleSave = async () => {
    if (photos.length === 0) {
      toast.error("Please upload at least one photo")
      return
    }

    // Check if at least one photo is marked as primary
    const hasPrimary = photos.some((photo) => photo.isPrimary)
    if (!hasPrimary && photos.length > 0) {
      toast.error("Please select a primary photo")
      return
    }

    setIsSaving(true)
    try {
      await onSave(photos)
      toast.success(
        `${photos.length} photo${photos.length === 1 ? "" : "s"} uploaded successfully`
      )
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving photos:", error)
      toast.error("Failed to save photos. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Cleanup object URLs
    photos.forEach((photo) => {
      if (photo.preview && !existingPhotos.find((p) => p.preview === photo.preview)) {
        URL.revokeObjectURL(photo.preview)
      }
    })
    setPhotos(existingPhotos)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingPhotos.length > 0 ? "Edit" : "Upload"} Property Photos
          </DialogTitle>
          <DialogDescription>
            {propertyName
              ? `Add photos for ${propertyName}`
              : "Add photos to showcase this property"}
            {maxPhotos && ` (Maximum ${maxPhotos} photos)`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ImageUpload
            onImagesSelected={setPhotos}
            value={photos}
            maxFiles={maxPhotos}
            multiple={true}
            showCaptions={true}
            showPrimarySelection={true}
            maxSize={5 * 1024 * 1024} // 5MB
          />

          {photos.length === 0 && (
            <div className="mt-4 rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                Upload high-quality photos to attract potential tenants. The first photo will be used as the primary image.
              </p>
              <ul className="mt-2 text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Use landscape orientation for best results</li>
                <li>Ensure good lighting and clean spaces</li>
                <li>Include key features and rooms</li>
                <li>Add captions to describe each photo</li>
              </ul>
            </div>
          )}

          {photos.length > 0 && (
            <div className="mt-4 rounded-lg bg-muted/50 p-4">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">Tips:</p>
                  <ul className="mt-1 text-sm text-muted-foreground space-y-1">
                    <li>• Drag photos to reorder them</li>
                    <li>• Click the star to set the primary photo</li>
                    <li>• Add captions to describe each photo</li>
                  </ul>
                </div>
                <div className="text-sm text-muted-foreground">
                  {photos.length} / {maxPhotos} photos
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || photos.length === 0}
          >
            {isSaving
              ? "Saving..."
              : photos.length === 0
                ? "Upload Photos"
                : `Save ${photos.length} Photo${photos.length === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { PhotoUploadDialog }
