"use client"

/**
 * Upload Components Demo
 *
 * This file demonstrates how to use all the file upload and media components.
 * This is for reference only and not meant to be used in production.
 */

import * as React from "react"
import { FileUpload } from "@/components/ui/file-upload"
import { ImageUpload, type ImageFile } from "@/components/ui/image-upload"
import { AvatarUpload } from "@/components/ui/avatar-upload"
import { UploadProgress, MultipleUploadProgress } from "@/components/ui/upload-progress"
import { ImageGallery } from "@/components/properties/ImageGallery"
import { DocumentViewer } from "@/components/documents/DocumentViewer"
import { PhotoUploadDialog } from "@/components/properties/PhotoUploadDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function UploadComponentsDemo() {
  // File Upload State
  const [files, setFiles] = React.useState<File[]>([])

  // Image Upload State
  const [images, setImages] = React.useState<ImageFile[]>([])

  // Avatar Upload State
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null)

  // Upload Progress State
  const [uploadProgress, setUploadProgress] = React.useState({
    fileName: "document.pdf",
    progress: 65,
    status: "uploading" as const,
  })

  // Multiple Upload Progress State
  const [multipleUploads, setMultipleUploads] = React.useState([
    { id: "1", fileName: "report.pdf", progress: 100, status: "success" as const },
    { id: "2", fileName: "presentation.pptx", progress: 45, status: "uploading" as const, fileSize: 5242880, uploadedSize: 2359296 },
    { id: "3", fileName: "spreadsheet.xlsx", progress: 0, status: "error" as const, error: "Upload failed. Please try again." },
  ])

  // Image Gallery State
  const galleryImages = [
    { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", alt: "Living room", caption: "Spacious living room" },
    { url: "https://images.unsplash.com/photo-1556912167-f556f1f39faa?w=800", alt: "Kitchen", caption: "Modern kitchen" },
    { url: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800", alt: "Bedroom", caption: "Master bedroom" },
    { url: "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800", alt: "Bathroom", caption: "Updated bathroom" },
  ]

  // Document Viewer State
  const sampleDocument = {
    name: "lease-agreement.pdf",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    type: "application/pdf",
    size: 13264,
  }

  // Photo Upload Dialog State
  const [photoDialogOpen, setPhotoDialogOpen] = React.useState(false)

  // Handlers
  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles)
    console.log("Files selected:", selectedFiles)
  }

  const handleImagesSelected = (selectedImages: ImageFile[]) => {
    setImages(selectedImages)
    console.log("Images selected:", selectedImages)
  }

  const handleAvatarSelected = (file: File | null) => {
    setAvatarFile(file)
    console.log("Avatar selected:", file)
  }

  const handlePhotosSave = async (photos: ImageFile[]) => {
    console.log("Saving photos:", photos)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const handleCancelUpload = (id: string) => {
    console.log("Cancelling upload:", id)
  }

  const handleRetryUpload = (id: string) => {
    console.log("Retrying upload:", id)
  }

  const handleClearCompleted = () => {
    setMultipleUploads(prev => prev.filter(u => u.status === "uploading"))
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Upload Components Demo</h1>
        <p className="text-muted-foreground">
          This page demonstrates all the file upload and media components available in the Happy Tenant application.
        </p>
      </div>

      <Tabs defaultValue="file-upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="file-upload">File Upload</TabsTrigger>
          <TabsTrigger value="image-upload">Image Upload</TabsTrigger>
          <TabsTrigger value="avatar-upload">Avatar</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="document">Document</TabsTrigger>
          <TabsTrigger value="dialog">Dialog</TabsTrigger>
        </TabsList>

        {/* File Upload */}
        <TabsContent value="file-upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>File Upload Component</CardTitle>
              <CardDescription>
                Upload files with drag and drop support, validation, and previews.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFilesSelected={handleFilesSelected}
                accept="image/*,.pdf,.doc,.docx"
                maxSize={10 * 1024 * 1024}
                maxFiles={5}
                multiple={true}
                value={files}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Image Upload */}
        <TabsContent value="image-upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Image Upload Component</CardTitle>
              <CardDescription>
                Upload images with drag to reorder, primary selection, and captions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                onImagesSelected={handleImagesSelected}
                value={images}
                maxFiles={10}
                showCaptions={true}
                showPrimarySelection={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Avatar Upload */}
        <TabsContent value="avatar-upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Avatar Upload Component</CardTitle>
              <CardDescription>
                Upload a profile picture with circular preview and initials fallback.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <AvatarUpload
                onImageSelected={handleAvatarSelected}
                userName="John Doe"
                maxSize={2 * 1024 * 1024}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload Progress */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Progress Components</CardTitle>
              <CardDescription>
                Display upload progress with status indicators and controls.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Single Upload Progress</h3>
                <UploadProgress
                  fileName={uploadProgress.fileName}
                  progress={uploadProgress.progress}
                  status={uploadProgress.status}
                  onCancel={() => console.log("Cancel single upload")}
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Multiple Upload Progress</h3>
                <MultipleUploadProgress
                  uploads={multipleUploads}
                  onCancel={handleCancelUpload}
                  onRetry={handleRetryUpload}
                  onClearCompleted={handleClearCompleted}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Image Gallery */}
        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Image Gallery Component</CardTitle>
              <CardDescription>
                Display property photos with lightbox viewer and keyboard navigation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageGallery images={galleryImages} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Viewer */}
        <TabsContent value="document" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Viewer Component</CardTitle>
              <CardDescription>
                View and download documents with preview support for images and PDFs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentViewer
                document={sampleDocument}
                onDownload={() => console.log("Download document")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photo Upload Dialog */}
        <TabsContent value="dialog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Photo Upload Dialog Component</CardTitle>
              <CardDescription>
                Modal dialog for uploading property photos with validation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setPhotoDialogOpen(true)}>
                Open Photo Upload Dialog
              </Button>

              <PhotoUploadDialog
                open={photoDialogOpen}
                onOpenChange={setPhotoDialogOpen}
                onSave={handlePhotosSave}
                propertyName="123 Main Street"
                maxPhotos={20}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Component List */}
      <Card>
        <CardHeader>
          <CardTitle>Component Files</CardTitle>
          <CardDescription>All components are located in the following files:</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="font-mono text-xs">
              <code>/src/components/ui/file-upload.tsx</code> - General file upload
            </li>
            <li className="font-mono text-xs">
              <code>/src/components/ui/image-upload.tsx</code> - Image-specific upload
            </li>
            <li className="font-mono text-xs">
              <code>/src/components/ui/avatar-upload.tsx</code> - Avatar/profile picture
            </li>
            <li className="font-mono text-xs">
              <code>/src/components/ui/upload-progress.tsx</code> - Upload progress tracking
            </li>
            <li className="font-mono text-xs">
              <code>/src/components/properties/ImageGallery.tsx</code> - Property photo gallery
            </li>
            <li className="font-mono text-xs">
              <code>/src/components/documents/DocumentViewer.tsx</code> - Document viewer
            </li>
            <li className="font-mono text-xs">
              <code>/src/components/properties/PhotoUploadDialog.tsx</code> - Photo upload dialog
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
