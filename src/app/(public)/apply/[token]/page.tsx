'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Bed,
  Bath,
  Square,
  DollarSign,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { ApplicationWizard } from '@/components/applications/ApplicationWizard'
import type { ApplicationLinkInfo, ApplicationFormData } from '@/components/applications/ApplicationWizard/types'
import { cn } from '@/lib/utils'

type PageStatus = 'loading' | 'loaded' | 'error' | 'submitted'

export default function PublicApplyPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [status, setStatus] = useState<PageStatus>('loading')
  const [linkInfo, setLinkInfo] = useState<ApplicationLinkInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLinkInfo() {
      try {
        const response = await fetch(`/api/applications/public/${token}`)

        if (!response.ok) {
          const data = await response.json()
          setError(data.error || 'Failed to load application')
          setStatus('error')
          return
        }

        const data = await response.json()
        setLinkInfo(data)
        setStatus('loaded')
      } catch {
        setError('Failed to load application. Please try again later.')
        setStatus('error')
      }
    }

    if (token) {
      fetchLinkInfo()
    }
  }, [token])

  const handleSubmit = async (formData: ApplicationFormData) => {
    try {
      const response = await fetch('/api/applications/public/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, formData }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit application')
      }

      // Clear localStorage on successful submission
      localStorage.removeItem(`application_${token}`)

      // Get the email for the success screen
      const email = formData.personalInfo?.email || ''
      setSubmittedEmail(email)
      setStatus('submitted')
    } catch (error) {
      throw error
    }
  }

  // Loading state
  if (status === 'loading') {
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
          <h2 className="text-xl font-semibold text-slate-800">Loading Application...</h2>
          <p className="text-muted-foreground mt-2">Please wait a moment</p>
        </motion.div>
      </div>
    )
  }

  // Error state
  if (status === 'error') {
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
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Unable to Load Application</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
          >
            Go to Homepage
          </button>
        </motion.div>
      </div>
    )
  }

  // Success state - after submission
  if (status === 'submitted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center"
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
              Application Submitted!
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Thank you for your application. We&apos;ve sent a verification email to:
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl border border-emerald-200 p-6 mb-8 shadow-lg"
          >
            <p className="text-xl font-semibold text-emerald-700 mb-2">
              {submittedEmail}
            </p>
            <p className="text-sm text-muted-foreground">
              Please check your inbox and click the verification link to complete your application.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Didn&apos;t receive the email?</strong> Check your spam folder or contact the property manager.
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              You can close this window. We&apos;ll notify you about your application status via email.
            </p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // Main form state
  if (!linkInfo) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">
                  {linkInfo.organization.name}
                </h1>
                <p className="text-xs text-muted-foreground">Rental Application</p>
              </div>
            </div>
            {linkInfo.applicationFee && linkInfo.applicationFee > 0 && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Application Fee</p>
                <p className="font-semibold text-foreground">
                  ${linkInfo.applicationFee}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Property Info Sidebar - Desktop */}
          <AnimatePresence>
            {linkInfo.unit && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block"
              >
                <div className="sticky top-28">
                  <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-xl shadow-slate-200/50">
                    {/* Property Image */}
                    {linkInfo.unit.property.imageUrl ? (
                      <div className="relative h-48 bg-muted">
                        <img
                          src={linkInfo.unit.property.imageUrl}
                          alt={linkInfo.unit.property.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="font-bold text-white text-lg">
                            {linkInfo.unit.property.name}
                          </h3>
                          {linkInfo.unit.unitNumber && (
                            <p className="text-white/90 text-sm">
                              Unit {linkInfo.unit.unitNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-white/50" />
                      </div>
                    )}

                    {/* Property Details */}
                    <div className="p-5 space-y-4">
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">
                          {linkInfo.unit.property.address}
                          <br />
                          {linkInfo.unit.property.city}, {linkInfo.unit.property.state} {linkInfo.unit.property.zipCode}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                          <Bed className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">
                            {linkInfo.unit.bedrooms} Bed
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                          <Bath className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">
                            {linkInfo.unit.bathrooms} Bath
                          </span>
                        </div>
                      </div>

                      {linkInfo.unit.squareFeet && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                          <Square className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">
                            {linkInfo.unit.squareFeet.toLocaleString()} sq ft
                          </span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Monthly Rent</span>
                          <div className="flex items-center gap-1 text-emerald-600">
                            <DollarSign className="w-5 h-5" />
                            <span className="text-2xl font-bold">
                              {linkInfo.unit.rent.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Mobile Property Card */}
          {linkInfo.unit && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:hidden"
            >
              <div className="rounded-2xl bg-card border border-border p-4 shadow-lg">
                <div className="flex items-center gap-4">
                  {linkInfo.unit.property.imageUrl ? (
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={linkInfo.unit.property.imageUrl}
                        alt={linkInfo.unit.property.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-8 h-8 text-white/50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {linkInfo.unit.property.name}
                    </h3>
                    {linkInfo.unit.unitNumber && (
                      <p className="text-sm text-muted-foreground">
                        Unit {linkInfo.unit.unitNumber}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Bed className="w-3 h-3" />
                        {linkInfo.unit.bedrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-3 h-3" />
                        {linkInfo.unit.bathrooms}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <DollarSign className="w-3 h-3" />
                        {linkInfo.unit.rent.toLocaleString()}/mo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Application Wizard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              'bg-card rounded-2xl border border-border shadow-xl shadow-slate-200/50 overflow-hidden',
              linkInfo.unit ? 'lg:col-span-2' : 'lg:col-span-3 max-w-2xl mx-auto w-full'
            )}
          >
            <ApplicationWizard
              token={token}
              linkInfo={linkInfo}
              onSubmit={handleSubmit}
            />
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              Powered by{' '}
              <a
                href="https://happytenant.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                HappyTenant.AI
              </a>
            </p>
            <div className="flex items-center gap-4">
              <a href="/legal/privacy" className="hover:text-muted-foreground">
                Privacy Policy
              </a>
              <a href="/legal/terms" className="hover:text-muted-foreground">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
