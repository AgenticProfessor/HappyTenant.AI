'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  Link as LinkIcon,
  Building2,
  DollarSign,
  Calendar,
  Users,
  Loader2,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface Unit {
  id: string
  unitNumber: string
  property: {
    id: string
    name: string
  }
}

interface CreateApplicationLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateApplicationLinkDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateApplicationLinkDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [units, setUnits] = useState<Unit[]>([])
  const [isLoadingUnits, setIsLoadingUnits] = useState(true)

  // Form state
  const [name, setName] = useState('')
  const [unitId, setUnitId] = useState<string>('')
  const [applicationFee, setApplicationFee] = useState<number>(0)
  const [collectFeeOnline, setCollectFeeOnline] = useState(false)
  const [maxApplications, setMaxApplications] = useState<number | undefined>()
  const [expiresAt, setExpiresAt] = useState<string>('')

  // Fetch units for dropdown
  useEffect(() => {
    async function fetchUnits() {
      setIsLoadingUnits(true)
      try {
        const response = await fetch('/api/properties?includeUnits=true')
        if (response.ok) {
          const data = await response.json()
          // Flatten units from all properties
          const allUnits: Unit[] = []
          for (const property of data.properties || []) {
            for (const unit of property.units || []) {
              allUnits.push({
                id: unit.id,
                unitNumber: unit.unitNumber,
                property: {
                  id: property.id,
                  name: property.name,
                },
              })
            }
          }
          setUnits(allUnits)
        }
      } catch (error) {
        console.error('Error fetching units:', error)
      } finally {
        setIsLoadingUnits(false)
      }
    }

    if (open) {
      fetchUnits()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/applications/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || undefined,
          unitId: unitId || undefined,
          applicationFee: applicationFee > 0 ? applicationFee : undefined,
          collectFeeOnline: applicationFee > 0 ? collectFeeOnline : false,
          maxApplications: maxApplications || undefined,
          expiresAt: expiresAt || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create link')
      }

      toast.success('Application link created!')
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create link')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setName('')
    setUnitId('')
    setApplicationFee(0)
    setCollectFeeOnline(false)
    setMaxApplications(undefined)
    setExpiresAt('')
  }

  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={() => onOpenChange(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-card rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Create Application Link</h2>
                <p className="text-sm text-muted-foreground">
                  Generate a shareable link for applicants
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Link Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Link Name (Optional)</Label>
            <Input
              id="name"
              placeholder="e.g., Spring 2024 Listings"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Help identify this link in your dashboard
            </p>
          </div>

          {/* Unit Selection */}
          <div className="space-y-2">
            <Label htmlFor="unit">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Specific Unit (Optional)
              </div>
            </Label>
            <Select value={unitId} onValueChange={setUnitId}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingUnits ? 'Loading...' : 'Any unit'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any unit (organization-wide)</SelectItem>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.property.name} - Unit {unit.unitNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Application Fee */}
          <div className="space-y-4 p-4 rounded-xl bg-muted/50 border border-border">
            <div className="space-y-2">
              <Label htmlFor="applicationFee">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Application Fee
                </div>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="applicationFee"
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  placeholder="0"
                  className="pl-7"
                  value={applicationFee || ''}
                  onChange={(e) => setApplicationFee(Number(e.target.value) || 0)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Typical fees range from $25-$55 per application
              </p>
            </div>

            {applicationFee > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-800">
                      Collect fee online
                    </p>
                    <p className="text-xs text-emerald-600">
                      Applicants pay via credit card before applying
                    </p>
                  </div>
                </div>
                <Switch
                  checked={collectFeeOnline}
                  onCheckedChange={setCollectFeeOnline}
                />
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div className="grid grid-cols-2 gap-4">
            {/* Max Applications */}
            <div className="space-y-2">
              <Label htmlFor="maxApplications">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  Max Applications
                </div>
              </Label>
              <Input
                id="maxApplications"
                type="number"
                min="1"
                placeholder="Unlimited"
                value={maxApplications || ''}
                onChange={(e) => setMaxApplications(Number(e.target.value) || undefined)}
              />
            </div>

            {/* Expiration */}
            <div className="space-y-2">
              <Label htmlFor="expiresAt">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Expires On
                </div>
              </Label>
              <Input
                id="expiresAt"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Create Link
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
