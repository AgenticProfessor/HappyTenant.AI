'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react'

const screeningCheckResults = ['PENDING', 'PASS', 'FAIL', 'REVIEW_NEEDED', 'NOT_APPLICABLE'] as const
const riskLevels = ['LOW', 'MEDIUM', 'HIGH'] as const
const providers = ['Internal', 'TransUnion', 'Experian', 'Equifax', 'RentPrep', 'Other'] as const

const screeningSchema = z.object({
  provider: z.enum(providers, {
    message: 'Please select a screening provider',
  }),
  requestId: z.string().optional(),
  creditScore: z.number().min(300).max(850).optional().nullable(),
  criminalCheck: z.enum(screeningCheckResults, {
    message: 'Please select a result',
  }),
  evictionCheck: z.enum(screeningCheckResults, {
    message: 'Please select a result',
  }),
  incomeVerification: z.enum(screeningCheckResults, {
    message: 'Please select a result',
  }),
  overallResult: z.enum(screeningCheckResults, {
    message: 'Please select an overall result',
  }),
  riskLevel: z.enum(riskLevels).optional().nullable(),
  notes: z.string().optional(),
})

type ScreeningFormValues = z.infer<typeof screeningSchema>

interface ScreeningEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: string
  onSuccess?: () => void
}

const resultLabels: Record<typeof screeningCheckResults[number], { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'text-amber-600' },
  PASS: { label: 'Pass', color: 'text-emerald-600' },
  FAIL: { label: 'Fail', color: 'text-red-600' },
  REVIEW_NEEDED: { label: 'Review Needed', color: 'text-blue-600' },
  NOT_APPLICABLE: { label: 'N/A', color: 'text-muted-foreground' },
}

const riskLabels: Record<typeof riskLevels[number], { label: string; color: string }> = {
  LOW: { label: 'Low Risk', color: 'text-emerald-600' },
  MEDIUM: { label: 'Medium Risk', color: 'text-amber-600' },
  HIGH: { label: 'High Risk', color: 'text-red-600' },
}

export function ScreeningEntryDialog({
  open,
  onOpenChange,
  applicationId,
  onSuccess,
}: ScreeningEntryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ScreeningFormValues>({
    resolver: zodResolver(screeningSchema),
    defaultValues: {
      provider: 'Internal',
      requestId: '',
      creditScore: null,
      criminalCheck: 'PENDING',
      evictionCheck: 'PENDING',
      incomeVerification: 'PENDING',
      overallResult: 'PENDING',
      riskLevel: null,
      notes: '',
    },
  })

  const onSubmit = async (data: ScreeningFormValues) => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/applications/${applicationId}/screening`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to save screening results')
      }

      toast.success('Screening results saved', {
        description: 'The screening results have been recorded successfully.',
      })

      onOpenChange(false)
      form.reset()
      onSuccess?.()
    } catch (error) {
      toast.error('Failed to save screening results', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const watchOverallResult = form.watch('overallResult')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Enter Screening Results
          </DialogTitle>
          <DialogDescription>
            Record background check, credit check, and income verification results.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Provider Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Screening Provider</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requestId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="External reference number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Credit Score */}
            <FormField
              control={form.control}
              name="creditScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credit Score</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={300}
                      max={850}
                      placeholder="300-850"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const val = e.target.value
                        field.onChange(val ? parseInt(val) : null)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the applicant&apos;s credit score (300-850)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Check Results */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Screening Check Results</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="criminalCheck"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Criminal Check</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select result" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {screeningCheckResults.map((result) => (
                            <SelectItem key={result} value={result}>
                              <span className={resultLabels[result].color}>
                                {resultLabels[result].label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evictionCheck"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eviction Check</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select result" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {screeningCheckResults.map((result) => (
                            <SelectItem key={result} value={result}>
                              <span className={resultLabels[result].color}>
                                {resultLabels[result].label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="incomeVerification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Income Verification</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select result" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {screeningCheckResults.map((result) => (
                            <SelectItem key={result} value={result}>
                              <span className={resultLabels[result].color}>
                                {resultLabels[result].label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Overall Result & Risk Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
              <FormField
                control={form.control}
                name="overallResult"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Result</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select overall result" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {screeningCheckResults.map((result) => (
                          <SelectItem key={result} value={result}>
                            <span className={resultLabels[result].color}>
                              {resultLabels[result].label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="riskLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {riskLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            <span className={riskLabels[level].color}>
                              {riskLabels[level].label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about the screening results..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Warning for failed results */}
            {(watchOverallResult === 'FAIL' || watchOverallResult === 'REVIEW_NEEDED') && (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Review Required</p>
                  <p className="text-sm text-amber-700">
                    {watchOverallResult === 'FAIL'
                      ? 'This applicant has failed the screening. Consider documenting the specific reasons before proceeding.'
                      : 'Additional review is needed before making a decision on this application.'}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
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
                Save Results
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
