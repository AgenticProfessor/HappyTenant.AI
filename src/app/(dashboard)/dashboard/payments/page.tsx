'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import {
  usePayments,
  type Payment,
  type PaymentStatus,
  getPaymentStatusColor,
  getPaymentMethodLabel,
  formatDate,
} from '@/hooks/api/use-payments';
import { useLeases, getPrimaryTenant } from '@/hooks/api/use-leases';
import { useStewardContext } from '@/hooks/use-steward-context';

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Fetch payments from API
  const { data: paymentsData, isLoading: isLoadingPayments } = usePayments();

  // Fetch active leases for upcoming payments
  const { data: leasesData, isLoading: isLoadingLeases } = useLeases({ status: 'ACTIVE' });

  const payments = paymentsData?.payments || [];
  const summary = paymentsData?.summary;
  const leases = leasesData?.leases || [];

  // Filter payments based on search and status
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const tenantName = `${payment.tenant.firstName} ${payment.tenant.lastName}`;
      const propertyName = payment.lease.unit.property.name;
      const matchesSearch =
        tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (payment.referenceNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !filterStatus || payment.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchQuery, filterStatus]);

  // Calculate stats
  const totalReceived = summary?.totalReceived || 0;
  const totalPending = summary?.totalPending || 0;
  const expectedRent = leases.reduce((sum, lease) => sum + lease.rentAmount, 0);
  const collectionRate = expectedRent > 0 ? Math.round((totalReceived / expectedRent) * 100) : 0;

  // Get current month name
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Register Steward context
  useStewardContext({
    type: 'page',
    name: 'payments',
    description: 'Payment tracking and rent collection overview',
    data: {
      totalReceived,
      totalPending,
      expectedRent,
      collectionRate,
      paymentsCount: payments.length,
      activeLeases: leases.length,
    },
    url: '/dashboard/payments',
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Track rent collection, payments, and financial overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Rent Collection Overview */}
      <Card className="bg-gradient-to-r from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {currentMonth} Rent Collection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Collection Progress</span>
                <span className="text-sm text-muted-foreground">{collectionRate}%</span>
              </div>
              {isLoadingPayments ? (
                <Skeleton className="h-3 w-full mb-4" />
              ) : (
                <Progress value={collectionRate} className="h-3 mb-4" />
              )}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  {isLoadingPayments ? (
                    <Skeleton className="h-8 w-24 mx-auto mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-green-600">
                      ${totalReceived.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Collected</p>
                </div>
                <div>
                  {isLoadingPayments ? (
                    <Skeleton className="h-8 w-24 mx-auto mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-amber-600">
                      ${totalPending.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div>
                  {isLoadingLeases ? (
                    <Skeleton className="h-8 w-24 mx-auto mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-primary">
                      ${expectedRent.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Expected</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center p-4 bg-muted/50 rounded-lg">
              <Sparkles className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium text-center">AI Collection Assistant</p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                {totalPending > 0
                  ? `${payments.filter((p) => p.status === 'PENDING').length} payments pending review`
                  : 'All payments up to date'}
              </p>
              <Button size="sm" className="mt-3">
                Send Reminders
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Received
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoadingPayments ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                ${totalReceived.toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              Completed payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoadingPayments ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-amber-600">
                ${totalPending.toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {payments.filter((p) => p.status === 'PENDING').length} pending payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Leases
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingLeases ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-primary">{leases.length}</div>
            )}
            <p className="text-xs text-muted-foreground">
              ${expectedRent.toLocaleString()}/month expected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Collection Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoadingPayments || isLoadingLeases ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-primary">{collectionRate}%</div>
            )}
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
          <div className="flex-1" />
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-[200px]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('COMPLETED')}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('PENDING')}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('FAILED')}>
                  Failed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value="all">
          <PaymentsTable payments={filteredPayments} isLoading={isLoadingPayments} />
        </TabsContent>
        <TabsContent value="completed">
          <PaymentsTable
            payments={filteredPayments.filter((p) => p.status === 'COMPLETED')}
            isLoading={isLoadingPayments}
          />
        </TabsContent>
        <TabsContent value="pending">
          <PaymentsTable
            payments={filteredPayments.filter((p) => p.status === 'PENDING')}
            isLoading={isLoadingPayments}
          />
        </TabsContent>
      </Tabs>

      {/* Upcoming Due Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Due Dates</CardTitle>
          <CardDescription>Rent payments due soon</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingLeases ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : leases.length > 0 ? (
            <div className="space-y-3">
              {leases.slice(0, 5).map((lease) => {
                const tenant = getPrimaryTenant(lease);
                const dueDate = new Date();
                dueDate.setDate(lease.rentDueDay);
                if (dueDate < new Date()) {
                  dueDate.setMonth(dueDate.getMonth() + 1);
                }

                return (
                  <div
                    key={lease.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {tenant
                            ? `${tenant.firstName} ${tenant.lastName}`
                            : 'Unknown Tenant'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Due{' '}
                          {dueDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${lease.rentAmount.toLocaleString()}</p>
                      <Badge variant="outline" className="text-xs">
                        {lease.unit.property.name} - Unit {lease.unit.unitNumber}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">No active leases</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentsTable({
  payments,
  isLoading,
}: {
  payments: Payment[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center">
          <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 font-semibold">No payments found</h3>
          <p className="text-muted-foreground mt-1">
            Payments will appear here once recorded
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tenant</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {payment.tenant.firstName} {payment.tenant.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payment.tenant.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm">
                  {payment.lease.unit.property.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Unit {payment.lease.unit.unitNumber}
                </p>
              </TableCell>
              <TableCell>{formatDate(payment.receivedAt)}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {getPaymentMethodLabel(payment.method)}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="font-semibold text-green-600">
                  +${payment.amount.toLocaleString()}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={payment.status} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Download Receipt</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const config = {
    PENDING: { icon: Clock, variant: 'secondary' as const },
    COMPLETED: { icon: CheckCircle2, variant: 'default' as const },
    FAILED: { icon: AlertCircle, variant: 'destructive' as const },
    REFUNDED: { icon: ArrowDownRight, variant: 'outline' as const },
    CANCELLED: { icon: AlertCircle, variant: 'outline' as const },
  };

  const { icon: Icon, variant } = config[status] || config.PENDING;

  return (
    <Badge variant={variant} className="gap-1 capitalize">
      <Icon className="h-3 w-3" />
      {status.toLowerCase()}
    </Badge>
  );
}
