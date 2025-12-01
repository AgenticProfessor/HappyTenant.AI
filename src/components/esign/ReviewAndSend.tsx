'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  FileText,
  Users,
  PenTool,
  Mail,
  Clock,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Edit,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useESign } from './ESignContext';
import { FIELD_LABELS } from '@/lib/schemas/esign';

export function ReviewAndSend() {
  const {
    state,
    setMessage,
    setStep,
    setProcessing,
    setError,
    canSend,
  } = useESign();

  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [enableReminders, setEnableReminders] = useState(true);
  const [aiDraftMessage, setAiDraftMessage] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleGenerateMessage = async () => {
    setAiDraftMessage(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const signerNames = state.signers.map((s) => s.name.split(' ')[0]).join(' and ');
    const documentName = state.document?.name || 'document';

    setMessage(
      `Hi ${signerNames},\n\nPlease review and sign the attached ${documentName}. This document requires your electronic signature to proceed.\n\nIf you have any questions, please don't hesitate to reach out.\n\nThank you!`
    );
    setAiDraftMessage(false);
  };

  const handleSend = async () => {
    setIsSending(true);
    setProcessing(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSendSuccess(true);
      setStep('sent');
    } catch (error) {
      setError('Failed to send document. Please try again.');
    } finally {
      setIsSending(false);
      setProcessing(false);
    }
  };

  const totalFields = state.fields.length;
  const signatureFields = state.fields.filter(
    (f) => f.type === 'SIGNATURE' || f.type === 'INITIALS'
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Review & Send</h2>
        <p className="text-muted-foreground mt-1">
          Review the document details and send it for signatures
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Summary */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                Document Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                  <FileText className="size-10 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{state.document?.name || 'Untitled Document'}</h3>
                  {state.document?.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {state.document.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span>{state.uploadedFile?.name}</span>
                    <span>•</span>
                    <span>
                      {state.uploadedFile
                        ? `${(state.uploadedFile.size / 1024).toFixed(1)} KB`
                        : ''}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep('upload')}>
                  <Edit className="size-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Signers */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Users className="size-5 text-primary" />
                  Signers ({state.signers.length})
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setStep('signers')}>
                  <Edit className="size-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {state.signers.map((signer, index) => {
                  const signerFields = state.fields.filter(
                    (f) => f.signerId === signer.email
                  );
                  return (
                    <motion.div
                      key={signer.email}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-muted/50"
                    >
                      <div className="flex items-center gap-1 text-muted-foreground w-6">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <Avatar
                        className="size-10 border-2"
                        style={{ borderColor: signer.color }}
                      >
                        <AvatarFallback
                          style={{ backgroundColor: signer.color }}
                          className="text-white text-sm font-semibold"
                        >
                          {getInitials(signer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{signer.name}</p>
                        <p className="text-sm text-muted-foreground">{signer.email}</p>
                      </div>
                      <Badge variant="secondary" className="font-normal">
                        {signer.role.replace('_', ' ')}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium">{signerFields.length} fields</p>
                        <p className="text-xs text-muted-foreground">
                          {signerFields.filter((f) => f.type === 'SIGNATURE').length} signature
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Message to Signers */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Mail className="size-5 text-primary" />
                  Message to Signers
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateMessage}
                  disabled={aiDraftMessage}
                >
                  {aiDraftMessage ? (
                    <Loader2 className="size-4 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="size-4 mr-1" />
                  )}
                  AI Draft
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add a personal message to include in the signature request email..."
                rows={5}
                value={state.message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {state.message.length} / 500 characters
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Signers</span>
                  <span className="font-semibold">{state.signers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Fields</span>
                  <span className="font-semibold">{totalFields}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Signatures Required</span>
                  <span className="font-semibold">{signatureFields}</span>
                </div>
              </div>

              <Separator />

              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Email Reminders</Label>
                    <p className="text-xs text-muted-foreground">
                      Send reminders every 3 days
                    </p>
                  </div>
                  <Switch
                    checked={enableReminders}
                    onCheckedChange={setEnableReminders}
                  />
                </div>
              </div>

              <Separator />

              {/* Security Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="size-5 text-success mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Bank-level Security</p>
                    <p className="text-xs text-muted-foreground">
                      256-bit SSL encryption
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-success mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Legally Binding</p>
                    <p className="text-xs text-muted-foreground">
                      Compliant with ESIGN Act
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Send Button */}
          <Button
            size="lg"
            className="w-full h-14 text-base"
            onClick={handleSend}
            disabled={!canSend || isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="size-5 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="size-5 mr-2" />
                Send for Signature
              </>
            )}
          </Button>

          {/* Preview Button */}
          <Button variant="outline" size="lg" className="w-full" onClick={() => setStep('fields')}>
            <Eye className="size-4 mr-2" />
            Preview Document
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-start pt-4 border-t">
        <Button variant="outline" onClick={() => setStep('fields')}>
          Back
        </Button>
      </div>
    </div>
  );
}

// Success screen after sending
export function SendSuccess() {
  const { state, reset } = useESign();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 space-y-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="size-24 mx-auto rounded-full bg-success/20 flex items-center justify-center"
      >
        <CheckCircle2 className="size-12 text-success" />
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Document Sent Successfully!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your document has been sent to {state.signers.length} signer
          {state.signers.length !== 1 ? 's' : ''} for their signature.
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">What happens next?</h3>
          <div className="space-y-4 text-left">
            {state.signers.map((signer, index) => (
              <motion.div
                key={signer.email}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <Avatar className="size-8" style={{ backgroundColor: signer.color }}>
                  <AvatarFallback
                    style={{ backgroundColor: signer.color }}
                    className="text-white text-xs"
                  >
                    {signer.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{signer.name}</p>
                  <p className="text-xs text-muted-foreground">{signer.email}</p>
                </div>
                <Badge variant="outline" className="text-warning border-warning">
                  <Clock className="size-3 mr-1" />
                  Pending
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" onClick={reset}>
          Send Another Document
        </Button>
        <Button>View Status</Button>
      </div>
    </motion.div>
  );
}
