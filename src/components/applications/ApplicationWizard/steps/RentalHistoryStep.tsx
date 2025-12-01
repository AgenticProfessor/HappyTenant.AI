'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, MapPin, User, Phone, DollarSign, Plus, Trash2, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { rentalHistoryStepSchema, type RentalHistoryStepInput } from '@/lib/schemas/application'
import type { ApplicationFormData, ApplicationLinkInfo } from '../types'

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
]

interface RentalHistoryStepProps {
  formData: ApplicationFormData
  updateStepData: <K extends keyof ApplicationFormData>(
    key: K,
    data: Partial<ApplicationFormData[K]>
  ) => void
  linkInfo: ApplicationLinkInfo
  onNext: () => void
}

export function RentalHistoryStep({
  formData,
  updateStepData,
  onNext,
}: RentalHistoryStepProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RentalHistoryStepInput>({
    resolver: zodResolver(rentalHistoryStepSchema),
    defaultValues: {
      ...formData.rentalHistory,
      rentalHistory: formData.rentalHistory.rentalHistory || [],
    } as RentalHistoryStepInput,
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rentalHistory',
  })

  const onSubmit = (data: RentalHistoryStepInput) => {
    updateStepData('rentalHistory', data)
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
        {/* Current Address Section */}
        <motion.div
          variants={itemVariants}
          className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100">
              <Home className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Current Address</h3>
              <p className="text-sm text-blue-700">Where you currently live</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentAddress" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Street Address *
              </Label>
              <Input
                id="currentAddress"
                {...register('currentAddress')}
                placeholder="123 Main Street, Apt 4B"
                className="h-12 rounded-xl border-blue-200 bg-card focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.currentAddress && (
                <p className="text-sm text-red-500">{errors.currentAddress.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="currentCity">City *</Label>
                <Input
                  id="currentCity"
                  {...register('currentCity')}
                  placeholder="City"
                  className="h-12 rounded-xl border-blue-200 bg-card focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentState">State *</Label>
                <Select
                  value={watch('currentState') || ''}
                  onValueChange={(value) => setValue('currentState', value)}
                >
                  <SelectTrigger className="h-12 rounded-xl border-blue-200 bg-card focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="State" />
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
              <div className="space-y-2">
                <Label htmlFor="currentZip">ZIP *</Label>
                <Input
                  id="currentZip"
                  {...register('currentZip')}
                  placeholder="12345"
                  className="h-12 rounded-xl border-blue-200 bg-card focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-blue-200">
              <div className="space-y-2">
                <Label htmlFor="currentLandlordName" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Landlord Name
                </Label>
                <Input
                  id="currentLandlordName"
                  {...register('currentLandlordName')}
                  placeholder="Property manager or owner name"
                  className="h-12 rounded-xl border-blue-200 bg-card focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentLandlordPhone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Landlord Phone
                </Label>
                <Input
                  id="currentLandlordPhone"
                  {...register('currentLandlordPhone')}
                  placeholder="(555) 123-4567"
                  className="h-12 rounded-xl border-blue-200 bg-card focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentRent" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  Monthly Rent
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="currentRent"
                    type="number"
                    {...register('currentRent', { valueAsNumber: true })}
                    placeholder="1,500"
                    className="h-12 pl-8 rounded-xl border-blue-200 bg-card focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentMoveInDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Move-in Date
                </Label>
                <Input
                  id="currentMoveInDate"
                  type="date"
                  {...register('currentMoveInDate')}
                  className="h-12 rounded-xl border-blue-200 bg-card focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reasonForMoving">Reason for Moving</Label>
              <Textarea
                id="reasonForMoving"
                {...register('reasonForMoving')}
                placeholder="Why are you looking for a new place?"
                className="rounded-xl border-blue-200 bg-card focus:border-blue-500 focus:ring-blue-500 min-h-[80px]"
              />
            </div>
          </div>
        </motion.div>

        {/* Previous Addresses */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Previous Addresses</h3>
              <p className="text-sm text-muted-foreground">
                Add your rental history for the past 2-3 years
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  address: '',
                  city: '',
                  state: '',
                  zip: '',
                  landlordName: '',
                  landlordPhone: '',
                  rent: undefined,
                  moveInDate: '',
                  moveOutDate: '',
                  reasonForLeaving: '',
                })
              }
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Address
            </Button>
          </div>

          <AnimatePresence mode="popLayout">
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-5 rounded-xl bg-muted/50 border border-border space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Previous Address #{index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Street Address *</Label>
                  <Input
                    {...register(`rentalHistory.${index}.address`)}
                    placeholder="123 Previous St"
                    className="h-11 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="col-span-2 space-y-2">
                    <Label>City</Label>
                    <Input
                      {...register(`rentalHistory.${index}.city`)}
                      placeholder="City"
                      className="h-11 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input
                      {...register(`rentalHistory.${index}.state`)}
                      placeholder="ST"
                      className="h-11 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ZIP</Label>
                    <Input
                      {...register(`rentalHistory.${index}.zip`)}
                      placeholder="12345"
                      className="h-11 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Landlord Name</Label>
                    <Input
                      {...register(`rentalHistory.${index}.landlordName`)}
                      placeholder="Name"
                      className="h-11 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Landlord Phone</Label>
                    <Input
                      {...register(`rentalHistory.${index}.landlordPhone`)}
                      placeholder="(555) 123-4567"
                      className="h-11 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Monthly Rent</Label>
                    <Input
                      type="number"
                      {...register(`rentalHistory.${index}.rent`, { valueAsNumber: true })}
                      placeholder="1,200"
                      className="h-11 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Move-in Date</Label>
                    <Input
                      type="date"
                      {...register(`rentalHistory.${index}.moveInDate`)}
                      className="h-11 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Move-out Date</Label>
                    <Input
                      type="date"
                      {...register(`rentalHistory.${index}.moveOutDate`)}
                      className="h-11 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reason for Leaving</Label>
                  <Input
                    {...register(`rentalHistory.${index}.reasonForLeaving`)}
                    placeholder="Why did you move?"
                    className="h-11 rounded-lg"
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {fields.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-muted-foreground bg-muted/50 rounded-xl border-2 border-dashed border-border"
            >
              <Home className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No previous addresses added</p>
              <p className="text-sm">Click &quot;Add Address&quot; to include your rental history</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      <button type="submit" className="hidden" id="submit-rental-history" />
    </form>
  )
}
