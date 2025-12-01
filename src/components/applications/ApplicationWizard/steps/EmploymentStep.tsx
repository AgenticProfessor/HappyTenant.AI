'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Briefcase, Building2, DollarSign, Clock, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  employmentSchema,
  employmentStatusOptions,
  type EmploymentInput,
} from '@/lib/schemas/application'
import type { ApplicationFormData, ApplicationLinkInfo } from '../types'

const EMPLOYMENT_STATUS_LABELS: Record<string, string> = {
  EMPLOYED_FULL_TIME: 'Employed Full-Time',
  EMPLOYED_PART_TIME: 'Employed Part-Time',
  SELF_EMPLOYED: 'Self-Employed',
  UNEMPLOYED: 'Unemployed',
  RETIRED: 'Retired',
  STUDENT: 'Student',
  OTHER: 'Other',
}

interface EmploymentStepProps {
  formData: ApplicationFormData
  updateStepData: <K extends keyof ApplicationFormData>(
    key: K,
    data: Partial<ApplicationFormData[K]>
  ) => void
  linkInfo: ApplicationLinkInfo
  onNext: () => void
}

export function EmploymentStep({
  formData,
  updateStepData,
  onNext,
}: EmploymentStepProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmploymentInput>({
    resolver: zodResolver(employmentSchema),
    defaultValues: formData.employment as EmploymentInput,
  })

  const employmentStatus = watch('employmentStatus')
  const showEmployerFields =
    employmentStatus === 'EMPLOYED_FULL_TIME' ||
    employmentStatus === 'EMPLOYED_PART_TIME' ||
    employmentStatus === 'SELF_EMPLOYED'

  const onSubmit = (data: EmploymentInput) => {
    updateStepData('employment', data)
    onNext()
  }

  const formatCurrency = (value: string) => {
    const digits = value.replace(/\D/g, '')
    return digits ? Number(digits).toLocaleString() : ''
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Employment Status */}
        <motion.div variants={itemVariants} className="space-y-2">
          <Label className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            Employment Status *
          </Label>
          <Select
            value={watch('employmentStatus') || ''}
            onValueChange={(value) =>
              setValue('employmentStatus', value as EmploymentInput['employmentStatus'])
            }
          >
            <SelectTrigger className="h-12 rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500">
              <SelectValue placeholder="Select your employment status" />
            </SelectTrigger>
            <SelectContent>
              {employmentStatusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {EMPLOYMENT_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.employmentStatus && (
            <p className="text-sm text-red-500">{errors.employmentStatus.message}</p>
          )}
        </motion.div>

        {/* Employer Details */}
        {showEmployerFields && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 p-5 rounded-2xl bg-muted/50 border border-border"
          >
            <div className="flex items-center gap-2 text-muted-foreground font-medium">
              <Building2 className="w-4 h-4 text-emerald-500" />
              Employer Information
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employerName">
                  {employmentStatus === 'SELF_EMPLOYED'
                    ? 'Business Name'
                    : 'Employer Name'}
                </Label>
                <Input
                  id="employerName"
                  {...register('employerName')}
                  placeholder={
                    employmentStatus === 'SELF_EMPLOYED'
                      ? 'Your business name'
                      : 'Company name'
                  }
                  className="h-12 rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  {...register('jobTitle')}
                  placeholder="Your position"
                  className="h-12 rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employerPhone">Employer Phone</Label>
                <Input
                  id="employerPhone"
                  {...register('employerPhone')}
                  placeholder="(555) 123-4567"
                  className="h-12 rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsAtJob">
                  <Clock className="w-4 h-4 inline mr-1 text-muted-foreground" />
                  Years at Current Job
                </Label>
                <Input
                  id="yearsAtJob"
                  type="number"
                  min="0"
                  step="0.5"
                  {...register('yearsAtJob', { valueAsNumber: true })}
                  placeholder="2.5"
                  className="h-12 rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employerAddress">Employer Address</Label>
              <Input
                id="employerAddress"
                {...register('employerAddress')}
                placeholder="123 Business St, City, State ZIP"
                className="h-12 rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </motion.div>
        )}

        {/* Income Section */}
        <motion.div
          variants={itemVariants}
          className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-100">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-medium text-emerald-900">Monthly Income</h3>
              <p className="text-sm text-emerald-700">
                Enter your gross monthly income before taxes
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">Primary Income *</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="monthlyIncome"
                  {...register('monthlyIncome', { valueAsNumber: true })}
                  placeholder="5,000"
                  onChange={(e) => {
                    const formatted = formatCurrency(e.target.value)
                    e.target.value = formatted
                    setValue(
                      'monthlyIncome',
                      formatted ? Number(formatted.replace(/,/g, '')) : 0
                    )
                  }}
                  className="h-12 pl-8 rounded-xl border-emerald-200 bg-card focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              {errors.monthlyIncome && (
                <p className="text-sm text-red-500">{errors.monthlyIncome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalIncome" className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-muted-foreground" />
                Additional Income
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="additionalIncome"
                  {...register('additionalIncome', { valueAsNumber: true })}
                  placeholder="0"
                  onChange={(e) => {
                    const formatted = formatCurrency(e.target.value)
                    e.target.value = formatted
                    setValue(
                      'additionalIncome',
                      formatted ? Number(formatted.replace(/,/g, '')) : 0
                    )
                  }}
                  className="h-12 pl-8 rounded-xl border-emerald-200 bg-card focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {watch('additionalIncome') && watch('additionalIncome')! > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 space-y-2"
            >
              <Label htmlFor="additionalIncomeSource">Source of Additional Income</Label>
              <Input
                id="additionalIncomeSource"
                {...register('additionalIncomeSource')}
                placeholder="e.g., Part-time job, investments, rental income"
                className="h-12 rounded-xl border-emerald-200 bg-card focus:border-emerald-500 focus:ring-emerald-500"
              />
            </motion.div>
          )}

          {/* Total Income Display */}
          <div className="mt-4 pt-4 border-t border-emerald-200">
            <div className="flex justify-between items-center">
              <span className="text-emerald-700 font-medium">Total Monthly Income</span>
              <span className="text-2xl font-bold text-emerald-700">
                ${((watch('monthlyIncome') || 0) + (watch('additionalIncome') || 0)).toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <button type="submit" className="hidden" id="submit-employment" />
    </form>
  )
}
