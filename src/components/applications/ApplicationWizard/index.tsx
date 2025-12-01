'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { WizardProgress } from './WizardProgress'
import { PersonalInfoStep } from './steps/PersonalInfoStep'
import { PaymentStep } from './steps/PaymentStep'
import { EmploymentStep } from './steps/EmploymentStep'
import { RentalHistoryStep } from './steps/RentalHistoryStep'
import { ReferencesStep } from './steps/ReferencesStep'
import { AdditionalInfoStep } from './steps/AdditionalInfoStep'
import { DocumentsStep } from './steps/DocumentsStep'
import { ConsentStep } from './steps/ConsentStep'
import {
  type ApplicationFormData,
  type ApplicationLinkInfo,
  type WizardStep,
  WIZARD_STEPS,
  EMPTY_FORM_DATA,
} from './types'

const STORAGE_KEY = 'happy_tenant_application_draft'

// Payment step definition (inserted conditionally)
const PAYMENT_STEP: WizardStep = {
  id: 'payment',
  title: 'Application Fee',
  shortTitle: 'Payment',
  description: 'Pay the application fee to proceed',
  icon: 'credit-card',
}

interface ApplicationWizardProps {
  token: string
  linkInfo: ApplicationLinkInfo
  onSubmit: (data: ApplicationFormData) => Promise<void>
}

export function ApplicationWizard({ token, linkInfo, onSubmit }: ApplicationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [formData, setFormData] = useState<ApplicationFormData>(EMPTY_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

  // Determine if payment is required
  const requiresPayment = useMemo(() => {
    return (
      linkInfo.applicationFee !== null &&
      linkInfo.applicationFee !== undefined &&
      linkInfo.applicationFee > 0 &&
      linkInfo.collectFeeOnline
    )
  }, [linkInfo.applicationFee, linkInfo.collectFeeOnline])

  // Build steps dynamically - insert payment step after personal info if required
  const activeSteps = useMemo(() => {
    if (requiresPayment && !formData.payment.paid) {
      // Insert payment step after personal info (index 0)
      const steps = [...WIZARD_STEPS]
      steps.splice(1, 0, PAYMENT_STEP)
      return steps
    }
    return WIZARD_STEPS
  }, [requiresPayment, formData.payment.paid])

  // Load draft from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_${token}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setFormData(parsed.formData || EMPTY_FORM_DATA)
        setCurrentStep(parsed.currentStep || 0)
        setCompletedSteps(parsed.completedSteps || [])
      } catch (e) {
        console.error('Failed to load draft:', e)
      }
    }
  }, [token])

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    localStorage.setItem(
      `${STORAGE_KEY}_${token}`,
      JSON.stringify({ formData, currentStep, completedSteps })
    )
  }, [formData, currentStep, completedSteps, token])

  useEffect(() => {
    saveDraft()
  }, [saveDraft])

  const updateStepData = useCallback(
    <K extends keyof ApplicationFormData>(
      stepKey: K,
      data: Partial<ApplicationFormData[K]>
    ) => {
      setFormData((prev) => ({
        ...prev,
        [stepKey]: { ...prev[stepKey], ...data },
      }))
    },
    []
  )

  // Handle payment completion
  const handlePaymentComplete = useCallback((paymentIntentId: string) => {
    setFormData((prev) => ({
      ...prev,
      payment: {
        paymentIntentId,
        paid: true,
      },
    }))
  }, [])

  const handleNext = useCallback(() => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep])
    }
    setDirection('forward')
    setCurrentStep((prev) => Math.min(prev + 1, activeSteps.length - 1))
  }, [currentStep, completedSteps, activeSteps.length])

  const handleBack = useCallback(() => {
    setDirection('backward')
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }, [])

  const handleStepClick = useCallback(
    (step: number) => {
      if (completedSteps.includes(step) || step <= currentStep) {
        setDirection(step > currentStep ? 'forward' : 'backward')
        setCurrentStep(step)
      }
    },
    [completedSteps, currentStep]
  )

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      // Clear draft on successful submission
      localStorage.removeItem(`${STORAGE_KEY}_${token}`)
    } catch (error) {
      console.error('Submission failed:', error)
      setIsSubmitting(false)
      throw error
    }
  }

  const slideVariants = {
    enter: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? -100 : 100,
      opacity: 0,
    }),
  }

  const renderStep = () => {
    const stepProps = {
      formData,
      updateStepData,
      linkInfo,
    }

    // Get the current step ID to determine which component to render
    const currentStepId = activeSteps[currentStep]?.id

    switch (currentStepId) {
      case 'personal':
        return <PersonalInfoStep {...stepProps} onNext={handleNext} />
      case 'payment':
        return (
          <PaymentStep
            {...stepProps}
            token={token}
            onNext={handleNext}
            onPaymentComplete={handlePaymentComplete}
          />
        )
      case 'employment':
        return <EmploymentStep {...stepProps} onNext={handleNext} />
      case 'rental-history':
        return <RentalHistoryStep {...stepProps} onNext={handleNext} />
      case 'references':
        return <ReferencesStep {...stepProps} onNext={handleNext} />
      case 'additional':
        return <AdditionalInfoStep {...stepProps} onNext={handleNext} />
      case 'documents':
        return <DocumentsStep {...stepProps} onNext={handleNext} />
      case 'consent':
        return (
          <ConsentStep
            {...stepProps}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full">
      {/* Progress */}
      <div className="px-6 py-5 border-b border-border bg-muted/50/50">
        <WizardProgress
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
          steps={activeSteps}
        />
      </div>

      {/* Step Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-6 lg:px-8 py-5 border-b border-border">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl lg:text-2xl font-semibold text-foreground">
            {activeSteps[currentStep]?.title}
          </h2>
          <p className="text-muted-foreground mt-1">
            {activeSteps[currentStep]?.description}
          </p>
        </motion.div>
      </div>

      {/* Step Content */}
      <div className="p-6 lg:p-8 min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="bg-muted/50/50 px-6 lg:px-8 py-5 border-t border-border">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={cn(
              'gap-2 text-muted-foreground hover:text-foreground',
              currentStep === 0 && 'invisible'
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {/* Save indicator */}
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Progress saved automatically
            </span>

            {currentStep < activeSteps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={activeSteps[currentStep]?.id === 'payment' && !formData.payment.paid}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export { WizardProgress }
export * from './types'
