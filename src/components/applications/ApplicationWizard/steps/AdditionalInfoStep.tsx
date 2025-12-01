'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PawPrint,
  Car,
  Users,
  Phone,
  Plus,
  Trash2,
  AlertTriangle,
  Heart,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { additionalInfoSchema, type AdditionalInfoInput } from '@/lib/schemas/application'
import type { ApplicationFormData, ApplicationLinkInfo } from '../types'

const PET_TYPES = ['Dog', 'Cat', 'Bird', 'Fish', 'Reptile', 'Small Animal', 'Other']
const RELATIONSHIP_OPTIONS = ['Spouse', 'Partner', 'Child', 'Parent', 'Sibling', 'Roommate', 'Other']

interface AdditionalInfoStepProps {
  formData: ApplicationFormData
  updateStepData: <K extends keyof ApplicationFormData>(
    key: K,
    data: Partial<ApplicationFormData[K]>
  ) => void
  linkInfo: ApplicationLinkInfo
  onNext: () => void
}

export function AdditionalInfoStep({
  formData,
  updateStepData,
  onNext,
}: AdditionalInfoStepProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdditionalInfoInput>({
    resolver: zodResolver(additionalInfoSchema),
    defaultValues: {
      hasPets: formData.additionalInfo.hasPets ?? false,
      pets: formData.additionalInfo.pets ?? [],
      hasVehicles: formData.additionalInfo.hasVehicles ?? false,
      vehicles: formData.additionalInfo.vehicles ?? [],
      additionalOccupants: formData.additionalInfo.additionalOccupants ?? [],
      emergencyContactName: formData.additionalInfo.emergencyContactName ?? '',
      emergencyContactPhone: formData.additionalInfo.emergencyContactPhone ?? '',
      emergencyContactRelation: formData.additionalInfo.emergencyContactRelation ?? '',
    },
  })

  const {
    fields: petFields,
    append: appendPet,
    remove: removePet,
  } = useFieldArray({ control, name: 'pets' })

  const {
    fields: vehicleFields,
    append: appendVehicle,
    remove: removeVehicle,
  } = useFieldArray({ control, name: 'vehicles' })

  const {
    fields: occupantFields,
    append: appendOccupant,
    remove: removeOccupant,
  } = useFieldArray({ control, name: 'additionalOccupants' })

  const hasPets = watch('hasPets')
  const hasVehicles = watch('hasVehicles')

  const onSubmit = (data: AdditionalInfoInput) => {
    updateStepData('additionalInfo', data)
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
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Emergency Contact - Required */}
        <motion.div
          variants={itemVariants}
          className="p-5 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-red-100">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-medium text-red-900">Emergency Contact *</h3>
              <p className="text-sm text-red-700">
                Someone we can contact in case of emergency
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Full Name *</Label>
              <Input
                id="emergencyContactName"
                {...register('emergencyContactName')}
                placeholder="Jane Doe"
                className="h-12 rounded-xl border-red-200 bg-card focus:border-red-500 focus:ring-red-500"
              />
              {errors.emergencyContactName && (
                <p className="text-sm text-red-500">{errors.emergencyContactName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Phone *
              </Label>
              <Input
                id="emergencyContactPhone"
                {...register('emergencyContactPhone')}
                placeholder="(555) 123-4567"
                className="h-12 rounded-xl border-red-200 bg-card focus:border-red-500 focus:ring-red-500"
              />
              {errors.emergencyContactPhone && (
                <p className="text-sm text-red-500">{errors.emergencyContactPhone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactRelation">Relationship *</Label>
              <Select
                value={watch('emergencyContactRelation') || ''}
                onValueChange={(value) => setValue('emergencyContactRelation', value)}
              >
                <SelectTrigger className="h-12 rounded-xl border-red-200 bg-card focus:border-red-500 focus:ring-red-500">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.emergencyContactRelation && (
                <p className="text-sm text-red-500">{errors.emergencyContactRelation.message}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Pets Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <PawPrint className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-amber-900">Pets</h3>
                <p className="text-sm text-amber-700">Do you have any pets?</p>
              </div>
            </div>
            <Switch
              checked={hasPets}
              onCheckedChange={(checked) => setValue('hasPets', checked)}
            />
          </div>

          <AnimatePresence>
            {hasPets && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {petFields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-xl bg-muted/50 border border-border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Pet #{index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePet(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Type *</Label>
                        <Select
                          value={watch(`pets.${index}.type`) || ''}
                          onValueChange={(value) => setValue(`pets.${index}.type`, value)}
                        >
                          <SelectTrigger className="h-10 rounded-lg">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {PET_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Name</Label>
                        <Input
                          {...register(`pets.${index}.name`)}
                          placeholder="Buddy"
                          className="h-10 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Breed</Label>
                        <Input
                          {...register(`pets.${index}.breed`)}
                          placeholder="Golden Retriever"
                          className="h-10 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Weight (lbs)</Label>
                        <Input
                          type="number"
                          {...register(`pets.${index}.weight`, { valueAsNumber: true })}
                          placeholder="50"
                          className="h-10 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={watch(`pets.${index}.isServiceAnimal`) || false}
                        onCheckedChange={(checked) => setValue(`pets.${index}.isServiceAnimal`, checked)}
                      />
                      <Label className="text-sm text-muted-foreground">Service/Emotional Support Animal</Label>
                    </div>
                  </motion.div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendPet({ type: '', name: '', breed: '', weight: undefined, isServiceAnimal: false })}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Pet
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Vehicles Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Car className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Vehicles</h3>
                <p className="text-sm text-blue-700">Do you have any vehicles?</p>
              </div>
            </div>
            <Switch
              checked={hasVehicles}
              onCheckedChange={(checked) => setValue('hasVehicles', checked)}
            />
          </div>

          <AnimatePresence>
            {hasVehicles && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {vehicleFields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-xl bg-muted/50 border border-border"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-muted-foreground">Vehicle #{index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVehicle(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Make *</Label>
                        <Input
                          {...register(`vehicles.${index}.make`)}
                          placeholder="Toyota"
                          className="h-10 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Model *</Label>
                        <Input
                          {...register(`vehicles.${index}.model`)}
                          placeholder="Camry"
                          className="h-10 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Year</Label>
                        <Input
                          type="number"
                          {...register(`vehicles.${index}.year`, { valueAsNumber: true })}
                          placeholder="2020"
                          className="h-10 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Color</Label>
                        <Input
                          {...register(`vehicles.${index}.color`)}
                          placeholder="Silver"
                          className="h-10 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="space-y-1">
                        <Label className="text-xs">License Plate</Label>
                        <Input
                          {...register(`vehicles.${index}.licensePlate`)}
                          placeholder="ABC-1234"
                          className="h-10 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">State</Label>
                        <Input
                          {...register(`vehicles.${index}.state`)}
                          placeholder="TX"
                          className="h-10 rounded-lg"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendVehicle({ make: '', model: '', year: undefined, color: '', licensePlate: '', state: '' })}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Vehicle
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Additional Occupants */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Additional Occupants</h3>
                <p className="text-sm text-slate-500">Anyone else who will live with you</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendOccupant({ name: '', relationship: '', age: undefined, occupation: '' })}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>

          <AnimatePresence>
            {occupantFields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4 rounded-xl bg-muted/50 border border-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Occupant #{index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOccupant(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Name *</Label>
                    <Input
                      {...register(`additionalOccupants.${index}.name`)}
                      placeholder="Full name"
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Relationship *</Label>
                    <Select
                      value={watch(`additionalOccupants.${index}.relationship`) || ''}
                      onValueChange={(value) => setValue(`additionalOccupants.${index}.relationship`, value)}
                    >
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_OPTIONS.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Age</Label>
                    <Input
                      type="number"
                      {...register(`additionalOccupants.${index}.age`, { valueAsNumber: true })}
                      placeholder="25"
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Occupation</Label>
                    <Input
                      {...register(`additionalOccupants.${index}.occupation`)}
                      placeholder="Student, etc."
                      className="h-10 rounded-lg"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {occupantFields.length === 0 && (
            <div className="text-center py-6 text-muted-foreground bg-muted/50 rounded-xl border-2 border-dashed border-border">
              <Heart className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No additional occupants</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      <button type="submit" className="hidden" id="submit-additional-info" />
    </form>
  )
}
