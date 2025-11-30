'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CreditCard,
  Building2,
  Check,
  Loader2,
  RefreshCw,
  Zap,
  AlertCircle,
  Settings2,
  X,
  ChevronRight,
  Clock,
  Shield,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface PaymentMethod {
  id: string;
  type: 'CARD' | 'US_BANK_ACCOUNT';
  last4: string;
  brand?: string;
  bankName?: string;
  isDefault: boolean;
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

interface AutoPaySetupProps {
  tenantId: string;
  leaseId: string;
  monthlyRent: number;
  paymentMethods: PaymentMethod[];
  existingSchedule?: AutoPaySchedule | null;
  onUpdate: () => void;
}

export function AutoPaySetup({
  tenantId,
  leaseId,
  monthlyRent,
  paymentMethods,
  existingSchedule,
  onUpdate,
}: AutoPaySetupProps) {
  const [isEnabled, setIsEnabled] = useState(existingSchedule?.isActive || false);
  const [selectedMethodId, setSelectedMethodId] = useState(
    existingSchedule?.paymentMethodId || paymentMethods.find((m) => m.isDefault)?.id || ''
  );
  const [selectedDay, setSelectedDay] = useState(existingSchedule?.dayOfMonth || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDayPicker, setShowDayPicker] = useState(false);

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId);

  const handleToggleAutoPay = async () => {
    if (isEnabled) {
      // Cancel AutoPay
      setIsLoading(true);
      try {
        const response = await fetch('/api/tenant/payments/autopay', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenantId, leaseId }),
        });

        if (response.ok) {
          setIsEnabled(false);
          onUpdate();
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to cancel AutoPay');
        }
      } catch (err) {
        setError('Something went wrong');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Enable AutoPay
      setIsEnabled(true);
    }
  };

  const handleSave = async () => {
    if (!selectedMethodId) {
      setError('Please select a payment method');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const method = existingSchedule ? 'PATCH' : 'POST';
      const response = await fetch('/api/tenant/payments/autopay', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          leaseId,
          paymentMethodId: selectedMethodId,
          dayOfMonth: selectedDay,
        }),
      });

      if (response.ok) {
        onUpdate();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save AutoPay settings');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const formatNextPayment = () => {
    if (!existingSchedule?.nextPaymentDate) return null;
    return new Date(existingSchedule.nextPaymentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Days grid for picker
  const days = Array.from({ length: 28 }, (_, i) => i + 1);

  return (
    <Card className="relative overflow-hidden border-zinc-200 dark:border-zinc-800">
      {/* Gradient accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
                AutoPay
              </CardTitle>
              <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400">
                Never miss a payment
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {existingSchedule?.isActive && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Sparkles className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggleAutoPay}
              disabled={isLoading}
              className="data-[state=checked]:bg-violet-600"
            />
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isEnabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="space-y-5 pb-6">
              {/* Next Payment Info */}
              {existingSchedule?.isActive && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-100 dark:border-violet-900/30"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                      Next automatic payment
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                    {formatNextPayment()}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    {formatCurrency(monthlyRent)} will be charged to your payment method
                  </p>
                </motion.div>
              )}

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Payment Method
                </label>
                <Select value={selectedMethodId} onValueChange={setSelectedMethodId}>
                  <SelectTrigger className="w-full h-14 px-4">
                    <SelectValue placeholder="Select payment method">
                      {selectedMethod && (
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'p-1.5 rounded-lg',
                            selectedMethod.type === 'CARD'
                              ? 'bg-violet-100 dark:bg-violet-900/30'
                              : 'bg-emerald-100 dark:bg-emerald-900/30'
                          )}>
                            {selectedMethod.type === 'CARD' ? (
                              <CreditCard className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                            ) : (
                              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            )}
                          </div>
                          <span className="font-medium">
                            {selectedMethod.type === 'CARD'
                              ? `${selectedMethod.brand} ****${selectedMethod.last4}`
                              : `${selectedMethod.bankName} ****${selectedMethod.last4}`}
                          </span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        <div className="flex items-center gap-3">
                          {method.type === 'CARD' ? (
                            <CreditCard className="w-4 h-4 text-violet-600" />
                          ) : (
                            <Building2 className="w-4 h-4 text-emerald-600" />
                          )}
                          <span>
                            {method.type === 'CARD'
                              ? `${method.brand} ****${method.last4}`
                              : `${method.bankName} ****${method.last4}`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Day of Month Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Payment Day
                </label>
                <button
                  onClick={() => setShowDayPicker(!showDayPicker)}
                  className={cn(
                    'w-full h-14 px-4 rounded-lg border-2 text-left transition-all',
                    'flex items-center justify-between',
                    'bg-white dark:bg-zinc-950',
                    showDayPicker
                      ? 'border-violet-500 ring-2 ring-violet-500/20'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <Calendar className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {selectedDay}{getOrdinalSuffix(selectedDay)} of each month
                    </span>
                  </div>
                  <ChevronRight className={cn(
                    'w-5 h-5 text-zinc-400 transition-transform',
                    showDayPicker && 'rotate-90'
                  )} />
                </button>

                <AnimatePresence>
                  {showDayPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                    >
                      <p className="text-xs text-zinc-500 mb-3">
                        Select a day between 1-28 to ensure consistent payments across all months
                      </p>
                      <div className="grid grid-cols-7 gap-2">
                        {days.map((day) => (
                          <button
                            key={day}
                            onClick={() => {
                              setSelectedDay(day);
                              setShowDayPicker(false);
                            }}
                            className={cn(
                              'w-full aspect-square rounded-lg text-sm font-medium transition-all',
                              'hover:bg-violet-100 dark:hover:bg-violet-900/30',
                              selectedDay === day
                                ? 'bg-violet-600 text-white hover:bg-violet-700'
                                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                            )}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Amount Display */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Monthly Amount</span>
                  <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {formatCurrency(monthlyRent)}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  AutoPay will pay your full monthly rent. Additional charges are not included.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={isSaving || !selectedMethodId}
                className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : existingSchedule?.isActive ? (
                  <>
                    <Settings2 className="w-4 h-4 mr-2" />
                    Update AutoPay Settings
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Enable AutoPay
                  </>
                )}
              </Button>

              {/* Security Note */}
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                <Shield className="w-3.5 h-3.5" />
                <span>You can cancel AutoPay at any time</span>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed state info */}
      {!isEnabled && (
        <CardContent className="pt-0 pb-5">
          <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Set it and forget it</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Never miss a payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
