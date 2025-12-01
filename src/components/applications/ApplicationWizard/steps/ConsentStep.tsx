'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  Shield,
  FileSearch,
  CreditCard,
  Calendar,
  Clock,
  MessageSquare,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { consentSchema, type ConsentInput } from '@/lib/schemas/application'
import type { ApplicationFormData, ApplicationLinkInfo } from '../types'
import { cn } from '@/lib/utils'

const LEASE_TERM_OPTIONS = [
  { value: 6, label: '6 months' },
  { value: 12, label: '12 months (1 year)' },
  { value: 18, label: '18 months' },
  { value: 24, label: '24 months (2 years)' },
]

const HOW_DID_YOU_HEAR_OPTIONS = [
  'Zillow',
  'Apartments.com',
  'Trulia',
  'Facebook Marketplace',
  'Craigslist',
  'For Rent Sign',
  'Word of Mouth',
  'Google Search',
  'Other',
]

interface ConsentStepProps {
  formData: ApplicationFormData
  updateStepData: <K extends keyof ApplicationFormData>(
    key: K,
    data: Partial<ApplicationFormData[K]>
  ) => void
  linkInfo: ApplicationLinkInfo
  onSubmit: () => Promise<void>
  isSubmitting: boolean
}

export function ConsentStep({
  formData,
  updateStepData,
  linkInfo,
  onSubmit,
  isSubmitting,
}: ConsentStepProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ConsentInput>({
    resolver: zodResolver(consentSchema),
    defaultValues: formData.consent as ConsentInput,
  })

  const consentToBackgroundCheck = watch('consentToBackgroundCheck')
  const consentToCreditCheck = watch('consentToCreditCheck')

  const handleFormSubmit = (data: ConsentInput) => {
    updateStepData('consent', data)
    onSubmit()
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

  // Summary of entered data
  const summary = {
    name: `${formData.personalInfo.firstName || ''} ${formData.personalInfo.lastName || ''}`.trim(),
    email: formData.personalInfo.email,
    phone: formData.personalInfo.phone,
    income: formData.employment.monthlyIncome,
    employer: formData.employment.employerName,
    currentAddress: formData.rentalHistory.currentAddress,
    pets: formData.additionalInfo.hasPets ? formData.additionalInfo.pets?.length || 0 : 0,
    vehicles: formData.additionalInfo.hasVehicles
      ? formData.additionalInfo.vehicles?.length || 0
      : 0,
    occupants: formData.additionalInfo.additionalOccupants?.length || 0,
    documents: formData.documents.uploadedDocuments?.length || 0,
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Application Summary */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Application Summary</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Applicant
              </p>
              <p className="font-medium text-foreground">{summary.name || 'Not provided'}</p>
              <p className="text-sm text-muted-foreground">{summary.email}</p>
              <p className="text-sm text-muted-foreground">{summary.phone}</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Employment
              </p>
              <p className="font-medium text-foreground">
                ${summary.income?.toLocaleString() || 0}/month
              </p>
              <p className="text-sm text-muted-foreground">
                {summary.employer || 'Not provided'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Current Address
              </p>
              <p className="text-sm text-muted-foreground">
                {summary.currentAddress || 'Not provided'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Additional Info
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{summary.pets} pet(s)</p>
                <p>{summary.vehicles} vehicle(s)</p>
                <p>{summary.occupants} additional occupant(s)</p>
                <p>{summary.documents} document(s) uploaded</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Move-in Details */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Move-in Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="desiredMoveInDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Desired Move-in Date *
              </Label>
              <Input
                id="desiredMoveInDate"
                type="date"
                {...register('desiredMoveInDate')}
                className="h-12 rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500"
              />
              {errors.desiredMoveInDate && (
                <p className="text-sm text-red-500">{errors.desiredMoveInDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Lease Term *
              </Label>
              <Select
                value={watch('desiredLeaseTermMonths')?.toString() || ''}
                onValueChange={(value) =>
                  setValue('desiredLeaseTermMonths', parseInt(value))
                }
              >
                <SelectTrigger className="h-12 rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500">
                  <SelectValue placeholder="Select lease term" />
                </SelectTrigger>
                <SelectContent>
                  {LEASE_TERM_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.desiredLeaseTermMonths && (
                <p className="text-sm text-red-500">
                  {errors.desiredLeaseTermMonths.message}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* How did you hear about us */}
        <motion.div variants={itemVariants} className="space-y-2">
          <Label className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            How did you hear about this property?
          </Label>
          <Select
            value={watch('howDidYouHear') || ''}
            onValueChange={(value) => setValue('howDidYouHear', value)}
          >
            <SelectTrigger className="h-12 rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {HOW_DID_YOU_HEAR_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Additional Comments */}
        <motion.div variants={itemVariants} className="space-y-2">
          <Label htmlFor="additionalComments">Additional Comments</Label>
          <Textarea
            id="additionalComments"
            {...register('additionalComments')}
            placeholder="Anything else you'd like us to know about your application?"
            className="rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500 min-h-[100px]"
          />
        </motion.div>

        {/* Consent Section */}
        <motion.div
          variants={itemVariants}
          className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 border border-border space-y-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-200">
              <Shield className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Authorization & Consent</h3>
              <p className="text-sm text-muted-foreground">
                Please review and consent to the following checks
              </p>
            </div>
          </div>

          {/* Background Check */}
          <div
            className={cn(
              'p-4 rounded-xl border-2 transition-all',
              consentToBackgroundCheck
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-card border-border'
            )}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id="consentToBackgroundCheck"
                checked={consentToBackgroundCheck}
                onCheckedChange={(checked) =>
                  setValue('consentToBackgroundCheck', checked as boolean)
                }
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label
                  htmlFor="consentToBackgroundCheck"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileSearch className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Background Check Authorization *</span>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  I authorize the landlord/property manager to conduct a criminal background
                  check and verify my rental history.
                </p>
              </div>
              {consentToBackgroundCheck && (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              )}
            </div>
          </div>
          {errors.consentToBackgroundCheck && (
            <p className="text-sm text-red-500 ml-7">
              {errors.consentToBackgroundCheck.message}
            </p>
          )}

          {/* Credit Check */}
          <div
            className={cn(
              'p-4 rounded-xl border-2 transition-all',
              consentToCreditCheck
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-card border-border'
            )}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id="consentToCreditCheck"
                checked={consentToCreditCheck}
                onCheckedChange={(checked) =>
                  setValue('consentToCreditCheck', checked as boolean)
                }
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label
                  htmlFor="consentToCreditCheck"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Credit Check Authorization *</span>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  I authorize the landlord/property manager to obtain my credit report from
                  one or more consumer reporting agencies.
                </p>
              </div>
              {consentToCreditCheck && (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              )}
            </div>
          </div>
          {errors.consentToCreditCheck && (
            <p className="text-sm text-red-500 ml-7">
              {errors.consentToCreditCheck.message}
            </p>
          )}
        </motion.div>

        {/* Application Fee Notice */}
        {linkInfo.applicationFee && linkInfo.applicationFee > 0 && (
          <motion.div
            variants={itemVariants}
            className="p-4 rounded-xl bg-amber-50 border border-amber-200"
          >
            <p className="text-sm text-amber-800">
              <strong>Application Fee:</strong> A non-refundable fee of $
              {linkInfo.applicationFee} will be charged upon submission.
            </p>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.div variants={itemVariants} className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || !consentToBackgroundCheck || !consentToCreditCheck}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 text-lg font-medium gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Application...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Submit Application
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-3">
            By submitting, you certify that all information provided is accurate and
            complete.
          </p>
        </motion.div>
      </motion.div>
    </form>
  )
}
