# Upload Components - Quick Start Guide

## Installation

The components are already installed and ready to use. The only external dependency is `react-dropzone`, which has been added to your project.

## Quick Import

You can import all upload components from a single location:

```tsx
import {
  FileUpload,
  ImageUpload,
  AvatarUpload,
  UploadProgress,
  MultipleUploadProgress,
  ImageGallery,
  PhotoUploadDialog,
  DocumentViewer,
  // Types
  type FileUploadProps,
  type ImageFile,
  type GalleryImage,
} from "@/components/ui/upload"
```

Or import individually:

```tsx
import { FileUpload } from "@/components/ui/file-upload"
import { ImageUpload } from "@/components/ui/image-upload"
import { AvatarUpload } from "@/components/ui/avatar-upload"
```

## Quick Examples

### 1. Simple File Upload

```tsx
import { FileUpload } from "@/components/ui/upload"

function MyPage() {
  return (
    <FileUpload
      onFilesSelected={(files) => {
        console.log("Files:", files)
      }}
      accept="image/*,.pdf"
      maxSize={10 * 1024 * 1024} // 10MB
      multiple
    />
  )
}
```

### 2. Image Upload with Preview

```tsx
import { ImageUpload, type ImageFile } from "@/components/ui/upload"
import { useState } from "react"

function PropertyPhotos() {
  const [images, setImages] = useState<ImageFile[]>([])

  return (
    <ImageUpload
      onImagesSelected={setImages}
      value={images}
      showCaptions
      showPrimarySelection
    />
  )
}
```

### 3. Avatar Upload

```tsx
import { AvatarUpload } from "@/components/ui/upload"

function UserProfile() {
  return (
    <AvatarUpload
      onImageSelected={(file) => {
        if (file) console.log("New avatar:", file)
      }}
      userName="John Doe"
      currentImage="/avatars/john.jpg"
    />
  )
}
```

### 4. Upload Progress

```tsx
import { UploadProgress } from "@/components/ui/upload"

function Uploader() {
  return (
    <UploadProgress
      fileName="document.pdf"
      progress={65}
      status="uploading"
      onCancel={() => console.log("Cancelled")}
    />
  )
}
```

### 5. Image Gallery

```tsx
import { ImageGallery } from "@/components/ui/upload"

function PropertyPage() {
  const images = [
    { url: "/img1.jpg", alt: "Living room" },
    { url: "/img2.jpg", alt: "Kitchen" },
  ]

  return <ImageGallery images={images} />
}
```

### 6. Document Viewer

```tsx
import { DocumentViewer } from "@/components/ui/upload"

function DocumentPage() {
  const doc = {
    name: "lease.pdf",
    url: "/docs/lease.pdf",
    type: "application/pdf",
    size: 1024000,
  }

  return <DocumentViewer document={doc} />
}
```

### 7. Photo Upload Dialog

```tsx
import { PhotoUploadDialog } from "@/components/ui/upload"
import { useState } from "react"

function PropertyManager() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Upload Photos</button>
      <PhotoUploadDialog
        open={open}
        onOpenChange={setOpen}
        onSave={async (photos) => {
          console.log("Saving:", photos)
        }}
        propertyName="123 Main St"
      />
    </>
  )
}
```

## Common Props

### File Upload
- `onFilesSelected: (files: File[]) => void` - **Required**
- `accept?: string` - File types (e.g., "image/*,.pdf")
- `maxSize?: number` - Max file size in bytes
- `maxFiles?: number` - Max number of files
- `multiple?: boolean` - Allow multiple files

### Image Upload
- `onImagesSelected: (images: ImageFile[]) => void` - **Required**
- `value?: ImageFile[]` - Controlled value
- `showCaptions?: boolean` - Show caption inputs
- `showPrimarySelection?: boolean` - Allow primary selection
- `maxFiles?: number` - Max images (default: 10)

### Avatar Upload
- `onImageSelected: (file: File | null) => void` - **Required**
- `currentImage?: string` - Current avatar URL
- `userName?: string` - For initials fallback
- `maxSize?: number` - Max size (default: 2MB)

### Upload Progress
- `fileName: string` - **Required**
- `progress: number` - 0-100
- `status: "uploading" | "success" | "error"` - **Required**
- `onCancel?: () => void` - Cancel callback
- `onRetry?: () => void` - Retry callback

### Image Gallery
- `images: GalleryImage[]` - **Required**
  - Each image: `{ url: string; alt?: string; caption?: string }`

### Document Viewer
- `document: DocumentViewerDocument` - **Required**
  - `{ name: string; url: string; type: string; size: number }`
- `onDownload?: () => void` - Custom download handler

### Photo Upload Dialog
- `open: boolean` - **Required**
- `onOpenChange: (open: boolean) => void` - **Required**
- `onSave: (photos: ImageFile[]) => Promise<void>` - **Required**
- `propertyName?: string` - Display name
- `maxPhotos?: number` - Max photos (default: 20)

## Backend Integration Example

```tsx
async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  return response.json()
}

// With progress tracking
async function uploadWithProgress(
  file: File,
  onProgress: (progress: number) => void
) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100
        onProgress(progress)
      }
    })

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.response))
      } else {
        reject(new Error("Upload failed"))
      }
    })

    const formData = new FormData()
    formData.append("file", file)

    xhr.open("POST", "/api/upload")
    xhr.send(formData)
  })
}

// Usage
function Uploader() {
  const [progress, setProgress] = useState(0)

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      try {
        await uploadWithProgress(file, setProgress)
      } catch (error) {
        console.error("Upload failed:", error)
      }
    }
  }

  return (
    <>
      <FileUpload onFilesSelected={handleUpload} />
      {progress > 0 && (
        <UploadProgress
          fileName="file.pdf"
          progress={progress}
          status="uploading"
        />
      )}
    </>
  )
}
```

## File Size Utility

```tsx
import { formatFileSize } from "@/components/ui/upload"

const size = formatFileSize(1024000) // "1 MB"
const size2 = formatFileSize(2048) // "2 KB"
```

## Demo

To see all components in action, check out:
- **Demo Component**: `/src/components/examples/UploadComponentsDemo.tsx`
- **Full Documentation**: `/docs/UPLOAD_MEDIA_COMPONENTS.md`

## Common Patterns

### Form Integration with React Hook Form

```tsx
import { useForm } from "react-hook-form"
import { FileUpload } from "@/components/ui/upload"

function MyForm() {
  const { setValue, watch } = useForm()
  const files = watch("files")

  return (
    <form>
      <FileUpload
        onFilesSelected={(files) => setValue("files", files)}
        value={files}
      />
    </form>
  )
}
```

### Conditional Rendering

```tsx
{images.length > 0 ? (
  <ImageGallery images={images} />
) : (
  <p>No images available</p>
)}
```

### Loading States

```tsx
function Uploader() {
  const [uploading, setUploading] = useState(false)

  return (
    <FileUpload
      onFilesSelected={async (files) => {
        setUploading(true)
        await uploadFiles(files)
        setUploading(false)
      }}
      disabled={uploading}
    />
  )
}
```

## Tips

1. **Always validate on the server** - Client-side validation is for UX only
2. **Clean up object URLs** - Components handle this automatically
3. **Handle errors gracefully** - Use toast notifications
4. **Show progress** - Use UploadProgress for better UX
5. **Compress images** - Before uploading large images
6. **Use appropriate max sizes** - Avatars: 2MB, Images: 5MB, Documents: 10MB

## Need Help?

- Full documentation: `/docs/UPLOAD_MEDIA_COMPONENTS.md`
- Demo component: `/src/components/examples/UploadComponentsDemo.tsx`
- Component source: `/src/components/ui/*-upload.tsx`
