"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface GalleryImage {
  url: string
  alt?: string
  caption?: string
}

export interface ImageGalleryProps {
  images: GalleryImage[]
  className?: string
}

function ImageGallery({ images, className }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = React.useState(false)
  const [currentIndex, setCurrentIndex] = React.useState(0)

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  // Keyboard navigation
  React.useEffect(() => {
    if (!lightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious()
      } else if (e.key === "ArrowRight") {
        goToNext()
      } else if (e.key === "Escape") {
        closeLightbox()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightboxOpen, images.length])

  if (images.length === 0) {
    return (
      <div className={cn("flex items-center justify-center min-h-[200px] bg-muted rounded-lg", className)}>
        <p className="text-muted-foreground">No images available</p>
      </div>
    )
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className={cn("grid gap-4", className)}>
        {images.length === 1 ? (
          // Single image - full width
          <div
            className="relative aspect-video overflow-hidden rounded-lg cursor-pointer group"
            onClick={() => openLightbox(0)}
          >
            <img
              src={images[0].url}
              alt={images[0].alt || "Property image"}
              className="size-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>
        ) : images.length === 2 ? (
          // Two images - side by side
          <div className="grid grid-cols-2 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-video overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image.url}
                  alt={image.alt || `Property image ${index + 1}`}
                  className="size-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            ))}
          </div>
        ) : (
          // Three or more images - grid layout
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.slice(0, 5).map((image, index) => (
              <div
                key={index}
                className={cn(
                  "relative aspect-video overflow-hidden rounded-lg cursor-pointer group",
                  index === 0 && images.length > 3 && "sm:col-span-2 lg:col-span-2"
                )}
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image.url}
                  alt={image.alt || `Property image ${index + 1}`}
                  className="size-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                {/* Show remaining count on last visible image */}
                {index === 4 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <p className="text-white text-2xl font-semibold">
                      +{images.length - 5} more
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-[95vw] w-full h-[95vh] p-0 bg-black/95 border-none"
          showCloseButton={false}
        >
          <div className="relative flex flex-col h-full">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
            >
              <XIcon className="size-5" />
              <span className="sr-only">Close</span>
            </Button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-50 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Main Image Container */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
              <img
                src={images[currentIndex].url}
                alt={images[currentIndex].alt || `Image ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon-lg"
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full"
                >
                  <ChevronLeftIcon className="size-8" />
                  <span className="sr-only">Previous image</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-lg"
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full"
                >
                  <ChevronRightIcon className="size-8" />
                  <span className="sr-only">Next image</span>
                </Button>
              </>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="bg-black/80 p-4 border-t border-white/10">
                <div className="flex gap-2 overflow-x-auto max-w-full pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={cn(
                        "shrink-0 w-20 h-16 rounded overflow-hidden border-2 transition-all",
                        index === currentIndex
                          ? "border-white scale-105"
                          : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img
                        src={image.url}
                        alt={image.alt || `Thumbnail ${index + 1}`}
                        className="size-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Caption */}
            {images[currentIndex].caption && (
              <div className="absolute bottom-24 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-white text-center text-sm">
                  {images[currentIndex].caption}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { ImageGallery }
