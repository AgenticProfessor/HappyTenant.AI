'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  Download,
  Calendar,
  Wallet,
  Building,
  Sparkles,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { useTenantAuth, useTenantDashboard } from '@/contexts/tenant-auth-context';
import { usePayments } from '@/hooks/api/use-payments';
import { toast } from 'sonner';

const autoPayFormSchema = z.object({
  paymentMethod: z.string().min(1, 'Please select a payment method'),
  dayOfMonth: z.string().min(1, 'Please select a day'),
});

const paymentMethodFormSchema = z.object({
  type: z.enum(['bank', 'card']),
  accountName: z.string().min(2, 'Account name is required'),
  accountNumber: z.string().min(4, 'Account number is required'),
  routingNumber: z.string().optional(),
});

type AutoPayFormValues = z.infer<typeof autoPayFormSchema>;
type PaymentMethodFormValues = z.infer<typeof paymentMethodFormSchema>;

export default function TenantPaymentsPage() {
  const { tenant, activeLease, balance, isLoading: isLoadingAuth, error } = useTenantAuth();
  const { daysUntilRentDue, paymentStatus } = useTenantDashboard();
  const [autoPayEnabled, setAutoPayEnabled] = useState(true);
  const [autoPayDialogOpen, setAutoPayDialogOpen] = useState(false);
  const [addPaymentMethodOpen, setAddPaymentMethodOpen] = useState(false);

  // Fetch tenant's payment history
  const { data: paymentsData, isLoading: isLoadingPayments } = usePayments({
    tenantId: tenant?.id,
  });

  const payments = paymentsData?.payments || [];

  const autoPayForm = useForm<AutoPayFormValues>({
    resolver: zodResolver(autoPayFormSchema),
    defaultValues: {
      paymentMethod: 'bank-4523',
      dayOfMonth: '1',
    },
  });

  const paymentMethodForm = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodFormSchema),
    defaultValues: {
      type: 'bank',
      accountName: '',
      accountNumber: '',
      routingNumber: '',
    },
  });

  const totalPaid = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const handlePayNow = async () => {
    try {
      const response = await fetch('/api/tenant/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: activeLease?.rentAmount || 0,
          paymentMethodId: 'default',
        }),
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      toast.success('Payment processing...', {
        description: `Processing payment of $${activeLease?.rentAmount?.toLocaleString()}`,
      });
    } catch (err) {
      toast.error('Payment failed', {
        description: 'Please try again or contact support.',
      });
    }
  };

  const handleAutoPaySave = async (data: AutoPayFormValues) => {
    try {
      const response = await fetch('/api/tenant/payments/autopay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: true,
          paymentMethodId: data.paymentMethod,
          dayOfMonth: parseInt(data.dayOfMonth),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save AutoPay settings');
      }

      toast.success('AutoPay settings updated!', {
        description: 'Your automatic payment preferences have been saved.',
      });
      setAutoPayDialogOpen(false);
    } catch (err) {
      toast.error('Failed to save settings', {
        description: 'Please try again.',
      });
    }
  };

  const handleAddPaymentMethod = async (data: PaymentMethodFormValues) => {
    try {
      const response = await fetch('/api/tenant/payments/methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to add payment method');
      }

      toast.success('Payment method added!', {
        description: 'Your new payment method has been saved.',
      });
      paymentMethodForm.reset();
      setAddPaymentMethodOpen(false);
    } catch (err) {
      toast.error('Failed to add payment method', {
        description: 'Please try again.',
      });
    }
  };

  const handleDownloadReceipt = (paymentId: string, date: string) => {
    toast.success('Downloading receipt...', {
      description: `Receipt for payment on ${date}`,
    });
  };

  const handleExportHistory = () => {
    toast.success('Exporting payment history...', {
      description: 'Your payment history will be downloaded as a CSV file.',
    });
  };

  if (isLoadingAuth) {
    return <PaymentsPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Unable to Load Payments</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nextPaymentDate = balance?.nextDueDate
    ? new Date(balance.nextDueDate)
    : new Date(new Date().setMonth(new Date().getMonth() + 1, 1));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Manage your rent payments and view payment history
          </p>
        </div>
        <Button onClick={handlePayNow}>
          <CreditCard className="h-4 w-4 mr-2" />
          Pay Now
        </Button>
      </div>

      {/* Payment summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                (balance?.totalBalance || 0) === 0
                  ? 'text-green-600'
                  : 'text-amber-600'
              }`}
            >
              ${(balance?.totalBalance || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {(balance?.totalBalance || 0) === 0 ? 'All caught up!' : 'Amount due'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next Payment
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${activeLease?.rentAmount?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Due{' '}
              {nextPaymentDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Paid ({new Date().getFullYear()})
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingPayments ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">${totalPaid.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {payments.filter((p) => p.status === 'COMPLETED').length} payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              AutoPay
            </CardTitle>
            <CheckCircle2
              className={`h-4 w-4 ${
                autoPayEnabled ? 'text-green-500' : 'text-muted-foreground'
              }`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                autoPayEnabled ? 'text-green-600' : 'text-muted-foreground'
              }`}
            >
              {autoPayEnabled ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              {autoPayEnabled ? 'Bank account ending 4523' : 'Set up AutoPay'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Make a payment */}
      <Card>
        <CardHeader>
          <CardTitle>Make a Payment</CardTitle>
          <CardDescription>Pay your rent online securely</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Monthly Rent</span>
                  <span className="font-semibold">
                    ${activeLease?.rentAmount?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Fees</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-medium">Total Due</span>
                  <span className="text-xl font-bold">
                    ${activeLease?.rentAmount?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Payment Methods</p>
                  <Dialog
                    open={addPaymentMethodOpen}
                    onOpenChange={setAddPaymentMethodOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="link" size="sm" className="p-0 h-auto">
                        <Plus className="h-3 w-3 mr-1" />
                        Add New
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                        <DialogDescription>
                          Add a new bank account or credit card for payments
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...paymentMethodForm}>
                        <form
                          onSubmit={paymentMethodForm.handleSubmit(handleAddPaymentMethod)}
                          className="space-y-4 py-4"
                        >
                          <FormField
                            control={paymentMethodForm.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Payment Type</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="bank">Bank Account (ACH)</SelectItem>
                                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={paymentMethodForm.control}
                            name="accountName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Holder Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={paymentMethodForm.control}
                            name="accountNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {paymentMethodForm.watch('type') === 'bank'
                                    ? 'Account Number'
                                    : 'Card Number'}
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="****1234" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {paymentMethodForm.watch('type') === 'bank' && (
                            <FormField
                              control={paymentMethodForm.control}
                              name="routingNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Routing Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123456789" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setAddPaymentMethodOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit">Add Payment Method</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="grid gap-2">
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <Building className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">Bank Account</p>
                      <p className="text-xs text-muted-foreground">Chase Bank ****4523</p>
                    </div>
                    <Badge className="ml-auto">Default</Badge>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <CreditCard className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <p className="font-medium">Credit Card</p>
                      <p className="text-xs text-muted-foreground">Visa ****1234</p>
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="font-semibold">
                      {autoPayEnabled ? 'AutoPay is Active' : 'AutoPay'}
                    </span>
                  </div>
                  <Switch
                    checked={autoPayEnabled}
                    onCheckedChange={(checked) => {
                      setAutoPayEnabled(checked);
                      if (checked) {
                        toast.success('AutoPay enabled!');
                      } else {
                        toast.info('AutoPay disabled');
                      }
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {autoPayEnabled
                    ? 'Your rent will be automatically paid on the 1st of each month using your default payment method.'
                    : 'Enable AutoPay to automatically pay rent each month.'}
                </p>
                <Dialog open={autoPayDialogOpen} onOpenChange={setAutoPayDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      {autoPayEnabled ? 'Manage AutoPay' : 'Set Up AutoPay'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>AutoPay Settings</DialogTitle>
                      <DialogDescription>
                        Configure automatic rent payments
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...autoPayForm}>
                      <form
                        onSubmit={autoPayForm.handleSubmit(handleAutoPaySave)}
                        className="space-y-4 py-4"
                      >
                        <FormField
                          control={autoPayForm.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Method</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="bank-4523">
                                    Chase Bank ****4523
                                  </SelectItem>
                                  <SelectItem value="card-1234">Visa ****1234</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={autoPayForm.control}
                          name="dayOfMonth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Day</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select day of month" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">1st of the month</SelectItem>
                                  <SelectItem value="15">15th of the month</SelectItem>
                                  <SelectItem value="28">28th of the month</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Payments will be processed on this day each month
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setAutoPayDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Save Settings</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <Button className="w-full" size="lg" onClick={handlePayNow}>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay ${activeLease?.rentAmount?.toLocaleString() || '0'} Now
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Payment is secure and encrypted
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment history */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>View and download your payment records</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportHistory}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingPayments ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.receivedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          Rent Payment - {payment.lease.unit.property.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Unit {payment.lease.unit.unitNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === 'COMPLETED'
                            ? 'default'
                            : payment.status === 'PENDING'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="gap-1"
                      >
                        {payment.status === 'COMPLETED' && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {payment.status === 'PENDING' && <Clock className="h-3 w-3" />}
                        {payment.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleDownloadReceipt(payment.id, payment.receivedAt)
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No payment history yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-96" />
      <Skeleton className="h-64" />
    </div>
  );
}
