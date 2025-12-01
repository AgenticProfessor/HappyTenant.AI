'use client'

import { useState, useEffect, useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Shield,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ApplicationFormData, ApplicationLinkInfo } from '../types'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentStepProps {
  formData: ApplicationFormData
  updateStepData: <K extends keyof ApplicationFormData>(
    stepKey: K,
    data: Partial<ApplicationFormData[K]>
  ) => void
  linkInfo: ApplicationLinkInfo
  token: string
  onNext: () => void
  onPaymentComplete: (paymentIntentId: string) => void
}

interface PaymentFormProps {
  amount: number
  onSuccess: (paymentIntentId: string) => void
  applicantEmail?: string
}

function PaymentForm({ amount, onSuccess, applicantEmail }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href, // Not used since we handle redirect: 'if_required'
          receipt_email: applicantEmail,
        },
        redirect: 'if_required',
      })

      if (submitError) {
        setError(submitError.message || 'Payment failed. Please try again.')
        setIsProcessing(false)
        return
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id)
      } else if (paymentIntent && paymentIntent.status === 'processing') {
        // Payment is processing, treat as success for now
        onSuccess(paymentIntent.id)
      } else {
        setError('Payment was not completed. Please try again.')
        setIsProcessing(false)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Amount Display */}
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-emerald-700">Application Fee</p>
              <p className="text-xs text-emerald-600">One-time, non-refundable</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700">${amount}</p>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="p-4 rounded-xl border border-border bg-muted/30">
        <PaymentElement
          onReady={() => setIsReady(true)}
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Payment Failed</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Security Notice */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
        <Shield className="w-5 h-5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Your payment is secured with 256-bit SSL encryption. We never store your card details.
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || !elements || isProcessing || !isReady}
        className="w-full gap-2 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing Payment...
          </>
        ) : !isReady ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay ${amount} & Continue
          </>
        )}
      </Button>
    </form>
  )
}

export function PaymentStep({
  formData,
  linkInfo,
  token,
  onNext,
  onPaymentComplete,
}: PaymentStepProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentComplete, setPaymentComplete] = useState(false)

  const applicationFee = linkInfo.applicationFee || 0
  const applicantEmail = formData.personalInfo?.email

  // Create PaymentIntent on mount
  useEffect(() => {
    async function createPaymentIntent() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/applications/public/${token}/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: applicantEmail }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to initialize payment')
        }

        const data = await response.json()
        setClientSecret(data.clientSecret)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize payment')
      } finally {
        setIsLoading(false)
      }
    }

    if (applicationFee > 0 && linkInfo.collectFeeOnline) {
      createPaymentIntent()
    }
  }, [token, applicationFee, linkInfo.collectFeeOnline, applicantEmail])

  const handlePaymentSuccess = useCallback(
    (paymentIntentId: string) => {
      setPaymentComplete(true)
      onPaymentComplete(paymentIntentId)
      // Auto-advance after short delay
      setTimeout(() => {
        onNext()
      }, 1500)
    },
    [onPaymentComplete, onNext]
  )

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
        <p className="text-muted-foreground">Preparing secure payment...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Unable to Process Payment</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    )
  }

  // Payment complete state
  if (paymentComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </motion.div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground text-center">
          Your application fee has been received. Continuing to the next step...
        </p>
      </motion.div>
    )
  }

  // Payment form
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Application Fee Required
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          A non-refundable application fee is required to process your rental application.
          This helps cover screening and processing costs.
        </p>
      </div>

      {/* Stripe Elements */}
      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#059669',
                colorBackground: '#ffffff',
                colorText: '#1f2937',
                fontFamily: 'system-ui, sans-serif',
                borderRadius: '8px',
              },
            },
          }}
        >
          <PaymentForm
            amount={applicationFee}
            onSuccess={handlePaymentSuccess}
            applicantEmail={applicantEmail}
          />
        </Elements>
      )}

      {/* What happens next */}
      <div className="p-4 rounded-xl bg-muted/50 border border-border">
        <h4 className="text-sm font-medium text-foreground mb-2">What happens next?</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            Your payment will be processed securely
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            You&apos;ll continue filling out the application
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            The property manager will review your application
          </li>
        </ul>
      </div>
    </div>
  )
}

export default PaymentStep
