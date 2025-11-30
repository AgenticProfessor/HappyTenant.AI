'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Building2,
  X,
  ChevronDown,
  Check,
  Loader2,
  Receipt,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Charge {
  id: string;
  type: string;
  description: string;
  amount: number;
  dueDate: string;
}

interface PaymentMethod {
  id: string;
  type: 'CARD' | 'US_BANK_ACCOUNT';
  last4: string;
  brand?: string;
  bankName?: string;
  isDefault: boolean;
}

interface FeeBreakdown {
  processingFee: number;
  platformFee: number;
  totalFees: number;
  totalAmount: number;
  tenantPays: number;
}

interface PayNowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  leaseId: string;
  organizationId: string;
  charges: Charge[];
  paymentMethods: PaymentMethod[];
  onSuccess: () => void;
}

export function PayNowModal({
  open,
  onOpenChange,
  tenantId,
  leaseId,
  organizationId,
  charges,
  paymentMethods,
  onSuccess,
}: PayNowModalProps) {
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [selectedCharges, setSelectedCharges] = useState<string[]>([]);
  const [fees, setFees] = useState<FeeBreakdown | null>(null);
  const [isLoadingFees, setIsLoadingFees] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'confirm' | 'processing' | 'success'>('select');

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId);
  const subtotal = charges
    .filter((c) => selectedCharges.includes(c.id))
    .reduce((sum, c) => sum + c.amount, 0);

  // Set defaults on open
  useEffect(() => {
    if (open) {
      const defaultMethod = paymentMethods.find((m) => m.isDefault);
      if (defaultMethod) setSelectedMethodId(defaultMethod.id);
      setSelectedCharges(charges.map((c) => c.id));
      setStep('select');
      setError(null);
    }
  }, [open, paymentMethods, charges]);

  // Calculate fees when method or charges change
  useEffect(() => {
    if (!selectedMethodId || selectedCharges.length === 0) {
      setFees(null);
      return;
    }

    const calculateFees = async () => {
      setIsLoadingFees(true);
      try {
        const method = paymentMethods.find((m) => m.id === selectedMethodId);
        const response = await fetch('/api/tenant/payments/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'calculate_fees',
            amount: subtotal,
            paymentMethodType: method?.type || 'CARD',
            organizationId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setFees(data.fees);
        }
      } catch (err) {
        console.error('Error calculating fees:', err);
      } finally {
        setIsLoadingFees(false);
      }
    };

    calculateFees();
  }, [selectedMethodId, selectedCharges, subtotal, paymentMethods, organizationId]);

  const handleToggleCharge = (chargeId: string) => {
    setSelectedCharges((prev) =>
      prev.includes(chargeId)
        ? prev.filter((id) => id !== chargeId)
        : [...prev, chargeId]
    );
  };

  const handleProceed = () => {
    if (selectedCharges.length === 0 || !selectedMethodId) return;
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setStep('processing');
    setError(null);

    try {
      const response = await fetch('/api/tenant/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          leaseId,
          chargeIds: selectedCharges,
          paymentMethodId: selectedMethodId,
          amount: fees?.tenantPays || subtotal,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
        }, 2500);
      } else {
        setError(data.error || 'Payment failed');
        setStep('confirm');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setStep('confirm');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        {/* Animated header gradient */}
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-emerald-500/10 to-transparent" />
          <DialogHeader className="relative p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <DialogTitle className="text-xl font-semibold text-zinc-900 dark:text-white">
                  {step === 'success' ? 'Payment Complete' : 'Make a Payment'}
                </DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        <AnimatePresence mode="wait">
          {(step === 'select' || step === 'confirm') && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-6 pb-6 space-y-5"
            >
              {/* Payment Method Selector */}
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
                          {method.isDefault && (
                            <span className="text-xs text-emerald-600 font-medium">Default</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Charges Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Select Charges
                </label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {charges.map((charge) => (
                    <motion.button
                      key={charge.id}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleToggleCharge(charge.id)}
                      className={cn(
                        'w-full p-3 rounded-xl border-2 text-left transition-all',
                        'flex items-center justify-between',
                        selectedCharges.includes(charge.id)
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                          selectedCharges.includes(charge.id)
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-zinc-300 dark:border-zinc-600'
                        )}>
                          {selectedCharges.includes(charge.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white text-sm">
                            {charge.description}
                          </p>
                          <p className="text-xs text-zinc-500">
                            Due {formatDate(charge.dueDate)}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {formatCurrency(charge.amount)}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Fee Breakdown */}
              {selectedCharges.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Subtotal</span>
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {isLoadingFees ? (
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Calculating fees...
                    </div>
                  ) : fees && fees.totalFees > 0 ? (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Processing Fee</span>
                        <span className="text-zinc-700 dark:text-zinc-300">
                          {formatCurrency(fees.totalFees)}
                        </span>
                      </div>
                      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-zinc-900 dark:text-white">
                            Total
                          </span>
                          <span className="text-xl font-bold text-emerald-600">
                            {formatCurrency(fees.tenantPays)}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-900 dark:text-white">Total</span>
                      <span className="text-xl font-bold text-emerald-600">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                {step === 'select' ? (
                  <Button
                    onClick={handleProceed}
                    disabled={selectedCharges.length === 0 || !selectedMethodId || isLoadingFees}
                    className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium"
                  >
                    Review Payment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setStep('select')}
                      className="flex-1 h-12"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Pay {formatCurrency(fees?.tenantPays || subtotal)}
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-6 pb-6"
            >
              <div className="py-12 text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-4 border-zinc-200 dark:border-zinc-800 border-t-emerald-500"
                  />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                  Processing Payment
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Please wait while we securely process your payment...
                </p>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-6 pb-6"
            >
              <div className="py-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="relative w-20 h-20 mx-auto mb-6"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 animate-pulse opacity-30" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Check className="w-10 h-10 text-white" />
                  </div>
                </motion.div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                  Payment Successful!
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                  Your payment of {formatCurrency(fees?.tenantPays || subtotal)} has been processed.
                </p>
                <p className="text-xs text-zinc-400">
                  A receipt has been sent to your email.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
