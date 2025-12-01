'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, User, Phone, Mail, Clock, Plus, Trash2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { referencesStepSchema, type ReferencesStepInput } from '@/lib/schemas/application'
import type { ApplicationFormData, ApplicationLinkInfo } from '../types'

const RELATIONSHIP_OPTIONS = [
  'Employer',
  'Supervisor',
  'Coworker',
  'Former Landlord',
  'Personal Friend',
  'Family Member',
  'Professional Contact',
  'Other',
]

interface ReferencesStepProps {
  formData: ApplicationFormData
  updateStepData: <K extends keyof ApplicationFormData>(
    key: K,
    data: Partial<ApplicationFormData[K]>
  ) => void
  linkInfo: ApplicationLinkInfo
  onNext: () => void
}

export function ReferencesStep({
  formData,
  updateStepData,
  onNext,
}: ReferencesStepProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReferencesStepInput>({
    resolver: zodResolver(referencesStepSchema),
    defaultValues: {
      references: formData.references.references?.length
        ? formData.references.references
        : [
            { name: '', relationship: '', phone: '', email: '' },
            { name: '', relationship: '', phone: '', email: '' },
          ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'references',
  })

  const onSubmit = (data: ReferencesStepInput) => {
    updateStepData('references', data)
    onNext()
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
        {/* Header Info */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-violet-100">
              <Users className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-medium text-violet-900">References Required</h3>
              <p className="text-sm text-violet-700">
                Please provide at least 2 references who can speak to your character and
                reliability. Include at least one professional reference (employer, landlord, etc.)
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error message if not enough references */}
        {errors.references?.root && (
          <motion.div
            variants={itemVariants}
            className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700">{errors.references.root.message}</p>
          </motion.div>
        )}

        {/* References List */}
        <AnimatePresence mode="popLayout">
          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              variants={itemVariants}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">
                      Reference #{index + 1}
                    </span>
                    {index < 2 && (
                      <span className="text-xs text-red-500 ml-2">Required</span>
                    )}
                  </div>
                </div>
                {index >= 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Full Name *
                  </Label>
                  <Input
                    {...register(`references.${index}.name`)}
                    placeholder="John Smith"
                    className="h-12 rounded-xl border-border focus:border-violet-500 focus:ring-violet-500"
                  />
                  {errors.references?.[index]?.name && (
                    <p className="text-sm text-red-500">
                      {errors.references[index]?.name?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Relationship *</Label>
                  <Select
                    value={watch(`references.${index}.relationship`) || ''}
                    onValueChange={(value) =>
                      setValue(`references.${index}.relationship`, value)
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl border-border focus:border-violet-500 focus:ring-violet-500">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.references?.[index]?.relationship && (
                    <p className="text-sm text-red-500">
                      {errors.references[index]?.relationship?.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Phone Number
                  </Label>
                  <Input
                    {...register(`references.${index}.phone`)}
                    placeholder="(555) 123-4567"
                    className="h-12 rounded-xl border-border focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    {...register(`references.${index}.email`)}
                    placeholder="john@example.com"
                    className="h-12 rounded-xl border-border focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  How long have you known this person?
                </Label>
                <Input
                  type="number"
                  min="0"
                  {...register(`references.${index}.yearsKnown`, { valueAsNumber: true })}
                  placeholder="Years"
                  className="h-12 rounded-xl border-border focus:border-violet-500 focus:ring-violet-500 max-w-[120px]"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Reference Button */}
        <motion.div variants={itemVariants}>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({ name: '', relationship: '', phone: '', email: '' })
            }
            className="w-full h-14 rounded-xl border-2 border-dashed border-slate-300 hover:border-violet-400 hover:bg-violet-50 gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Another Reference
          </Button>
        </motion.div>

        {/* Tips */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl bg-muted/50 border border-border"
        >
          <h4 className="font-medium text-muted-foreground mb-2">Tips for Strong References</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Include at least one previous landlord or property manager</li>
            <li>• Professional references (employer, supervisor) carry weight</li>
            <li>• Make sure your references know they may be contacted</li>
            <li>• Provide accurate contact information</li>
          </ul>
        </motion.div>
      </motion.div>

      <button type="submit" className="hidden" id="submit-references" />
    </form>
  )
}
