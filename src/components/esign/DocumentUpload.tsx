'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  X,
  Sparkles,
  FileCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useESign } from './ESignContext';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function DocumentUpload() {
  const { state, setFile, clearFile, setDocumentInfo, setStep, canProceedToSigners } = useESign();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    type?: string;
    suggestedSigners?: number;
  } | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setFile(file, preview);

      // Simulate AI analysis
      setIsAnalyzing(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock AI suggestions based on filename
      const fileName = file.name.toLowerCase();
      let docType = 'Document';
      let suggestedSigners = 2;

      if (fileName.includes('lease')) {
        docType = 'Lease Agreement';
        suggestedSigners = 2;
      } else if (fileName.includes('addendum')) {
        docType = 'Lease Addendum';
        suggestedSigners = 2;
      } else if (fileName.includes('notice')) {
        docType = 'Notice';
        suggestedSigners = 1;
      } else if (fileName.includes('inspection') || fileName.includes('condition')) {
        docType = 'Inspection Report';
        suggestedSigners = 2;
      }

      setAiSuggestions({ type: docType, suggestedSigners });
      setIsAnalyzing(false);
    },
    [setFile]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 25 * 1024 * 1024, // 25MB
    disabled: !!state.uploadedFile,
  });

  const handleClearFile = () => {
    clearFile();
    setAiSuggestions(null);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentInfo(e.target.value, state.document?.description);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocumentInfo(state.document?.name || '', e.target.value);
  };

  return (
    <div className="space-y-8">
      {/* Upload Area */}
      <AnimatePresence mode="wait">
        {!state.uploadedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div
              {...getRootProps()}
              className={cn(
                'relative overflow-hidden rounded-2xl border-2 border-dashed p-12 transition-all duration-300 cursor-pointer group',
                isDragActive && !isDragReject && 'border-primary bg-primary/5 scale-[1.02]',
                isDragReject && 'border-destructive bg-destructive/5',
                !isDragActive && 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
              )}
            >
              <input {...getInputProps()} />

              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
              </div>

              <div className="relative flex flex-col items-center gap-6 text-center">
                <motion.div
                  className={cn(
                    'rounded-2xl p-6 transition-colors duration-300',
                    isDragActive ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/10'
                  )}
                  animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Upload
                    className={cn(
                      'size-12 transition-colors duration-300',
                      isDragActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                    )}
                  />
                </motion.div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    {isDragActive
                      ? isDragReject
                        ? 'File type not supported'
                        : 'Drop your document here'
                      : 'Upload Your Document'}
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Drag and drop your document, or click to browse. We support PDF, DOC, and DOCX files up to 25MB.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="size-4 text-primary" />
                  <span>AI will automatically detect signature areas</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* File Preview */}
                  <div className="w-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border-r">
                    <div className="p-8">
                      <div className="relative">
                        <FileText className="size-20 text-primary" />
                        <motion.div
                          className="absolute -bottom-1 -right-1 rounded-full bg-success p-1"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3, type: 'spring' }}
                        >
                          <FileCheck className="size-4 text-white" />
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* File Details */}
                  <div className="flex-1 p-6 space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {state.uploadedFile.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(state.uploadedFile.size)} • {state.uploadedFile.type.split('/')[1].toUpperCase()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClearFile}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-5" />
                      </Button>
                    </div>

                    {/* AI Analysis */}
                    <AnimatePresence mode="wait">
                      {isAnalyzing ? (
                        <motion.div
                          key="analyzing"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20"
                        >
                          <Loader2 className="size-5 text-primary animate-spin" />
                          <div>
                            <p className="text-sm font-medium">Analyzing document...</p>
                            <p className="text-xs text-muted-foreground">
                              AI is detecting document type and signature areas
                            </p>
                          </div>
                        </motion.div>
                      ) : aiSuggestions ? (
                        <motion.div
                          key="suggestions"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20"
                        >
                          <Sparkles className="size-5 text-success" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-success">
                              Detected: {aiSuggestions.type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Typically requires {aiSuggestions.suggestedSigners} signer(s)
                            </p>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>

                    {/* Document Name & Description */}
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="doc-name">Document Name</Label>
                        <Input
                          id="doc-name"
                          value={state.document?.name || ''}
                          onChange={handleNameChange}
                          placeholder="Enter a name for this document"
                          className="font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="doc-description">
                          Description <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Textarea
                          id="doc-description"
                          value={state.document?.description || ''}
                          onChange={handleDescriptionChange}
                          placeholder="Add a description or notes about this document"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: FileText,
            title: 'Supported Formats',
            description: 'PDF, DOC, DOCX files up to 25MB',
          },
          {
            icon: Sparkles,
            title: 'AI-Powered',
            description: 'Auto-detect signature locations',
          },
          {
            icon: FileCheck,
            title: 'Secure',
            description: 'Bank-level encryption for all documents',
          },
        ].map((tip, index) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 p-4 rounded-lg bg-muted/50"
          >
            <tip.icon className="size-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">{tip.title}</p>
              <p className="text-xs text-muted-foreground">{tip.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={() => setStep('signers')}
          disabled={!canProceedToSigners}
          size="lg"
          className="min-w-[200px]"
        >
          Next: Add Signers
        </Button>
      </div>
    </div>
  );
}
