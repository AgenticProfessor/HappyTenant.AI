'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, FileUp, Users, PenTool, Send, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ESignProvider, useESign } from './ESignContext';
import { DocumentUpload } from './DocumentUpload';
import { SignerSelection } from './SignerSelection';
import { DocumentEditorStep } from './DocumentEditor';
import { ReviewAndSend, SendSuccess } from './ReviewAndSend';

// Step configuration
const STEPS = [
  { id: 'upload', label: 'Upload', icon: FileUp },
  { id: 'signers', label: 'Signers', icon: Users },
  { id: 'fields', label: 'Fields', icon: PenTool },
  { id: 'review', label: 'Review', icon: Send },
] as const;

function StepIndicator() {
  const { state } = useESign();
  const currentStepIndex = STEPS.findIndex((s) => s.id === state.step);

  // Hide step indicator on success
  if (state.step === 'sent') return null;

  return (
    <div className="mb-8">
      {/* Desktop Steps */}
      <div className="hidden md:flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-3">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted
                      ? 'var(--success)'
                      : isCurrent
                      ? 'var(--primary)'
                      : 'var(--muted)',
                  }}
                  className={cn(
                    'size-10 rounded-full flex items-center justify-center transition-colors',
                    (isCompleted || isCurrent) ? 'text-white' : 'text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-5" />
                  ) : (
                    <Icon className="size-5" />
                  )}
                </motion.div>
                <div>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isCurrent ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Step {index + 1}
                  </p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-4">
                  <div
                    className={cn(
                      'h-0.5 w-full rounded-full transition-colors',
                      index < currentStepIndex ? 'bg-success' : 'bg-muted'
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile Steps */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <React.Fragment key={step.id}>
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.2 : 1,
                  }}
                  className={cn(
                    'size-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                    isCompleted
                      ? 'bg-success text-white'
                      : isCurrent
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? <Check className="size-4" /> : index + 1}
                </motion.div>
                {index < STEPS.length - 1 && (
                  <div className="flex-1 mx-2">
                    <div
                      className={cn(
                        'h-0.5 w-full rounded-full',
                        index < currentStepIndex ? 'bg-success' : 'bg-muted'
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="text-center">
          <p className="font-medium">{STEPS[currentStepIndex]?.label}</p>
          <p className="text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {STEPS.length}
          </p>
        </div>
      </div>
    </div>
  );
}

function WizardContent() {
  const { state } = useESign();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {state.step === 'upload' && <DocumentUpload />}
        {state.step === 'signers' && <SignerSelection />}
        {state.step === 'fields' && <DocumentEditorStep />}
        {state.step === 'review' && <ReviewAndSend />}
        {state.step === 'sent' && <SendSuccess />}
      </motion.div>
    </AnimatePresence>
  );
}

function WizardInner() {
  return (
    <div>
      <StepIndicator />
      <WizardContent />
    </div>
  );
}

export function ESignWizard() {
  return (
    <ESignProvider>
      <WizardInner />
    </ESignProvider>
  );
}
