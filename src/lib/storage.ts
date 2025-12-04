import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Supabase Storage buckets - create these in your Supabase dashboard
export const STORAGE_BUCKETS = {
  DOCUMENTS: 'documents',      // Leases, applications, legal docs
  MAINTENANCE: 'maintenance',  // Maintenance request photos
  PROPERTIES: 'properties',    // Property and unit photos
  AVATARS: 'avatars',         // User profile images
} as const

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS]

interface UploadOptions {
  bucket: StorageBucket
  path: string  // e.g., 'org-123/property-456/photo.jpg'
  file: File | Blob
  contentType?: string
  upsert?: boolean
}

interface UploadResult {
  success: boolean
  path?: string
  publicUrl?: string
  error?: string
}

/**
 * Upload a file to Supabase Storage (client-side)
 */
export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  const { bucket, path, file, contentType, upsert = false } = options

  try {
    const supabase = createClient()

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert,
      })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      success: true,
      path: data.path,
      publicUrl: urlData.publicUrl,
    }
  } catch (err) {
    console.error('Upload exception:', err)
    return { success: false, error: 'Failed to upload file' }
  }
}

/**
 * Upload a file to Supabase Storage (server-side)
 */
export async function uploadFileServer(options: UploadOptions): Promise<UploadResult> {
  const { bucket, path, file, contentType, upsert = false } = options

  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert,
      })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      success: true,
      path: data.path,
      publicUrl: urlData.publicUrl,
    }
  } catch (err) {
    console.error('Upload exception:', err)
    return { success: false, error: 'Failed to upload file' }
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: StorageBucket, path: string): Promise<boolean> {
  try {
    const supabase = createClient()

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Delete exception:', err)
    return false
  }
}

/**
 * Get a signed URL for private file access (expires after specified duration)
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string | null> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error('Signed URL error:', error)
      return null
    }

    return data.signedUrl
  } catch (err) {
    console.error('Signed URL exception:', err)
    return null
  }
}

/**
 * Get public URL for a file (only works for public buckets)
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Generate a storage path for organizing files
 */
export function generateStoragePath(
  organizationId: string,
  entityType: 'property' | 'tenant' | 'lease' | 'maintenance' | 'application',
  entityId: string,
  filename: string
): string {
  const timestamp = Date.now()
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${organizationId}/${entityType}/${entityId}/${timestamp}-${sanitizedFilename}`
}

/**
 * List files in a directory
 */
export async function listFiles(bucket: StorageBucket, path: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path)

    if (error) {
      console.error('List error:', error)
      return []
    }

    return data
  } catch (err) {
    console.error('List exception:', err)
    return []
  }
}
