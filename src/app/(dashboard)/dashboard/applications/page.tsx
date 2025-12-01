'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  FileText,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Building2,
  Calendar,
  Mail,
  Phone,
  ChevronRight,
  MoreVertical,
  Eye,
  Copy,
  RefreshCw,
  Link as LinkIcon,
  ExternalLink,
  Users,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { CreateApplicationLinkDialog } from '@/components/applications/CreateApplicationLinkDialog'

interface Application {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  status: string
  applicationDate: string
  emailVerified: boolean
  unit?: {
    unitNumber: string
    property: {
      name: string
    }
  }
  applicationLink?: {
    name: string
  }
  _count?: {
    notes: number
  }
}

interface ApplicationLink {
  id: string
  token: string
  name: string | null
  isActive: boolean
  applicationsReceived: number
  maxApplications: number | null
  unit?: {
    unitNumber: string
    property: {
      name: string
    }
  }
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    color: 'amber',
    icon: Clock,
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    color: 'blue',
    icon: Eye,
    bgClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
  },
  APPROVED: {
    label: 'Approved',
    color: 'emerald',
    icon: CheckCircle2,
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'red',
    icon: XCircle,
    bgClass: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500',
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    color: 'slate',
    icon: AlertCircle,
    bgClass: 'bg-muted/50 text-slate-700 border-border',
    dotClass: 'bg-muted/500',
  },
}

export default function ApplicationsDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [applicationLinks, setApplicationLinks] = useState<ApplicationLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showLinksDialog, setShowLinksDialog] = useState(false)
  const [showCreateLinkDialog, setShowCreateLinkDialog] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [appsRes, linksRes] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/applications/links'),
      ])

      if (appsRes.ok) {
        const appsData = await appsRes.json()
        setApplications(appsData)
      }

      if (linksRes.ok) {
        const linksData = await linksRes.json()
        setApplicationLinks(linksData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        searchQuery === '' ||
        `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.phone?.includes(searchQuery)

      const matchesStatus = statusFilter === 'all' || app.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [applications, searchQuery, statusFilter])

  const stats = useMemo(() => {
    const total = applications.length
    const pending = applications.filter((a) => a.status === 'PENDING').length
    const underReview = applications.filter((a) => a.status === 'UNDER_REVIEW').length
    const approved = applications.filter((a) => a.status === 'APPROVED').length
    const rejected = applications.filter((a) => a.status === 'REJECTED').length

    return { total, pending, underReview, approved, rejected }
  }, [applications])

  const copyLinkToClipboard = (token: string) => {
    const url = `${window.location.origin}/apply/${token}`
    navigator.clipboard.writeText(url)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applications</h1>
          <p className="text-muted-foreground">Manage rental applications and application links</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowLinksDialog(true)}
            className="gap-2"
          >
            <LinkIcon className="w-4 h-4" />
            Application Links
            {applicationLinks.filter((l) => l.isActive).length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                {applicationLinks.filter((l) => l.isActive).length}
              </span>
            )}
          </Button>
          <Button
            className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            onClick={() => setShowCreateLinkDialog(true)}
          >
            <Plus className="w-4 h-4" />
            Create Link
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-card border border-border shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-card border border-border shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-card border border-border shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.underReview}</p>
              <p className="text-xs text-muted-foreground">Reviewing</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-card border border-border shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-card border border-border shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchData}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Applications List */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No matching applications' : 'No applications yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create an application link and share it with potential tenants'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600"
                onClick={() => setShowCreateLinkDialog(true)}
              >
                <Plus className="w-4 h-4" />
                Create Application Link
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredApplications.map((application, index) => {
              const statusConfig = STATUS_CONFIG[application.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING
              const StatusIcon = statusConfig.icon

              return (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/dashboard/applications/${application.id}`}
                    className="block p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                        {application.firstName[0]}
                        {application.lastName[0]}
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">
                            {application.firstName} {application.lastName}
                          </h3>
                          {!application.emailVerified && (
                            <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                              Unverified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {application.email}
                          </span>
                          {application.phone && (
                            <span className="flex items-center gap-1 hidden sm:flex">
                              <Phone className="w-3 h-3" />
                              {application.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Property */}
                      <div className="hidden md:block text-right">
                        {application.unit ? (
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {application.unit.property.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Unit {application.unit.unitNumber}
                            </p>
                          </div>
                        ) : application.applicationLink?.name ? (
                          <p className="text-sm text-muted-foreground">{application.applicationLink.name}</p>
                        ) : null}
                      </div>

                      {/* Date */}
                      <div className="hidden lg:block text-right">
                        <p className="text-xs text-muted-foreground">Applied</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(application.applicationDate)}
                        </p>
                      </div>

                      {/* Status */}
                      <div
                        className={cn(
                          'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border',
                          statusConfig.bgClass
                        )}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Application Links Dialog */}
      <AnimatePresence>
        {showLinksDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowLinksDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Application Links</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Share these links with potential tenants
                    </p>
                  </div>
                  <Button
                    className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600"
                    onClick={() => {
                      setShowLinksDialog(false)
                      setShowCreateLinkDialog(true)
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    New Link
                  </Button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {applicationLinks.length === 0 ? (
                  <div className="text-center py-8">
                    <LinkIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No application links yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applicationLinks.map((link) => (
                      <div
                        key={link.id}
                        className={cn(
                          'p-4 rounded-xl border',
                          link.isActive
                            ? 'border-emerald-200 bg-emerald-50/50'
                            : 'border-border bg-muted/50'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center',
                              link.isActive ? 'bg-emerald-100' : 'bg-slate-200'
                            )}
                          >
                            <LinkIcon
                              className={cn(
                                'w-5 h-5',
                                link.isActive ? 'text-emerald-600' : 'text-muted-foreground'
                              )}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground">
                                {link.name || 'Untitled Link'}
                              </h4>
                              {!link.isActive && (
                                <span className="px-2 py-0.5 text-xs bg-slate-200 text-muted-foreground rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                            {link.unit && (
                              <p className="text-sm text-muted-foreground">
                                {link.unit.property.name} - Unit {link.unit.unitNumber}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {link.applicationsReceived} application(s) received
                              {link.maxApplications && ` / ${link.maxApplications} max`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyLinkToClipboard(link.token)}
                              className="gap-2"
                            >
                              <Copy className="w-3 h-3" />
                              Copy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/apply/${link.token}`, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border bg-muted/50">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowLinksDialog(false)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Link Dialog */}
      <CreateApplicationLinkDialog
        open={showCreateLinkDialog}
        onOpenChange={setShowCreateLinkDialog}
        onSuccess={() => {
          fetchData()
        }}
      />
    </div>
  )
}
