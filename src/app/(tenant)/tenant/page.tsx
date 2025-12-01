'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Home,
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
  Building2,
  Phone,
  Mail,
} from 'lucide-react';
import { useTenantAuth, useTenantDashboard } from '@/contexts/tenant-auth-context';
import { useMaintenanceRequests } from '@/hooks/api/use-maintenance';

export default function TenantDashboardPage() {
  const { tenant, activeLease, balance, isLoading, error } = useTenantAuth();
  const { daysUntilRentDue, monthsRemaining, paymentStatus } = useTenantDashboard();

  // Fetch maintenance requests for the tenant
  const { data: maintenanceData, isLoading: isLoadingMaintenance } = useMaintenanceRequests({
    tenantId: tenant?.id,
  });

  const maintenanceRequests = maintenanceData?.requests || [];
  const openRequests = maintenanceRequests.filter(
    (r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
  );

  if (isLoading) {
    return <TenantDashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Unable to Load Dashboard</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {tenant?.firstName || 'Tenant'}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your rental.
          </p>
        </div>
        <Link href="/tenant/payments">
          <Button>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay Rent
          </Button>
        </Link>
      </div>

      {/* Property Info Card */}
      {activeLease && (
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="h-24 w-24 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{activeLease.property.name}</h2>
                <p className="text-muted-foreground">
                  {activeLease.unit.name} &bull; {activeLease.unit.bedrooms} bed,{' '}
                  {activeLease.unit.bathrooms} bath
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeLease.property.address}, {activeLease.property.city},{' '}
                  {activeLease.property.state} {activeLease.property.zipCode}
                </p>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Lease ends {new Date(activeLease.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${activeLease.rentAmount.toLocaleString()}/month</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/tenant/documents">
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    View Lease
                  </Button>
                </Link>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Landlord
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next Payment
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${balance?.nextDueAmount?.toLocaleString() || activeLease?.rentAmount?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {daysUntilRentDue !== null ? `Due in ${daysUntilRentDue} days` : 'No upcoming payment'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payment Status
            </CardTitle>
            {paymentStatus === 'current' ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : paymentStatus === 'due' ? (
              <Clock className="h-4 w-4 text-amber-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                paymentStatus === 'current'
                  ? 'text-green-600'
                  : paymentStatus === 'due'
                  ? 'text-amber-600'
                  : 'text-red-600'
              }`}
            >
              {paymentStatus === 'current'
                ? 'Current'
                : paymentStatus === 'due'
                ? 'Due'
                : 'Overdue'}
            </div>
            <p className="text-xs text-muted-foreground">
              {paymentStatus === 'current'
                ? 'All payments up to date'
                : balance?.totalBalance
                ? `$${balance.totalBalance.toLocaleString()} balance`
                : 'Payment needed'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Requests
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingMaintenance ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <div className="text-2xl font-bold">{openRequests.length}</div>
            )}
            <p className="text-xs text-muted-foreground">Maintenance requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lease Duration
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthsRemaining !== null ? `${monthsRemaining} months` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Remaining on lease</p>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
              <CardDescription>
                Your rent payment for{' '}
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-semibold">Monthly Rent</p>
                    <p className="text-sm text-muted-foreground">
                      Due{' '}
                      {balance?.nextDueDate
                        ? new Date(balance.nextDueDate).toLocaleDateString()
                        : 'on the 1st'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      ${activeLease?.rentAmount?.toLocaleString() || '0'}
                    </p>
                    <Badge variant="outline">
                      {paymentStatus === 'current' ? 'Upcoming' : 'Due Now'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Last Payment</p>
                    {balance?.lastPaymentAmount ? (
                      <p className="text-xl font-bold text-green-600">
                        ${balance.lastPaymentAmount.toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-xl font-bold text-muted-foreground">-</p>
                    )}
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Security Deposit</p>
                    <p className="text-xl font-bold">
                      ${activeLease?.securityDeposit?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href="/tenant/payments" className="flex-1">
                    <Button className="w-full">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                  </Link>
                  <Link href="/tenant/payments">
                    <Button variant="outline">Set Up AutoPay</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Maintenance Requests</CardTitle>
                <CardDescription>Track your service requests</CardDescription>
              </div>
              <Link href="/tenant/maintenance">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoadingMaintenance ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : maintenanceRequests.length > 0 ? (
                <div className="space-y-3">
                  {maintenanceRequests.slice(0, 3).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            request.status === 'SUBMITTED' || request.status === 'ACKNOWLEDGED'
                              ? 'bg-red-100'
                              : request.status === 'IN_PROGRESS' || request.status === 'SCHEDULED'
                              ? 'bg-amber-100'
                              : 'bg-green-100'
                          }`}
                        >
                          {request.status === 'SUBMITTED' || request.status === 'ACKNOWLEDGED' ? (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          ) : request.status === 'IN_PROGRESS' || request.status === 'SCHEDULED' ? (
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
                          request.status === 'SUBMITTED' || request.status === 'ACKNOWLEDGED'
                            ? 'destructive'
                            : request.status === 'IN_PROGRESS' || request.status === 'SCHEDULED'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {request.status.replace('_', ' ').toLowerCase()}
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
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link href="/tenant/payments">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Rent
                </Button>
              </Link>
              <Link href="/tenant/maintenance">
                <Button variant="outline" className="w-full justify-start">
                  <Wrench className="h-4 w-4 mr-2" />
                  Submit Request
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <Link href="/tenant/documents">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  View Documents
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Contact info */}
          <Card>
            <CardHeader>
              <CardTitle>Property Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">
                    {activeLease?.property.managerName || 'Property Management'}
                  </p>
                  <p className="text-sm text-muted-foreground">Property Management</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {activeLease?.property.managerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{activeLease.property.managerPhone}</span>
                  </div>
                )}
                {activeLease?.property.managerEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{activeLease.property.managerEmail}</span>
                  </div>
                )}
              </div>
              {activeLease?.property.emergencyPhone && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    Emergency Maintenance
                  </p>
                  <p className="font-semibold">{activeLease.property.emergencyPhone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">Ask anything</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Get instant answers about your lease, payments, maintenance, and more.
              </p>
              <Button className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TenantDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <Skeleton className="h-40 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-64" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  );
}
