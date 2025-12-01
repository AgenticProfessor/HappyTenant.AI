'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  CreditCard,
  Wrench,
  MessageSquare,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Shield,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { useTenantAuth, useTenantDashboard } from '@/contexts/tenant-auth-context';
import { cn } from '@/lib/utils';

/**
 * Premium Tenant Dashboard
 * Beautiful, animated, data-driven dashboard for tenant portal
 */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export function TenantDashboard() {
  const { tenant, activeLease, balance, isLoading, error } = useTenantAuth();
  const { daysUntilRentDue, leaseProgress, monthsRemaining, paymentStatus } = useTenantDashboard();

  if (isLoading) {
    return <TenantDashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unable to Load Dashboard</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (!tenant || !activeLease) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Active Lease</h2>
        <p className="text-muted-foreground">Please contact your property manager for assistance.</p>
      </div>
    );
  }

  const firstName = tenant.firstName || 'Tenant';

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {firstName}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your rental.
          </p>
        </div>
        <Link href="/tenant/payments">
          <Button className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
            <CreditCard className="h-4 w-4 mr-2" />
            Pay Rent
          </Button>
        </Link>
      </motion.div>

      {/* Property Info Hero */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
          <CardContent className="relative p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Property Icon */}
              <div className="relative">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                  <Building2 className="h-12 w-12 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center ring-2 ring-white">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Property Details */}
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-xl font-bold">{activeLease.property.name}</h2>
                  <p className="text-muted-foreground">
                    {activeLease.unit.name} • {activeLease.unit.bedrooms} bed, {activeLease.unit.bathrooms} bath
                    {activeLease.unit.squareFeet && ` • ${activeLease.unit.squareFeet.toLocaleString()} sq ft`}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {activeLease.property.address}, {activeLease.property.city}, {activeLease.property.state} {activeLease.property.zipCode}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>
                      Lease ends {new Date(activeLease.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">${activeLease.rentAmount.toLocaleString()}/month</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-row lg:flex-col gap-2">
                <Link href="/tenant/documents" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    View Lease
                  </Button>
                </Link>
                <Link href="/tenant/messages" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </Link>
              </div>
            </div>

            {/* Lease Progress */}
            {leaseProgress !== null && (
              <div className="mt-6 pt-4 border-t border-primary/10">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Lease Progress</span>
                  <span className="font-medium">{monthsRemaining} months remaining</span>
                </div>
                <Progress value={leaseProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Next Payment"
          value={`$${balance?.nextDueAmount?.toLocaleString() || '0'}`}
          subtitle={daysUntilRentDue !== null ? `Due in ${daysUntilRentDue} days` : 'Loading...'}
          icon={CreditCard}
          trend={paymentStatus === 'current' ? 'positive' : paymentStatus === 'overdue' ? 'negative' : undefined}
        />
        <StatCard
          title="Payment Status"
          value={paymentStatus === 'current' ? 'Current' : paymentStatus === 'due' ? 'Due' : 'Overdue'}
          subtitle={paymentStatus === 'current' ? 'All payments up to date' : 'Payment required'}
          icon={paymentStatus === 'current' ? CheckCircle2 : paymentStatus === 'overdue' ? AlertCircle : Clock}
          valueClassName={
            paymentStatus === 'current' ? 'text-green-600' :
            paymentStatus === 'overdue' ? 'text-red-600' : 'text-amber-600'
          }
          iconClassName={
            paymentStatus === 'current' ? 'text-green-500' :
            paymentStatus === 'overdue' ? 'text-red-500' : 'text-amber-500'
          }
        />
        <StatCard
          title="Security Deposit"
          value={`$${activeLease.securityDeposit.toLocaleString()}`}
          subtitle="Held on account"
          icon={Shield}
        />
        <StatCard
          title="Lease Duration"
          value={`${monthsRemaining || 0} months`}
          subtitle="Remaining on lease"
          icon={Calendar}
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Summary */}
          <motion.div variants={itemVariants}>
            <PaymentSummaryCard balance={balance} lease={activeLease} />
          </motion.div>

          {/* Maintenance Requests */}
          <motion.div variants={itemVariants}>
            <MaintenanceRequestsCard />
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <QuickActionsCard />
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <ContactInfoCard property={activeLease.property} />
          </motion.div>

          {/* AI Assistant */}
          <motion.div variants={itemVariants}>
            <AIAssistantCard />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// Sub-components

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  valueClassName,
  iconClassName,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  trend?: 'positive' | 'negative';
  valueClassName?: string;
  iconClassName?: string;
}) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn('h-4 w-4 text-muted-foreground', iconClassName)} />
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', valueClassName)}>{value}</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {trend === 'positive' && <TrendingUp className="h-3 w-3 text-green-500" />}
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
}

function PaymentSummaryCard({
  balance,
  lease,
}: {
  balance: any;
  lease: any;
}) {
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Summary</CardTitle>
        <CardDescription>Your rent payment for {currentMonth}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border">
          <div>
            <p className="font-semibold">Monthly Rent</p>
            <p className="text-sm text-muted-foreground">
              Due {lease.rentDueDay === 1 ? '1st' : `${lease.rentDueDay}th`} of each month
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">${lease.rentAmount.toLocaleString()}</p>
            <Badge variant={balance?.currentDue > 0 ? 'destructive' : 'outline'}>
              {balance?.currentDue > 0 ? 'Due' : 'Upcoming'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border bg-green-50 dark:bg-green-950/20">
            <p className="text-sm text-muted-foreground">Paid This Year</p>
            <p className="text-xl font-bold text-green-600">
              ${(lease.rentAmount * 11).toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-xl border">
            <p className="text-sm text-muted-foreground">Security Deposit</p>
            <p className="text-xl font-bold">${lease.securityDeposit.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Link href="/tenant/payments" className="flex-1">
            <Button className="w-full shadow-lg shadow-primary/10">
              <CreditCard className="h-4 w-4 mr-2" />
              Pay Now
            </Button>
          </Link>
          <Link href="/tenant/payments?setup=autopay">
            <Button variant="outline">Set Up AutoPay</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function MaintenanceRequestsCard() {
  // Mock data - in production, fetch from API
  const requests = [
    { id: '1', title: 'Leaky faucet in bathroom', status: 'in_progress', createdAt: '2024-11-20' },
    { id: '2', title: 'AC not cooling properly', status: 'completed', createdAt: '2024-11-15' },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Maintenance Requests</CardTitle>
          <CardDescription>Track your service requests</CardDescription>
        </div>
        <Link href="/tenant/maintenance">
          <Button variant="ghost" size="sm" className="gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-10 w-10 rounded-xl flex items-center justify-center',
                    request.status === 'open' ? 'bg-red-100 dark:bg-red-950' :
                    request.status === 'in_progress' ? 'bg-amber-100 dark:bg-amber-950' :
                    'bg-green-100 dark:bg-green-950'
                  )}>
                    {request.status === 'open' ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : request.status === 'in_progress' ? (
                      <Clock className="h-5 w-5 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{request.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    request.status === 'open' ? 'destructive' :
                    request.status === 'in_progress' ? 'default' : 'secondary'
                  }
                >
                  {request.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No maintenance requests</p>
            <Link href="/tenant/maintenance">
              <Button className="mt-4">Submit a Request</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActionsCard() {
  const actions = [
    { label: 'Pay Rent', icon: CreditCard, href: '/tenant/payments' },
    { label: 'Submit Request', icon: Wrench, href: '/tenant/maintenance' },
    { label: 'Send Message', icon: MessageSquare, href: '/tenant/messages' },
    { label: 'View Documents', icon: FileText, href: '/tenant/documents' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Button variant="outline" className="w-full justify-start hover:bg-muted/50 transition-colors">
              <action.icon className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function ContactInfoCard({ property }: { property: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{property.managerName}</p>
            <p className="text-sm text-muted-foreground">Property Management</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <a href={`tel:${property.managerPhone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{property.managerPhone}</span>
          </a>
          <a href={`mailto:${property.managerEmail}`} className="flex items-center gap-2 hover:text-primary transition-colors">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{property.managerEmail}</span>
          </a>
        </div>
        {property.emergencyPhone && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-1">Emergency Maintenance</p>
            <a href={`tel:${property.emergencyPhone}`} className="font-semibold text-red-600 hover:underline">
              {property.emergencyPhone}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AIAssistantCard() {
  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Get instant answers</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Ask anything about your lease, payments, maintenance, and more.
        </p>
        <Button className="w-full">
          <MessageSquare className="h-4 w-4 mr-2" />
          Start Chat
        </Button>
      </CardContent>
    </Card>
  );
}

function TenantDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      <Skeleton className="h-48 w-full rounded-xl" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
