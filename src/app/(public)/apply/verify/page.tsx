'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Mail,
  Clock,
  Home,
  KeyRound,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type VerificationStatus = 'input' | 'verifying' | 'success' | 'already_verified' | 'expired' | 'error'

function VerifyContent() {
  const searchParams = useSearchParams()
  const applicationId = searchParams.get('applicationId')

  const [status, setStatus] = useState<VerificationStatus>('input')
  const [propertyName, setPropertyName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Handle code input changes
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only allow digits

    const newCode = [...code]
    newCode[index] = value.slice(-1) // Only take last character
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData) {
      const newCode = pastedData.split('').concat(Array(6 - pastedData.length).fill(''))
      setCode(newCode)
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus()
    }
  }

  const verifyEmail = async () => {
    const verificationCode = code.join('')
    if (verificationCode.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }

    if (!applicationId) {
      setError('Invalid verification link')
      setStatus('error')
      return
    }

    setStatus('verifying')
    setError(null)

    try {
      const response = await fetch('/api/applications/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, code: verificationCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 410) {
          setStatus('expired')
        } else if (response.status === 429) {
          setError('Too many attempts. Please request a new code.')
          setStatus('error')
        } else {
          setError(data.error || 'Verification failed')
          setStatus('input')
        }
        return
      }

      if (data.alreadyVerified) {
        setStatus('already_verified')
      } else {
        setStatus('success')
      }

      if (data.propertyName) {
        setPropertyName(data.propertyName)
      }
    } catch {
      setError('An error occurred during verification')
      setStatus('input')
    }
  }

  // Check for missing applicationId on mount
  useEffect(() => {
    if (!applicationId) {
      setError('Invalid verification link. Please check your email for the correct link.')
      setStatus('error')
    }
  }, [applicationId])

  // Code input state
  if (status === 'input') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="relative inline-block mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <KeyRound className="w-10 h-10 text-white" />
            </div>
            <motion.div
              className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 -z-10"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">Enter Verification Code</h2>
          <p className="text-muted-foreground mb-8">
            We sent a 6-digit code to your email. Enter it below to verify your application.
          </p>

          <div className="flex justify-center gap-2 mb-6">
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-bold border-2 focus:border-emerald-500 focus:ring-emerald-500"
              />
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm mb-6"
            >
              {error}
            </motion.div>
          )}

          <Button
            onClick={verifyEmail}
            disabled={code.join('').length !== 6}
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium shadow-lg shadow-emerald-500/25"
          >
            Verify Email
          </Button>

          <p className="text-sm text-muted-foreground mt-6">
            Didn&apos;t receive the code? Check your spam folder or contact the property manager.
          </p>
        </motion.div>
      </div>
    )
  }

  // Verifying state
  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <motion.div
              className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 -z-10"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Verifying your email...</h2>
          <p className="text-muted-foreground mt-2">This will only take a moment</p>
        </motion.div>
      </div>
    )
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="relative inline-block mb-8"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <motion.div
              className="absolute -inset-3 rounded-[32px] bg-gradient-to-r from-emerald-500/30 to-teal-500/30 -z-10"
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -right-2 -top-2"
            >
              <Sparkles className="w-8 h-8 text-amber-500" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Email Verified!
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Your application for {propertyName || 'the property'} is now complete.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl border border-border p-6 mb-6 shadow-lg text-left"
          >
            <h3 className="font-semibold text-foreground mb-4">What happens next?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Application Review</p>
                  <p className="text-sm text-muted-foreground">The property manager will review your application.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Screening Process</p>
                  <p className="text-sm text-muted-foreground">Background and credit checks may be performed.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Home className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Decision Notification</p>
                  <p className="text-sm text-muted-foreground">You&apos;ll receive an email with the decision.</p>
                </div>
              </li>
            </ul>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-muted-foreground"
          >
            You can close this window. We&apos;ll notify you via email about your application status.
          </motion.p>
        </motion.div>
      </div>
    )
  }

  // Already verified state
  if (status === 'already_verified') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Already Verified</h2>
          <p className="text-muted-foreground mb-6">
            Your email has already been verified. Your application is being processed.
          </p>
          <p className="text-sm text-muted-foreground">
            You&apos;ll receive an email when there&apos;s an update on your application.
          </p>
        </motion.div>
      </div>
    )
  }

  // Expired state
  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30">
            <Clock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Link Expired</h2>
          <p className="text-muted-foreground mb-6">
            This verification link has expired. Verification links are valid for 24 hours.
          </p>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800">
              Please contact the property manager to request a new verification email.
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Error state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
          <AlertCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Verification Failed</h2>
        <p className="text-muted-foreground mb-6">{error || 'An error occurred during verification.'}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
        >
          Go to Homepage
        </Link>
      </motion.div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
