'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Calendar, CreditCard, IdCard } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { personalInfoSchema, type PersonalInfoInput } from '@/lib/schemas/application'
import type { ApplicationFormData, ApplicationLinkInfo } from '../types'

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
]

interface PersonalInfoStepProps {
  formData: ApplicationFormData
  updateStepData: <K extends keyof ApplicationFormData>(
    key: K,
    data: Partial<ApplicationFormData[K]>
  ) => void
  linkInfo: ApplicationLinkInfo
  onNext: () => void
}

export function PersonalInfoStep({
  formData,
  updateStepData,
  onNext,
}: PersonalInfoStepProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PersonalInfoInput>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: formData.personalInfo as PersonalInfoInput,
  })

  const onSubmit = (data: PersonalInfoInput) => {
    updateStepData('personalInfo', data)
    onNext()
  }

  const formatSSN = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9)
    if (digits.length <= 3) return digits
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
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
        {/* Name Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4 text-muted-foreground" />
              First Name *
            </Label>
            <Input
              id="firstName"
              {...register('firstName')}
              placeholder="John"
              className="h-12 rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500"
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4 text-muted-foreground" />
              Last Name *
            </Label>
            <Input
              id="lastName"
              {...register('lastName')}
              placeholder="Doe"
              className="h-12 rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500"
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </motion.div>

        {/* Contact Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john@example.com"
              className="h-12 rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="(555) 123-4567"
              onChange={(e) => {
                const formatted = formatPhone(e.target.value)
                setValue('phone', formatted)
              }}
              className="h-12 rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500"
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>
        </motion.div>

        {/* Date of Birth */}
        <motion.div variants={itemVariants} className="space-y-2">
          <Label htmlFor="dateOfBirth" className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Date of Birth *
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...register('dateOfBirth')}
            className="h-12 rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500 max-w-xs"
          />
          {errors.dateOfBirth && (
            <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
          )}
        </motion.div>

        {/* SSN Section */}
        <motion.div
          variants={itemVariants}
          className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-100">
              <CreditCard className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-amber-900">Social Security Number</h3>
              <p className="text-sm text-amber-700">
                Required for background and credit checks. Your SSN is encrypted and secure.
              </p>
            </div>
          </div>
          <Input
            {...register('ssn')}
            placeholder="XXX-XX-XXXX"
            onChange={(e) => {
              const formatted = formatSSN(e.target.value)
              setValue('ssn', formatted)
            }}
            className="h-12 rounded-xl border-amber-200 bg-card focus:border-amber-500 focus:ring-amber-500 max-w-xs font-mono"
          />
          {errors.ssn && (
            <p className="text-sm text-red-500 mt-2">{errors.ssn.message}</p>
          )}
        </motion.div>

        {/* ID Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="driversLicense" className="flex items-center gap-2 text-muted-foreground">
              <IdCard className="w-4 h-4 text-muted-foreground" />
              Driver&apos;s License Number
            </Label>
            <Input
              id="driversLicense"
              {...register('driversLicense')}
              placeholder="License number"
              className="h-12 rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="driversLicenseState" className="text-muted-foreground">
              License State
            </Label>
            <Select
              value={watch('driversLicenseState') || ''}
              onValueChange={(value) => setValue('driversLicenseState', value)}
            >
              <SelectTrigger className="h-12 rounded-xl border-border focus:border-emerald-500 focus:ring-emerald-500">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      </motion.div>

      {/* Hidden submit button - form is submitted via parent navigation */}
      <button type="submit" className="hidden" id="submit-personal-info" />
    </form>
  )
}
