'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  CreditCard,
  Banknote,
  FileCheck,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ApplicationFormData, ApplicationLinkInfo } from '../types'

interface DocumentCategory {
  id: 'id' | 'pay_stubs' | 'bank_statements' | 'tax_returns' | 'other'
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  required?: boolean
}

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  {
    id: 'id',
    title: 'Government ID',
    description: 'Driver\'s license, passport, or state ID',
    icon: CreditCard,
    color: 'blue',
    required: true,
  },
  {
    id: 'pay_stubs',
    title: 'Pay Stubs',
    description: 'Last 2-3 pay stubs for income verification',
    icon: Banknote,
    color: 'green',
    required: true,
  },
  {
    id: 'bank_statements',
    title: 'Bank Statements',
    description: 'Last 2-3 months of bank statements',
    icon: FileText,
    color: 'purple',
  },
  {
    id: 'tax_returns',
    title: 'Tax Returns',
    description: 'Most recent tax return (if self-employed)',
    icon: FileCheck,
    color: 'amber',
  },
  {
    id: 'other',
    title: 'Other Documents',
    description: 'Any additional supporting documents',
    icon: FileText,
    color: 'slate',
  },
]

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  category: DocumentCategory['id']
  uploadProgress: number
  status: 'uploading' | 'complete' | 'error'
}

interface DocumentsStepProps {
  formData: ApplicationFormData
  updateStepData: <K extends keyof ApplicationFormData>(
    key: K,
    data: Partial<ApplicationFormData[K]>
  ) => void
  linkInfo: ApplicationLinkInfo
  onNext: () => void
}

export function DocumentsStep({
  formData,
  updateStepData,
  linkInfo,
  onNext,
}: DocumentsStepProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(() => {
    // Initialize from formData if available
    return (formData.documents.uploadedDocuments || []).map((doc) => ({
      id: doc.fileId,
      name: doc.fileName,
      size: 0,
      type: '',
      category: doc.type,
      uploadProgress: 100,
      status: 'complete' as const,
    }))
  })
  const [dragActive, setDragActive] = useState<DocumentCategory['id'] | null>(null)

  const requiredCategories = linkInfo.requiredDocuments.length > 0
    ? linkInfo.requiredDocuments
    : ['id', 'pay_stubs'] // Default required

  const handleDrag = useCallback((e: React.DragEvent, category: DocumentCategory['id']) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(category)
    } else if (e.type === 'dragleave') {
      setDragActive(null)
    }
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent, category: DocumentCategory['id']) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(null)

      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        await processFiles(Array.from(files), category)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    category: DocumentCategory['id']
  ) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await processFiles(Array.from(files), category)
    }
    e.target.value = '' // Reset input
  }

  const processFiles = async (files: File[], category: DocumentCategory['id']) => {
    for (const file of files) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        alert('Please upload PDF or image files only')
        continue
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        continue
      }

      const fileId = `${category}_${Date.now()}_${Math.random().toString(36).slice(2)}`

      // Add file with uploading status
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        category,
        uploadProgress: 0,
        status: 'uploading',
      }

      setUploadedFiles((prev) => [...prev, newFile])

      // Simulate upload progress (in production, this would be actual upload)
      try {
        await simulateUpload(fileId)

        // Update to complete
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, uploadProgress: 100, status: 'complete' } : f
          )
        )

        // Update form data
        updateStepData('documents', {
          uploadedDocuments: [
            ...(formData.documents.uploadedDocuments || []),
            { type: category, fileId, fileName: file.name },
          ],
        })
      } catch {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: 'error' } : f))
        )
      }
    }
  }

  const simulateUpload = (fileId: string): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 30
        if (progress >= 100) {
          clearInterval(interval)
          resolve()
        } else {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, uploadProgress: Math.min(progress, 95) } : f
            )
          )
        }
      }, 200)
    })
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
    updateStepData('documents', {
      uploadedDocuments: (formData.documents.uploadedDocuments || []).filter(
        (d) => d.fileId !== fileId
      ),
    })
  }

  const getFilesForCategory = (category: DocumentCategory['id']) => {
    return uploadedFiles.filter((f) => f.category === category)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Instructions */}
      <motion.div
        variants={itemVariants}
        className="p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-cyan-100">
            <Upload className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h3 className="font-medium text-cyan-900">Upload Documents</h3>
            <p className="text-sm text-cyan-700">
              Upload clear photos or PDFs of your documents. Max file size: 10MB each.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Document Categories */}
      {DOCUMENT_CATEGORIES.map((category) => {
        const files = getFilesForCategory(category.id)
        const isRequired = requiredCategories.includes(category.id)
        const hasFiles = files.length > 0
        const Icon = category.icon

        return (
          <motion.div key={category.id} variants={itemVariants} className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon className={cn('w-5 h-5', `text-${category.color}-600`)} />
              <h4 className="font-medium text-foreground">{category.title}</h4>
              {isRequired && (
                <span className="text-xs text-red-500 font-medium">Required</span>
              )}
              {hasFiles && (
                <span className="ml-auto text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {files.length} uploaded
                </span>
              )}
            </div>

            {/* Drop Zone */}
            <div
              className={cn(
                'relative rounded-xl border-2 border-dashed transition-all duration-200',
                dragActive === category.id
                  ? `border-${category.color}-400 bg-${category.color}-50`
                  : hasFiles
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-border bg-muted/50/50 hover:border-slate-300'
              )}
              onDragEnter={(e) => handleDrag(e, category.id)}
              onDragLeave={(e) => handleDrag(e, category.id)}
              onDragOver={(e) => handleDrag(e, category.id)}
              onDrop={(e) => handleDrop(e, category.id)}
            >
              <label className="block cursor-pointer p-6">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  multiple
                  onChange={(e) => handleFileSelect(e, category.id)}
                />
                <div className="text-center">
                  <Upload
                    className={cn(
                      'w-8 h-8 mx-auto mb-2',
                      hasFiles ? 'text-emerald-500' : 'text-muted-foreground'
                    )}
                  />
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Drag & drop or click to browse
                  </p>
                </div>
              </label>
            </div>

            {/* Uploaded Files */}
            <AnimatePresence>
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      file.status === 'complete'
                        ? 'bg-emerald-100'
                        : file.status === 'error'
                          ? 'bg-red-100'
                          : 'bg-muted'
                    )}
                  >
                    {file.status === 'uploading' ? (
                      <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                    ) : file.status === 'error' ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2">
                      {file.size > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      )}
                      {file.status === 'uploading' && (
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-emerald-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${file.uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )
      })}

      {/* Continue Button */}
      <motion.div variants={itemVariants} className="pt-4">
        <Button
          type="button"
          onClick={onNext}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
        >
          Continue to Review
        </Button>
      </motion.div>
    </motion.div>
  )
}
