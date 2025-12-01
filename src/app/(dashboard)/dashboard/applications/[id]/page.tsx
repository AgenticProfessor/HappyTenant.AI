'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  DollarSign,
  Home,
  Users,
  FileText,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  MessageSquare,
  Plus,
  Trash2,
  Edit3,
  Send,
  UserPlus,
  Loader2,
  Building2,
  Car,
  Dog,
  ShieldCheck,
  CreditCard,
  History,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { ScreeningEntryDialog } from '@/components/applications/ScreeningEntryDialog'
import { ConvertToTenantDialog } from '@/components/applications/ConvertToTenantDialog'

interface ApplicationDetail {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string | null
  driversLicense: string | null
  driversLicenseState: string | null
  status: string
  applicationDate: string
  emailVerified: boolean

  // Employment
  employmentStatus: string | null
  employerName: string | null
  employerPhone: string | null
  employerAddress: string | null
  jobTitle: string | null
  employmentStartDate: string | null
  monthlyIncome: number | null
  additionalIncome: number | null
  additionalIncomeSource: string | null

  // Current Address
  currentAddress: string | null
  currentCity: string | null
  currentState: string | null
  currentZip: string | null
  currentLandlordName: string | null
  currentLandlordPhone: string | null
  currentRent: number | null
  currentMoveInDate: string | null
  reasonForMoving: string | null
  rentalHistoryJson: Array<{
    address: string
    city: string
    state: string
    zip: string
    landlordName?: string
    landlordPhone?: string
    rent?: number
    moveInDate?: string
    moveOutDate?: string
    reasonForLeaving?: string
  }>

  // References
  referencesJson: Array<{
    name: string
    relationship: string
    phone?: string
    email?: string
    yearsKnown?: number
  }>

  // Additional Info
  hasPets: boolean
  petsJson: Array<{
    type: string
    breed: string
    weight?: number
    age?: number
    name?: string
  }>
  hasVehicles: boolean
  vehiclesJson: Array<{
    make: string
    model: string
    year: number
    color: string
    licensePlate?: string
    state?: string
  }>
  additionalOccupantsJson: Array<{
    firstName: string
    lastName: string
    relationship: string
    dateOfBirth?: string
  }>
  emergencyContactName: string | null
  emergencyContactRelationship: string | null
  emergencyContactPhone: string | null
  isSmoker: boolean
  hasBankruptcy: boolean
  bankruptcyExplanation: string | null
  hasEviction: boolean
  evictionExplanation: string | null
  hasCriminalHistory: boolean
  criminalHistoryExplanation: string | null

  // Documents
  documentsJson: Array<{
    type: string
    fileId: string
    fileName: string
  }>

  // Consent
  desiredMoveInDate: string | null
  desiredLeaseTermMonths: number | null
  howDidYouHear: string | null
  additionalComments: string | null
  consentToBackgroundCheck: boolean
  consentToCreditCheck: boolean

  // Relations
  unit?: {
    unitNumber: string
    bedrooms: number
    bathrooms: number
    rent: number
    property: {
      name: string
      address: string
      city: string
      state: string
    }
  }
  notes: Array<{
    id: string
    content: string
    createdAt: string
    createdBy: string
    isInternal: boolean
  }>
  statusHistory: Array<{
    id: string
    fromStatus: string
    toStatus: string
    changedBy: string
    reason: string | null
    createdAt: string
  }>
  screeningResults?: Array<{
    id: string
    provider: string
    requestId?: string
    creditScore?: number
    criminalCheck?: string
    evictionCheck?: string
    incomeVerification?: string
    overallResult: string
    riskLevel?: string
    notes?: string
    reviewedAt?: string
    completedAt?: string
  }>
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    color: 'amber',
    icon: Clock,
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    color: 'blue',
    icon: Eye,
    bgClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  APPROVED: {
    label: 'Approved',
    color: 'emerald',
    icon: CheckCircle2,
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'red',
    icon: XCircle,
    bgClass: 'bg-red-50 text-red-700 border-red-200',
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    color: 'slate',
    icon: AlertCircle,
    bgClass: 'bg-muted/50 text-muted-foreground border-border',
  },
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'history' | 'screening'>('overview')
  const [showScreeningDialog, setShowScreeningDialog] = useState(false)
  const [showConvertDialog, setShowConvertDialog] = useState(false)

  useEffect(() => {
    fetchApplication()
  }, [id])

  const fetchApplication = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/applications/${id}`)
      if (res.ok) {
        const data = await res.json()
        setApplication(data)
      } else {
        router.push('/dashboard/applications')
      }
    } catch (error) {
      console.error('Error fetching application:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!application || newStatus === application.status) return

    setIsUpdatingStatus(true)
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        await fetchApplication()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setIsSubmittingNote(true)
    try {
      const res = await fetch(`/api/applications/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote, isInternal: true }),
      })

      if (res.ok) {
        setNewNote('')
        await fetchApplication()
      }
    } catch (error) {
      console.error('Error adding note:', error)
    } finally {
      setIsSubmittingNote(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A'
    return `$${amount.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    )
  }

  if (!application) {
    return null
  }

  const statusConfig = STATUS_CONFIG[application.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING
  const StatusIcon = statusConfig.icon
  const totalIncome = (application.monthlyIncome || 0) + (application.additionalIncome || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/applications">
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">
                {application.firstName} {application.lastName}
              </h1>
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border',
                  statusConfig.bgClass
                )}
              >
                <StatusIcon className="w-4 h-4" />
                {statusConfig.label}
              </div>
              {!application.emailVerified && (
                <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">
                  Email Unverified
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {application.email}
              </span>
              {application.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {application.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Applied {formatDate(application.applicationDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={application.status}
            onValueChange={handleStatusChange}
            disabled={isUpdatingStatus}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
            </SelectContent>
          </Select>

          {application.status === 'APPROVED' && (
            <Button
              onClick={() => setShowConvertDialog(true)}
              className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600"
            >
              <UserPlus className="w-4 h-4" />
              Convert to Tenant
            </Button>
          )}
        </div>
      </div>

      {/* Property Info */}
      {application.unit && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-100">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900">
                {application.unit.property.name} - Unit {application.unit.unitNumber}
              </p>
              <p className="text-sm text-emerald-700">
                {application.unit.property.address}, {application.unit.property.city}, {application.unit.property.state}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-lg font-bold text-emerald-900">
                ${application.unit.rent.toLocaleString()}/mo
              </p>
              <p className="text-sm text-emerald-700">
                {application.unit.bedrooms} bed, {application.unit.bathrooms} bath
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'history', label: 'Activity', icon: History },
            { id: 'screening', label: 'Screening', icon: ShieldCheck },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
              className={cn(
                'flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors',
                selectedTab === tab.id
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-muted-foreground hover:text-muted-foreground'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {selectedTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Info */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Full Name</p>
                    <p className="font-medium">{application.firstName} {application.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Date of Birth</p>
                    <p className="font-medium">{formatDate(application.dateOfBirth)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                    <p className="font-medium">{application.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Phone</p>
                    <p className="font-medium">{application.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Driver&apos;s License</p>
                    <p className="font-medium">
                      {application.driversLicense ? `${application.driversLicense} (${application.driversLicenseState})` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Employment */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-muted-foreground" />
                  Employment & Income
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                    <p className="font-medium capitalize">{application.employmentStatus?.toLowerCase().replace('_', ' ') || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Employer</p>
                    <p className="font-medium">{application.employerName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Job Title</p>
                    <p className="font-medium">{application.jobTitle || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Start Date</p>
                    <p className="font-medium">{formatDate(application.employmentStartDate)}</p>
                  </div>
                  <div className="col-span-2 pt-4 border-t border-border">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Monthly Income</p>
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
                      </div>
                      {application.unit && totalIncome > 0 && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Income to Rent Ratio</p>
                          <p className={cn(
                            'text-lg font-bold',
                            totalIncome / application.unit.rent >= 3 ? 'text-emerald-600' : 'text-amber-600'
                          )}>
                            {(totalIncome / application.unit.rent).toFixed(1)}x
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Address */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  Current Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Address</p>
                    <p className="font-medium">
                      {application.currentAddress || 'N/A'}
                      {application.currentCity && `, ${application.currentCity}`}
                      {application.currentState && `, ${application.currentState}`}
                      {application.currentZip && ` ${application.currentZip}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Landlord</p>
                    <p className="font-medium">{application.currentLandlordName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Landlord Phone</p>
                    <p className="font-medium">{application.currentLandlordPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Rent</p>
                    <p className="font-medium">{formatCurrency(application.currentRent)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Move-in Date</p>
                    <p className="font-medium">{formatDate(application.currentMoveInDate)}</p>
                  </div>
                  {application.reasonForMoving && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Reason for Moving</p>
                      <p className="font-medium">{application.reasonForMoving}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* References */}
              {application.referencesJson.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    References ({application.referencesJson.length})
                  </h3>
                  <div className="space-y-4">
                    {application.referencesJson.map((ref, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{ref.name}</p>
                          <span className="text-sm text-muted-foreground">{ref.relationship}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {ref.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {ref.phone}
                            </span>
                          )}
                          {ref.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {ref.email}
                            </span>
                          )}
                          {ref.yearsKnown && (
                            <span>{ref.yearsKnown} years known</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  Additional Information
                </h3>

                {/* Pets */}
                {application.hasPets && application.petsJson.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Dog className="w-4 h-4" />
                      Pets ({application.petsJson.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {application.petsJson.map((pet, idx) => (
                        <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm">
                          {pet.name || pet.type} ({pet.breed})
                          {pet.weight && ` - ${pet.weight} lbs`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vehicles */}
                {application.hasVehicles && application.vehiclesJson.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      Vehicles ({application.vehiclesJson.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {application.vehiclesJson.map((vehicle, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.color})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Occupants */}
                {application.additionalOccupantsJson.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Additional Occupants ({application.additionalOccupantsJson.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {application.additionalOccupantsJson.map((occupant, idx) => (
                        <span key={idx} className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-sm">
                          {occupant.firstName} {occupant.lastName} ({occupant.relationship})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclosures */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className={cn(
                    'p-3 rounded-lg text-center',
                    application.isSmoker ? 'bg-red-50' : 'bg-emerald-50'
                  )}>
                    <p className={cn(
                      'font-medium',
                      application.isSmoker ? 'text-red-700' : 'text-emerald-700'
                    )}>
                      {application.isSmoker ? 'Smoker' : 'Non-Smoker'}
                    </p>
                  </div>
                  <div className={cn(
                    'p-3 rounded-lg text-center',
                    application.hasBankruptcy ? 'bg-red-50' : 'bg-emerald-50'
                  )}>
                    <p className={cn(
                      'font-medium',
                      application.hasBankruptcy ? 'text-red-700' : 'text-emerald-700'
                    )}>
                      {application.hasBankruptcy ? 'Bankruptcy' : 'No Bankruptcy'}
                    </p>
                  </div>
                  <div className={cn(
                    'p-3 rounded-lg text-center',
                    application.hasEviction ? 'bg-red-50' : 'bg-emerald-50'
                  )}>
                    <p className={cn(
                      'font-medium',
                      application.hasEviction ? 'text-red-700' : 'text-emerald-700'
                    )}>
                      {application.hasEviction ? 'Prior Eviction' : 'No Eviction'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Consent */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  Authorization & Consent
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={cn(
                    'p-4 rounded-lg flex items-center gap-3',
                    application.consentToBackgroundCheck ? 'bg-emerald-50' : 'bg-red-50'
                  )}>
                    {application.consentToBackgroundCheck ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={application.consentToBackgroundCheck ? 'text-emerald-700' : 'text-red-700'}>
                      Background Check
                    </span>
                  </div>
                  <div className={cn(
                    'p-4 rounded-lg flex items-center gap-3',
                    application.consentToCreditCheck ? 'bg-emerald-50' : 'bg-red-50'
                  )}>
                    {application.consentToCreditCheck ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={application.consentToCreditCheck ? 'text-emerald-700' : 'text-red-700'}>
                      Credit Check
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Desired Move-in</p>
                    <p className="font-medium">{formatDate(application.desiredMoveInDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Lease Term</p>
                    <p className="font-medium">
                      {application.desiredLeaseTermMonths ? `${application.desiredLeaseTermMonths} months` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Notes */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  Notes
                </h3>
                <div className="space-y-4">
                  <div>
                    <Textarea
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <Button
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || isSubmittingNote}
                      className="mt-2 w-full gap-2"
                    >
                      {isSubmittingNote ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Add Note
                    </Button>
                  </div>
                  {application.notes.length > 0 ? (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {application.notes.map((note) => (
                        <div key={note.id} className="p-3 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground">{note.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {note.createdBy} • {formatDate(note.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              {application.emergencyContactName && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    Emergency Contact
                  </h3>
                  <div className="space-y-2">
                    <p className="font-medium">{application.emergencyContactName}</p>
                    <p className="text-sm text-muted-foreground">{application.emergencyContactRelationship}</p>
                    <p className="text-sm text-muted-foreground">{application.emergencyContactPhone}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {selectedTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <h3 className="font-semibold text-foreground mb-6">Status History</h3>
            {application.statusHistory.length > 0 ? (
              <div className="space-y-4">
                {application.statusHistory.map((history, idx) => (
                  <div key={history.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      {idx < application.statusHistory.length - 1 && (
                        <div className="w-0.5 flex-1 bg-slate-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">
                          {history.fromStatus} → {history.toStatus}
                        </span>
                      </div>
                      {history.reason && (
                        <p className="text-sm text-muted-foreground mb-1">{history.reason}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {history.changedBy} • {formatDate(history.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No status changes recorded</p>
            )}
          </motion.div>
        )}

        {selectedTab === 'screening' && (
          <motion.div
            key="screening"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Screening Results */}
            {application.screeningResults && application.screeningResults.length > 0 ? (
              <div className="space-y-4">
                {application.screeningResults.map((result) => (
                  <div
                    key={result.id}
                    className="bg-card rounded-xl border border-border p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          Screening by {result.provider}
                        </h4>
                        {result.requestId && (
                          <p className="text-sm text-muted-foreground">Ref: {result.requestId}</p>
                        )}
                      </div>
                      <div className={cn(
                        'px-3 py-1 rounded-full text-sm font-medium',
                        result.overallResult === 'PASS' && 'bg-emerald-100 text-emerald-700',
                        result.overallResult === 'FAIL' && 'bg-red-100 text-red-700',
                        result.overallResult === 'REVIEW_NEEDED' && 'bg-blue-100 text-blue-700',
                        result.overallResult === 'PENDING' && 'bg-amber-100 text-amber-700',
                        result.overallResult === 'NOT_APPLICABLE' && 'bg-slate-100 text-muted-foreground'
                      )}>
                        {result.overallResult === 'PASS' && <CheckCircle2 className="w-4 h-4 inline mr-1" />}
                        {result.overallResult === 'FAIL' && <XCircle className="w-4 h-4 inline mr-1" />}
                        {result.overallResult === 'REVIEW_NEEDED' && <AlertTriangle className="w-4 h-4 inline mr-1" />}
                        {result.overallResult?.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {result.creditScore && (
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Credit Score</p>
                          <p className={cn(
                            'text-2xl font-bold',
                            result.creditScore >= 700 ? 'text-emerald-600' :
                            result.creditScore >= 650 ? 'text-amber-600' : 'text-red-600'
                          )}>
                            {result.creditScore}
                          </p>
                        </div>
                      )}
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Criminal</p>
                        <p className={cn(
                          'font-medium',
                          result.criminalCheck === 'PASS' ? 'text-emerald-600' :
                          result.criminalCheck === 'FAIL' ? 'text-red-600' : 'text-muted-foreground'
                        )}>
                          {result.criminalCheck?.replace('_', ' ') || 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Eviction</p>
                        <p className={cn(
                          'font-medium',
                          result.evictionCheck === 'PASS' ? 'text-emerald-600' :
                          result.evictionCheck === 'FAIL' ? 'text-red-600' : 'text-muted-foreground'
                        )}>
                          {result.evictionCheck?.replace('_', ' ') || 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Income</p>
                        <p className={cn(
                          'font-medium',
                          result.incomeVerification === 'PASS' ? 'text-emerald-600' :
                          result.incomeVerification === 'FAIL' ? 'text-red-600' : 'text-muted-foreground'
                        )}>
                          {result.incomeVerification?.replace('_', ' ') || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {result.riskLevel && (
                      <div className={cn(
                        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4',
                        result.riskLevel === 'LOW' && 'bg-emerald-100 text-emerald-700',
                        result.riskLevel === 'MEDIUM' && 'bg-amber-100 text-amber-700',
                        result.riskLevel === 'HIGH' && 'bg-red-100 text-red-700'
                      )}>
                        Risk Level: {result.riskLevel}
                      </div>
                    )}

                    {result.notes && (
                      <div className="p-4 rounded-lg bg-muted/50 mt-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                        <p className="text-muted-foreground">{result.notes}</p>
                      </div>
                    )}

                    {result.completedAt && (
                      <p className="text-xs text-muted-foreground mt-4">
                        Completed {formatDate(result.completedAt)}
                      </p>
                    )}
                  </div>
                ))}

                <Button
                  onClick={() => setShowScreeningDialog(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Screening
                </Button>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="text-center py-12">
                  <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Tenant Screening</h3>
                  <p className="text-muted-foreground mb-6">
                    Record background check, credit check, and income verification results
                  </p>
                  <Button
                    onClick={() => setShowScreeningDialog(true)}
                    className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600"
                  >
                    <CreditCard className="w-4 h-4" />
                    Enter Screening Results
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogs */}
      <ScreeningEntryDialog
        open={showScreeningDialog}
        onOpenChange={setShowScreeningDialog}
        applicationId={id}
        onSuccess={fetchApplication}
      />

      <ConvertToTenantDialog
        open={showConvertDialog}
        onOpenChange={setShowConvertDialog}
        applicationId={application.id}
        applicantName={`${application.firstName} ${application.lastName}`}
        applicantEmail={application.email}
        unit={application.unit}
        desiredMoveInDate={application.desiredMoveInDate}
        desiredLeaseTermMonths={application.desiredLeaseTermMonths}
      />
    </div>
  )
}
