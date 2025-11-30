'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  CreditCard,
  Building2,
  Receipt,
  Clock,
  AlertCircle,
  ChevronRight,
  Sparkles,
  TrendingUp,
  CalendarCheck,
  Shield,
  Wallet,
  ArrowUpRight,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaymentMethodCard } from './PaymentMethodCard';
import { AddPaymentMethodModal } from './AddPaymentMethodModal';
import { PayNowModal } from './PayNowModal';
import { AutoPaySetup } from './AutoPaySetup';
import { DepositTimeline } from './DepositTimeline';

interface PaymentMethod {
  id: string;
  type: 'CARD' | 'US_BANK_ACCOUNT';
  last4: string;
  brand?: string;
  bankName?: string;
  nickname?: string;
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
}

interface Charge {
  id: string;
  type: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
}

interface Payment {
  id: string;
  amount: number;
  fees: number;
  netAmount: number;
  status: string;
  payoutStatus: string;
  createdAt: string;
  processedAt: string | null;
  expectedPayoutDate: string | null;
  actualPayoutDate: string | null;
  paymentMethodType: 'CARD' | 'US_BANK_ACCOUNT';
}

interface AutoPaySchedule {
  id: string;
  leaseId: string;
  paymentMethodId: string;
  dayOfMonth: number;
  amount: number;
  isActive: boolean;
  nextPaymentDate: string;
  lastProcessedAt: string | null;
  lastProcessedStatus: string | null;
}

interface TenantPaymentsDashboardProps {
  tenantId: string;
  leaseId: string;
  organizationId: string;
  monthlyRent: number;
  propertyName: string;
  unitNumber: string;
}

export function TenantPaymentsDashboard({
  tenantId,
  leaseId,
  organizationId,
  monthlyRent,
  propertyName,
  unitNumber,
}: TenantPaymentsDashboardProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [autoPaySchedule, setAutoPaySchedule] = useState<AutoPaySchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [showPayNowModal, setShowPayNowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const totalOwed = charges
    .filter((c) => ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'].includes(c.status))
    .reduce((sum, c) => sum + c.amount, 0);

  const overdueCharges = charges.filter((c) => c.status === 'OVERDUE');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch payment methods
      const methodsRes = await fetch(`/api/tenant/payments/methods?tenantId=${tenantId}`);
      if (methodsRes.ok) {
        const data = await methodsRes.json();
        setPaymentMethods(data.methods || []);
      }

      // Fetch AutoPay schedule
      const autoPayRes = await fetch(`/api/tenant/payments/autopay?tenantId=${tenantId}&leaseId=${leaseId}`);
      if (autoPayRes.ok) {
        const data = await autoPayRes.json();
        setAutoPaySchedule(data.schedule || null);
      }

      // Mock charges and payments for demo
      setCharges([
        {
          id: '1',
          type: 'RENT',
          description: 'December 2024 Rent',
          amount: monthlyRent,
          dueDate: '2024-12-01',
          status: 'PENDING',
        },
      ]);

      setRecentPayments([
        {
          id: 'pay_123',
          amount: monthlyRent,
          fees: 0,
          netAmount: monthlyRent,
          status: 'COMPLETED',
          payoutStatus: 'PAID',
          createdAt: '2024-11-01T10:00:00Z',
          processedAt: '2024-11-01T10:05:00Z',
          expectedPayoutDate: '2024-11-08T00:00:00Z',
          actualPayoutDate: '2024-11-08T14:30:00Z',
          paymentMethodType: 'US_BANK_ACCOUNT',
        },
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantId, leaseId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const handleSetDefaultMethod = async (methodId: string) => {
    try {
      await fetch(`/api/tenant/payments/methods/${methodId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, setAsDefault: true }),
      });
      fetchData();
    } catch (error) {
      console.error('Error setting default:', error);
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    try {
      await fetch(`/api/tenant/payments/methods/${methodId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting method:', error);
    }
  };

  const handleEditNickname = async (methodId: string, nickname: string) => {
    // Would open a modal to edit - simplified for now
    console.log('Edit nickname:', methodId, nickname);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 text-white">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-violet-500/20 to-transparent rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-zinc-400 text-sm mb-1">
                {propertyName} • Unit {unitNumber}
              </p>
              <h1 className="text-3xl font-bold mb-2">Payments</h1>
              <p className="text-zinc-400">
                Manage your rent payments and payment methods
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              {totalOwed > 0 ? (
                <>
                  <p className="text-sm text-zinc-400">Amount Due</p>
                  <p className="text-4xl font-bold">{formatCurrency(totalOwed)}</p>
                  {overdueCharges.length > 0 && (
                    <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/30">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {overdueCharges.length} overdue
                    </Badge>
                  )}
                </>
              ) : (
                <>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    All caught up!
                  </Badge>
                  <p className="text-zinc-400 text-sm">No payments due</p>
                </>
              )}
            </div>
          </div>

          {totalOwed > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={() => setShowPayNowModal(true)}
                size="lg"
                className="bg-white text-zinc-900 hover:bg-zinc-100 font-semibold"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Pay Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => {
                  const el = document.getElementById('autopay-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <CalendarCheck className="w-5 h-5 mr-2" />
                Set Up AutoPay
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Monthly Rent</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                    {formatCurrency(monthlyRent)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <Receipt className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Payment Methods</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                    {paymentMethods.length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30">
                  <CreditCard className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">AutoPay</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                    {autoPaySchedule?.isActive ? 'Active' : 'Off'}
                  </p>
                </div>
                <div className={cn(
                  'p-3 rounded-xl',
                  autoPaySchedule?.isActive
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : 'bg-zinc-100 dark:bg-zinc-800'
                )}>
                  <CalendarCheck className={cn(
                    'w-6 h-6',
                    autoPaySchedule?.isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-400'
                  )} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payment Methods Section */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Payment Methods
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage your saved payment methods
            </p>
          </div>
          <Button onClick={() => setShowAddMethodModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Method
          </Button>
        </div>

        {paymentMethods.length === 0 ? (
          <Card className="border-dashed border-2 border-zinc-200 dark:border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                <CreditCard className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                No payment methods
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-4 max-w-sm">
                Add a bank account or card to make payments quickly and securely.
              </p>
              <Button onClick={() => setShowAddMethodModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                id={method.id}
                type={method.type}
                last4={method.last4}
                brand={method.brand}
                bankName={method.bankName}
                nickname={method.nickname}
                isDefault={method.isDefault}
                expiryMonth={method.expiryMonth}
                expiryYear={method.expiryYear}
                onSetDefault={handleSetDefaultMethod}
                onDelete={handleDeleteMethod}
                onEditNickname={handleEditNickname}
              />
            ))}
          </div>
        )}
      </section>

      {/* AutoPay Section */}
      <section id="autopay-section">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Automatic Payments
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Set up recurring payments so you never miss rent
          </p>
        </div>

        <AutoPaySetup
          tenantId={tenantId}
          leaseId={leaseId}
          monthlyRent={monthlyRent}
          paymentMethods={paymentMethods}
          existingSchedule={autoPaySchedule}
          onUpdate={fetchData}
        />
      </section>

      {/* Recent Payments Section */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Payment History
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Track your recent payments and their status
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <History className="w-4 h-4" />
            View All
          </Button>
        </div>

        {recentPayments.length === 0 ? (
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                <Clock className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                No payment history
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Your payment history will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {recentPayments.map((payment) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className="border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedPayment(payment)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'p-2.5 rounded-xl',
                          payment.paymentMethodType === 'CARD'
                            ? 'bg-violet-100 dark:bg-violet-900/30'
                            : 'bg-emerald-100 dark:bg-emerald-900/30'
                        )}>
                          {payment.paymentMethodType === 'CARD' ? (
                            <CreditCard className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                          ) : (
                            <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {new Date(payment.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge className={cn(
                          payment.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : payment.status === 'FAILED'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        )}>
                          {payment.status === 'COMPLETED' ? 'Complete' : payment.status}
                        </Badge>
                        <ChevronRight className="w-5 h-5 text-zinc-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Payment Timeline Modal */}
      {selectedPayment && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedPayment(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <DepositTimeline
              paymentId={selectedPayment.id}
              paymentStatus={selectedPayment.status as any}
              payoutStatus={selectedPayment.payoutStatus as any}
              amount={selectedPayment.amount}
              netAmount={selectedPayment.netAmount}
              fees={selectedPayment.fees}
              createdAt={selectedPayment.createdAt}
              processedAt={selectedPayment.processedAt}
              expectedPayoutDate={selectedPayment.expectedPayoutDate}
              actualPayoutDate={selectedPayment.actualPayoutDate}
              paymentMethodType={selectedPayment.paymentMethodType}
            />
          </motion.div>
        </div>
      )}

      {/* Security Footer */}
      <div className="flex items-center justify-center gap-6 py-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Shield className="w-4 h-4" />
          <span>256-bit encryption</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.5c.966 0 1.75.784 1.75 1.75S12.966 8 12 8s-1.75-.784-1.75-1.75S11.034 4.5 12 4.5zm3 13.5H9v-1.5h1.5V12H9v-1.5h3v6h1.5v1.5z"/>
          </svg>
          <span>PCI compliant</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4" />
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Bank-level security</span>
        </div>
      </div>

      {/* Modals */}
      <AddPaymentMethodModal
        open={showAddMethodModal}
        onOpenChange={setShowAddMethodModal}
        tenantId={tenantId}
        onSuccess={fetchData}
      />

      <PayNowModal
        open={showPayNowModal}
        onOpenChange={setShowPayNowModal}
        tenantId={tenantId}
        leaseId={leaseId}
        organizationId={organizationId}
        charges={charges.filter((c) => ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'].includes(c.status))}
        paymentMethods={paymentMethods}
        onSuccess={fetchData}
      />
    </div>
  );
}
