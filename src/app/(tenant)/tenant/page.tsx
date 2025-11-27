'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { mockTenants, mockLeases, mockUnits, getPropertyById, mockMaintenanceRequests } from '@/data/mock-data';

const currentTenant = mockTenants[0];
const currentLease = mockLeases.find((l) => l.tenantId === currentTenant.id && l.status === 'active');
const currentUnit = currentLease ? mockUnits.find((u) => u.id === currentLease.unitId) : null;
const currentProperty = currentUnit ? getPropertyById(currentUnit.propertyId) : null;

export default function TenantDashboardPage() {
  const nextPaymentDate = new Date();
  nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
  nextPaymentDate.setDate(1);

  const daysUntilPayment = Math.ceil(
    (nextPaymentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const tenantMaintenanceRequests = mockMaintenanceRequests.filter(
    (r) => r.tenantId === currentTenant.id
  );
  const openRequests = tenantMaintenanceRequests.filter((r) => r.status !== 'completed');

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {currentTenant.name.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your rental.
          </p>
        </div>
        <Button>
          <CreditCard className="h-4 w-4 mr-2" />
          Pay Rent
        </Button>
      </div>

      {/* Property Info Card */}
      {currentProperty && currentUnit && (
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="h-24 w-24 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{currentProperty.name}</h2>
                <p className="text-muted-foreground">
                  {currentUnit.name} • {currentUnit.bedrooms} bed, {currentUnit.bathrooms} bath
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentProperty.address}, {currentProperty.city}, {currentProperty.state} {currentProperty.zipCode}
                </p>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Lease ends {new Date(currentLease?.endDate || '').toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${currentLease?.rentAmount.toLocaleString()}/month</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Lease
                </Button>
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
              ${currentLease?.rentAmount.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Due in {daysUntilPayment} days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payment Status
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Current</div>
            <p className="text-xs text-muted-foreground">
              All payments up to date
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
            <div className="text-2xl font-bold">{openRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              Maintenance requests
            </p>
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
            <div className="text-2xl font-bold">8 months</div>
            <p className="text-xs text-muted-foreground">
              Remaining on lease
            </p>
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
              <CardDescription>Your rent payment for December 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-semibold">Monthly Rent</p>
                    <p className="text-sm text-muted-foreground">Due December 1, 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${currentLease?.rentAmount.toLocaleString()}</p>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Total Paid (2024)</p>
                    <p className="text-xl font-bold text-green-600">
                      ${((currentLease?.rentAmount || 0) * 11).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Security Deposit</p>
                    <p className="text-xl font-bold">
                      ${currentLease?.securityDeposit.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                  <Button variant="outline">
                    Set Up AutoPay
                  </Button>
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
              {tenantMaintenanceRequests.length > 0 ? (
                <div className="space-y-3">
                  {tenantMaintenanceRequests.slice(0, 3).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          request.status === 'open' ? 'bg-red-100' :
                          request.status === 'in_progress' ? 'bg-amber-100' : 'bg-green-100'
                        }`}>
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
                    <Button className="mt-4">
                      Submit a Request
                    </Button>
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
              <Link href="/tenant/messages">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </Link>
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
                  <p className="font-semibold">Johnson Properties</p>
                  <p className="text-sm text-muted-foreground">Property Management</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>contact@johnsonproperties.com</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Emergency Maintenance</p>
                <p className="font-semibold">(555) 999-9999</p>
              </div>
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
