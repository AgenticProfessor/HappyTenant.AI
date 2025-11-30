'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Building2,
  X,
  ChevronRight,
  Shield,
  Lock,
  Zap,
  Check,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type PaymentMethodType = 'card' | 'us_bank_account' | null;
type Step = 'select' | 'setup' | 'complete';

interface AddPaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  onSuccess: () => void;
}

export function AddPaymentMethodModal({
  open,
  onOpenChange,
  tenantId,
  onSuccess,
}: AddPaymentMethodModalProps) {
  const [step, setStep] = useState<Step>('select');
  const [selectedType, setSelectedType] = useState<PaymentMethodType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setStep('select');
    setSelectedType(null);
    setError(null);
    onOpenChange(false);
  };

  const handleSelectType = async (type: PaymentMethodType) => {
    setSelectedType(type);
    setIsLoading(true);
    setError(null);

    try {
      // Create setup session
      const response = await fetch('/api/tenant/payments/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          paymentMethodTypes: [type],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create setup session');
      }

      const data = await response.json();
      // In a real implementation, you would use Stripe.js here
      // to mount the payment element using data.clientSecret
      console.log('Setup session created:', data);
      setStep('setup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    setStep('complete');
    setTimeout(() => {
      onSuccess();
      handleClose();
    }, 2000);
  };

  const methodOptions = [
    {
      type: 'us_bank_account' as const,
      title: 'Bank Account',
      subtitle: 'Lowest fees with ACH',
      icon: Building2,
      features: ['Lowest processing fees', 'Instant verification', 'Secure connection'],
      recommended: true,
      gradient: 'from-emerald-500 to-teal-600',
      bgGlow: 'bg-emerald-500/20',
    },
    {
      type: 'card' as const,
      title: 'Debit or Credit Card',
      subtitle: 'Visa, Mastercard, Amex',
      icon: CreditCard,
      features: ['Instant processing', 'Rewards eligible', 'Wide acceptance'],
      recommended: false,
      gradient: 'from-violet-500 to-purple-600',
      bgGlow: 'bg-violet-500/20',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        {/* Header with gradient accent */}
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-zinc-900 dark:text-white">
                {step === 'select' && 'Add Payment Method'}
                {step === 'setup' && (selectedType === 'card' ? 'Add Card' : 'Link Bank Account')}
                {step === 'complete' && 'Success!'}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="w-8 h-8 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="px-6 pb-6"
            >
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                Choose how you'd like to pay your rent. Bank accounts have the lowest fees.
              </p>

              <div className="space-y-3">
                {methodOptions.map((option) => (
                  <motion.button
                    key={option.type}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectType(option.type)}
                    disabled={isLoading}
                    className={cn(
                      'relative w-full p-4 rounded-xl border-2 text-left transition-all duration-200',
                      'bg-white dark:bg-zinc-900',
                      'border-zinc-200 dark:border-zinc-800',
                      'hover:border-zinc-300 dark:hover:border-zinc-700',
                      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500',
                      isLoading && selectedType === option.type && 'border-emerald-500',
                      'group'
                    )}
                  >
                    {option.recommended && (
                      <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-[10px] font-semibold text-white uppercase tracking-wider">
                        Recommended
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Icon with gradient background */}
                      <div className={cn(
                        'p-3 rounded-xl bg-gradient-to-br',
                        option.gradient,
                        'shadow-lg shadow-black/10'
                      )}>
                        <option.icon className="w-6 h-6 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-zinc-900 dark:text-white">
                            {option.title}
                          </h3>
                          {isLoading && selectedType === option.type ? (
                            <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                          )}
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                          {option.subtitle}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {option.features.map((feature) => (
                            <span
                              key={feature}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400"
                            >
                              <Check className="w-3 h-3 text-emerald-500" />
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Hover glow effect */}
                    <div className={cn(
                      'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl',
                      option.bgGlow
                    )} />
                  </motion.button>
                ))}
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-sm text-red-500 text-center"
                >
                  {error}
                </motion.p>
              )}

              {/* Security badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-400">
                <Lock className="w-3.5 h-3.5" />
                <span>256-bit encryption</span>
                <span className="text-zinc-300 dark:text-zinc-600">|</span>
                <Shield className="w-3.5 h-3.5" />
                <span>PCI compliant</span>
              </div>
            </motion.div>
          )}

          {step === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-6 pb-6"
            >
              {/* Stripe Elements would mount here */}
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6 mb-4 min-h-[200px] flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    {selectedType === 'card' ? (
                      <CreditCard className="w-6 h-6 text-white" />
                    ) : (
                      <Building2 className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    {selectedType === 'card'
                      ? 'Stripe Card Element would appear here'
                      : 'Stripe Financial Connections would open here'}
                  </p>
                  <Button onClick={handleComplete} className="bg-emerald-600 hover:bg-emerald-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Simulate Success
                  </Button>
                </div>
              </div>

              <Button variant="ghost" onClick={() => setStep('select')} className="w-full">
                Back to payment options
              </Button>
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-6 pb-6"
            >
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"
                >
                  <Check className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                  Payment Method Added
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Your {selectedType === 'card' ? 'card' : 'bank account'} has been securely saved.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
