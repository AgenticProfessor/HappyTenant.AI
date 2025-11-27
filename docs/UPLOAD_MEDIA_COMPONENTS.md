# File Upload and Media Components

This document provides comprehensive documentation for all file upload and media components in the Happy Tenant application.

## Table of Contents

1. [File Upload Component](#file-upload-component)
2. [Image Upload Component](#image-upload-component)
3. [Avatar Upload Component](#avatar-upload-component)
4. [Upload Progress Component](#upload-progress-component)
5. [Image Gallery Component](#image-gallery-component)
6. [Document Viewer Component](#document-viewer-component)
7. [Photo Upload Dialog Component](#photo-upload-dialog-component)

---

## File Upload Component

**Location:** `/src/components/ui/file-upload.tsx`

A versatile drag-and-drop file upload component with validation, preview, and file management.

### Features

- Drag and drop support
- Click to select files
- Multiple file support (configurable)
- File type restrictions via accept prop
- File size validation
- Image previews
- File list display for non-images
- Remove file functionality
- Toast notifications for errors

### Props

```typescript
interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  accept?: string // e.g., "image/*,.pdf"
  maxSize?: number // in bytes, default: 10MB
  maxFiles?: number // default: 5
  multiple?: boolean // default: false
  disabled?: boolean
  className?: string
  value?: File[]
  onRemove?: (index: number) => void
}
```

### Usage Example

```tsx
import { FileUpload } from "@/components/ui/file-upload"

function MyComponent() {
  const handleFilesSelected = (files: File[]) => {
    console.log("Selected files:", files)
    // Upload files to your backend
  }

  return (
    <FileUpload
      onFilesSelected={handleFilesSelected}
      accept="image/*,.pdf"
      maxSize={10 * 1024 * 1024} // 10MB
      maxFiles={5}
      multiple={true}
    />
  )
}
```

### Utility Function

```typescript
formatFileSize(bytes: number): string
```

Converts bytes to human-readable format (B, KB, MB, GB).

---

## Image Upload Component

**Location:** `/src/components/ui/image-upload.tsx`

Specialized image upload component with preview grid, reordering, and primary selection.

### Features

- Image-only uploads
- Grid layout with previews
- Drag to reorder images
- Primary image selection
- Caption support
- Image removal
- Extends FileUpload component

### Props

```typescript
interface ImageFile {
  file: File
  preview: string
  isPrimary?: boolean
  caption?: string
}

interface ImageUploadProps {
  onImagesSelected: (images: ImageFile[]) => void
  maxSize?: number // default: 5MB
  maxFiles?: number // default: 10
  multiple?: boolean // default: true
  disabled?: boolean
  className?: string
  value?: ImageFile[]
  showCaptions?: boolean
  showPrimarySelection?: boolean
}
```

### Usage Example

```tsx
import { ImageUpload, type ImageFile } from "@/components/ui/image-upload"

function PropertyPhotos() {
  const [images, setImages] = useState<ImageFile[]>([])

  const handleImagesSelected = (selectedImages: ImageFile[]) => {
    setImages(selectedImages)
    // Upload images to your backend
  }

  return (
    <ImageUpload
      onImagesSelected={handleImagesSelected}
      value={images}
      maxFiles={20}
      showCaptions={true}
      showPrimarySelection={true}
    />
  )
}
```

---

## Avatar Upload Component

**Location:** `/src/components/ui/avatar-upload.tsx`

Circular avatar upload component for user profiles.

### Features

- Circular preview
- Single image only
- Current avatar display
- Fallback to initials
- Upload/change/remove functionality
- Size recommendations
- Image validation

### Props

```typescript
interface AvatarUploadProps {
  onImageSelected: (file: File | null) => void
  currentImage?: string
  userName?: string
  maxSize?: number // default: 2MB
  disabled?: boolean
  className?: string
}
```

### Usage Example

```tsx
import { AvatarUpload } from "@/components/ui/avatar-upload"

function UserProfile() {
  const handleAvatarSelected = (file: File | null) => {
    if (file) {
      // Upload avatar to backend
      console.log("New avatar:", file)
    } else {
      // Remove avatar
      console.log("Avatar removed")
    }
  }

  return (
    <AvatarUpload
      onImageSelected={handleAvatarSelected}
      currentImage="/path/to/current/avatar.jpg"
      userName="John Doe"
      maxSize={2 * 1024 * 1024}
    />
  )
}
```

---

## Upload Progress Component

**Location:** `/src/components/ui/upload-progress.tsx`

Display upload progress with status indicators.

### Features

- Progress bar
- File name and size display
- Upload/success/error states
- Cancel button
- Retry button on error
- Multiple upload tracking

### Props

```typescript
interface UploadProgressProps {
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
```

### Usage Example

```tsx
import { UploadProgress } from "@/components/ui/upload-progress"

function FileUploader() {
  const [uploadState, setUploadState] = useState({
    fileName: "document.pdf",
    progress: 45,
    status: "uploading" as const,
  })

  return (
    <UploadProgress
      fileName={uploadState.fileName}
      progress={uploadState.progress}
      status={uploadState.status}
      onCancel={() => console.log("Upload cancelled")}
    />
  )
}
```

### Multiple Upload Progress

```typescript
interface MultipleUploadProgressProps {
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
```

```tsx
import { MultipleUploadProgress } from "@/components/ui/upload-progress"

function BatchUploader() {
  const uploads = [
    { id: "1", fileName: "file1.pdf", progress: 100, status: "success" as const },
    { id: "2", fileName: "file2.jpg", progress: 45, status: "uploading" as const },
  ]

  return (
    <MultipleUploadProgress
      uploads={uploads}
      onCancel={(id) => console.log("Cancel", id)}
      onRetry={(id) => console.log("Retry", id)}
      onClearCompleted={() => console.log("Clear completed")}
    />
  )
}
```

---

## Image Gallery Component

**Location:** `/src/components/properties/ImageGallery.tsx`

Property photo gallery with lightbox viewer.

### Features

- Responsive grid layout
- Lightbox modal on click
- Keyboard navigation (arrows, escape)
- Navigation arrows in lightbox
- Thumbnail strip
- Image counter
- Caption display
- Adaptive layout (1-3+ images)

### Props

```typescript
interface GalleryImage {
  url: string
  alt?: string
  caption?: string
}

interface ImageGalleryProps {
  images: GalleryImage[]
  className?: string
}
```

### Usage Example

```tsx
import { ImageGallery } from "@/components/properties/ImageGallery"

function PropertyDetails() {
  const propertyImages = [
    {
      url: "/images/property-1.jpg",
      alt: "Living room",
      caption: "Spacious living room with natural light",
    },
    {
      url: "/images/property-2.jpg",
      alt: "Kitchen",
      caption: "Modern kitchen with stainless steel appliances",
    },
  ]

  return <ImageGallery images={propertyImages} />
}
```

### Keyboard Shortcuts

- `←` Left Arrow: Previous image
- `→` Right Arrow: Next image
- `Esc`: Close lightbox

---

## Document Viewer Component

**Location:** `/src/components/documents/DocumentViewer.tsx`

View and download documents with preview support.

### Features

- Image inline preview
- PDF placeholder with open button
- Generic file type display
- Download functionality
- Open in new tab
- File metadata display
- File type icons

### Props

```typescript
interface DocumentViewerDocument {
  name: string
  url: string
  type: string // MIME type
  size: number // bytes
}

interface DocumentViewerProps {
  document: DocumentViewerDocument
  onDownload?: () => void
  className?: string
}
```

### Usage Example

```tsx
import { DocumentViewer } from "@/components/documents/DocumentViewer"

function LeaseAgreement() {
  const leaseDocument = {
    name: "lease-agreement.pdf",
    url: "/documents/lease-agreement.pdf",
    type: "application/pdf",
    size: 1024000, // bytes
  }

  const handleDownload = () => {
    // Custom download logic
    console.log("Downloading document...")
  }

  return (
    <DocumentViewer
      document={leaseDocument}
      onDownload={handleDownload}
    />
  )
}
```

### Supported File Types

- Images: JPG, PNG, GIF, WebP (inline preview)
- PDF: Placeholder with open button
- Documents: Word, Excel, Text, CSV (icon display)

---

## Photo Upload Dialog Component

**Location:** `/src/components/properties/PhotoUploadDialog.tsx`

Modal dialog for uploading property photos.

### Features

- Uses ImageUpload component
- Upload multiple photos
- Add captions
- Set primary photo
- Validation before save
- Integration-ready for property management

### Props

```typescript
interface PhotoUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (photos: ImageFile[]) => Promise<void> | void
  propertyName?: string
  maxPhotos?: number // default: 20
  existingPhotos?: ImageFile[]
}
```

### Usage Example

```tsx
import { PhotoUploadDialog } from "@/components/properties/PhotoUploadDialog"
import { type ImageFile } from "@/components/ui/image-upload"

function PropertyManagement() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSavePhotos = async (photos: ImageFile[]) => {
    // Upload photos to backend
    const formData = new FormData()
    photos.forEach((photo, index) => {
      formData.append(`photo-${index}`, photo.file)
      formData.append(`caption-${index}`, photo.caption || "")
      formData.append(`isPrimary-${index}`, String(photo.isPrimary))
    })

    // await fetch("/api/properties/123/photos", {
    //   method: "POST",
    //   body: formData,
    // })
    console.log("Saving photos:", photos)
  }

  return (
    <>
      <button onClick={() => setDialogOpen(true)}>
        Upload Photos
      </button>

      <PhotoUploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSavePhotos}
        propertyName="123 Main Street"
        maxPhotos={20}
      />
    </>
  )
}
```

---

## Backend Integration

All components are designed to work standalone without a backend. To integrate with your backend:

### 1. File Upload

```tsx
const handleFilesSelected = async (files: File[]) => {
  const formData = new FormData()
  files.forEach((file) => formData.append("files", file))

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  const result = await response.json()
  console.log("Uploaded files:", result)
}
```

### 2. Image Upload with Metadata

```tsx
const handleImagesSelected = async (images: ImageFile[]) => {
  const formData = new FormData()

  images.forEach((image, index) => {
    formData.append(`image-${index}`, image.file)
    formData.append(`caption-${index}`, image.caption || "")
    formData.append(`isPrimary-${index}`, String(image.isPrimary))
  })

  await fetch("/api/images", {
    method: "POST",
    body: formData,
  })
}
```

### 3. Upload Progress Tracking

```tsx
const uploadWithProgress = async (file: File) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100
        setUploadProgress(progress)
      }
    })

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        resolve(xhr.response)
      } else {
        reject(new Error("Upload failed"))
      }
    })

    xhr.addEventListener("error", () => reject(new Error("Upload error")))

    const formData = new FormData()
    formData.append("file", file)

    xhr.open("POST", "/api/upload")
    xhr.send(formData)
  })
}
```

---

## Styling and Customization

All components use Tailwind CSS and can be customized via:

1. **className prop**: Add custom classes
2. **Theme variables**: Customize colors via Tailwind config
3. **Component variants**: Modify button and UI component variants

### Example Customization

```tsx
<FileUpload
  className="border-2 border-dashed border-blue-500"
  onFilesSelected={handleFiles}
/>

<ImageGallery
  className="grid-cols-4" // Override grid columns
  images={images}
/>
```

---

## Accessibility

All components follow accessibility best practices:

- Keyboard navigation support
- Screen reader labels (sr-only)
- ARIA attributes
- Focus management
- Semantic HTML

---

## Dependencies

- `react-dropzone`: Drag and drop functionality
- `lucide-react`: Icons
- `sonner`: Toast notifications
- `@radix-ui/*`: UI primitives (dialog, progress, avatar)

---

## Notes

1. **Object URL Cleanup**: Components properly cleanup object URLs to prevent memory leaks
2. **File Validation**: All validation happens client-side; implement server-side validation too
3. **Progress Tracking**: Progress components are UI-only; integrate with your upload logic
4. **Image Optimization**: Consider adding image compression before upload
5. **Security**: Always validate file types and sizes on the server

---

## Examples Directory

For more examples, see the components in action:
- Property photo management
- User profile avatars
- Document uploads for leases
- Maintenance request attachments
