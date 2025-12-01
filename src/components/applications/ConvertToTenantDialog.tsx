'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, UserPlus, CheckCircle2, Building2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const leaseTypes = ['fixed', 'month_to_month'] as const

const convertSchema = z.object({
  leaseType: z.enum(leaseTypes, {
    message: 'Please select a lease type',
  }),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  rentAmount: z.number().min(1, 'Rent amount is required'),
  rentDueDay: z.number().min(1).max(28),
  securityDeposit: z.number().min(0),
  sendWelcomeEmail: z.boolean(),
  createUserAccount: z.boolean(),
})

type ConvertFormValues = z.infer<typeof convertSchema>

interface ConvertToTenantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: string
  applicantName: string
  applicantEmail: string
  unit?: {
    unitNumber: string
    rent: number
    property: {
      name: string
      address: string
    }
  }
  desiredMoveInDate?: string | null
  desiredLeaseTermMonths?: number | null
}

export function ConvertToTenantDialog({
  open,
  onOpenChange,
  applicationId,
  applicantName,
  applicantEmail,
  unit,
  desiredMoveInDate,
  desiredLeaseTermMonths,
}: ConvertToTenantDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [createdTenantId, setCreatedTenantId] = useState<string | null>(null)

  // Calculate default end date based on desired lease term
  const getDefaultEndDate = () => {
    if (!desiredMoveInDate || !desiredLeaseTermMonths) return ''
    const start = new Date(desiredMoveInDate)
    start.setMonth(start.getMonth() + desiredLeaseTermMonths)
    return start.toISOString().split('T')[0]
  }

  const form = useForm<ConvertFormValues>({
    resolver: zodResolver(convertSchema),
    defaultValues: {
      leaseType: 'fixed',
      startDate: desiredMoveInDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      endDate: getDefaultEndDate(),
      rentAmount: unit?.rent || 0,
      rentDueDay: 1,
      securityDeposit: unit?.rent || 0,
      sendWelcomeEmail: true,
      createUserAccount: true,
    },
  })

  const watchLeaseType = form.watch('leaseType')

  const onSubmit = async (data: ConvertFormValues) => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/applications/${applicationId}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to convert application')
      }

      const result = await res.json()
      setCreatedTenantId(result.tenantId)
      setStep('success')

      toast.success('Tenant created successfully!', {
        description: `${applicantName} has been converted to a tenant.`,
      })
    } catch (error) {
      toast.error('Failed to convert to tenant', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep('form')
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                Convert to Tenant
              </DialogTitle>
              <DialogDescription>
                Create a tenant record and lease for {applicantName}
              </DialogDescription>
            </DialogHeader>

            {/* Property/Unit Info */}
            {unit && (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-900">
                      {unit.property.name} - Unit {unit.unitNumber}
                    </p>
                    <p className="text-sm text-emerald-700">
                      {unit.property.address}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Lease Type */}
                <FormField
                  control={form.control}
                  name="leaseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lease Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select lease type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Term</SelectItem>
                          <SelectItem value="month_to_month">Month-to-Month</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchLeaseType === 'fixed' && (
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Financial */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rentAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Rent</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              className="pl-7"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="securityDeposit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Security Deposit</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              className="pl-7"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="rentDueDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rent Due Day</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(parseInt(val))}
                        defaultValue={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 5, 10, 15, 20, 25].map((day) => (
                            <SelectItem key={day} value={String(day)}>
                              {day === 1 ? '1st' : day === 15 ? '15th' : `${day}th`} of each month
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Options */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <FormField
                    control={form.control}
                    name="createUserAccount"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            Create tenant portal account
                          </FormLabel>
                          <FormDescription>
                            Allow tenant to access their portal with {applicantEmail}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sendWelcomeEmail"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            Send welcome email
                          </FormLabel>
                          <FormDescription>
                            Send lease details and portal login info to tenant
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Tenant & Lease
                  </Button>
                </div>
              </form>
            </Form>
          </>
        ) : (
          // Success state
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Tenant Created Successfully!
            </h3>
            <p className="text-muted-foreground mb-6">
              {applicantName} is now a tenant with an active lease.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/tenants/${createdTenantId}`)}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600"
              >
                View Tenant Profile
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
