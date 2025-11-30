'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  FileText,
  CreditCard,
  Building2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Scale,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface PaymentTermsProps {
  onAccept?: (accepted: boolean) => void;
  showAcceptance?: boolean;
  variant?: 'full' | 'compact';
}

export function PaymentTerms({
  onAccept,
  showAcceptance = false,
  variant = 'full',
}: PaymentTermsProps) {
  const [isExpanded, setIsExpanded] = useState(variant === 'full');
  const [accepted, setAccepted] = useState(false);

  const handleAccept = (checked: boolean) => {
    setAccepted(checked);
    onAccept?.(checked);
  };

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {variant === 'compact' && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <Scale className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="font-medium text-zinc-900 dark:text-white">
              Payment Terms of Service
            </span>
          </div>
          <ChevronDown
            className={cn(
              'w-5 h-5 text-zinc-400 transition-transform',
              isExpanded && 'rotate-180'
            )}
          />
        </button>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={variant === 'compact' ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <CardContent className={cn('space-y-6', variant === 'compact' && 'pt-0')}>
              {/* Header */}
              {variant === 'full' && (
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                    <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      Payment Terms of Service
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Last updated: November 2024
                    </p>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="space-y-5 text-sm text-zinc-600 dark:text-zinc-400">
                <section>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-2">
                    1. Payment Services
                  </h4>
                  <p>
                    Happy Tenant provides electronic payment processing services to facilitate
                    rent payments between tenants and property managers/landlords. By using
                    our payment services, you agree to these terms.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    2. Accepted Payment Methods
                  </h4>
                  <p className="mb-2">We accept the following payment methods:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>ACH Bank Transfers:</strong> Direct debits from US checking or savings accounts</li>
                    <li><strong>Debit Cards:</strong> Visa, Mastercard, Discover debit cards</li>
                    <li><strong>Credit Cards:</strong> Visa, Mastercard, American Express, Discover</li>
                    <li><strong>Digital Wallets:</strong> Apple Pay and Google Pay (where available)</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    3. Processing Fees
                  </h4>
                  <p className="mb-2">
                    Payment processing fees may apply based on your landlord's fee configuration:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900">
                          <th className="text-left p-2 border border-zinc-200 dark:border-zinc-800">Method</th>
                          <th className="text-left p-2 border border-zinc-200 dark:border-zinc-800">Fee</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 border border-zinc-200 dark:border-zinc-800">ACH Bank Transfer</td>
                          <td className="p-2 border border-zinc-200 dark:border-zinc-800">0.8% (max $5.00)</td>
                        </tr>
                        <tr>
                          <td className="p-2 border border-zinc-200 dark:border-zinc-800">Debit Card</td>
                          <td className="p-2 border border-zinc-200 dark:border-zinc-800">2.9% + $0.30</td>
                        </tr>
                        <tr>
                          <td className="p-2 border border-zinc-200 dark:border-zinc-800">Credit Card</td>
                          <td className="p-2 border border-zinc-200 dark:border-zinc-800">2.9% + $0.30</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-xs">
                    Fee responsibility (tenant, landlord, or split) is determined by your
                    landlord's settings and will be displayed before you confirm payment.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    4. Processing Times
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>ACH:</strong> 3-5 business days to complete</li>
                    <li><strong>Card payments:</strong> Typically instant authorization, funds captured same day</li>
                    <li><strong>Payout to landlord:</strong> 2-7 business days depending on trust level</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    5. AutoPay Terms
                  </h4>
                  <p>When you enable AutoPay:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                    <li>Payments will be automatically initiated on your selected day each month</li>
                    <li>You authorize us to charge your selected payment method</li>
                    <li>You must maintain sufficient funds or available credit</li>
                    <li>You can cancel AutoPay at any time before the scheduled payment date</li>
                    <li>Cancellation takes effect for the next scheduled payment</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    6. Failed Payments
                  </h4>
                  <p className="mb-2">
                    If a payment fails (insufficient funds, expired card, bank rejection):
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>We will notify you immediately via email and in-app notification</li>
                    <li>We may automatically retry the payment up to 3 times</li>
                    <li>Your landlord may charge a returned payment fee as per your lease</li>
                    <li>Late fees may apply according to your lease agreement</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-2">
                    7. Refunds & Disputes
                  </h4>
                  <p>
                    Refunds are subject to your landlord's refund policy. For payment disputes:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                    <li>Contact your landlord first for billing disputes</li>
                    <li>For unauthorized transactions, contact us within 60 days</li>
                    <li>We will investigate and respond within 10 business days</li>
                    <li>Chargebacks may result in service suspension</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-2">
                    8. Service Availability
                  </h4>
                  <p>
                    Payment services are available 24/7, but processing only occurs on
                    business days. We may temporarily suspend services for maintenance
                    with advance notice when possible.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    9. Contact Information
                  </h4>
                  <p>For payment-related questions or issues:</p>
                  <ul className="list-none space-y-1 mt-2">
                    <li><strong>Email:</strong> payments@happytenant.com</li>
                    <li><strong>Phone:</strong> 1-800-HAPPY-TENANT (1-800-427-7982)</li>
                    <li><strong>Hours:</strong> Monday-Friday, 9am-6pm ET</li>
                  </ul>
                </section>

                <section className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    These terms supplement the Happy Tenant Terms of Service and Privacy Policy.
                    By using our payment services, you agree to both these Payment Terms and our
                    general Terms of Service.
                  </p>
                </section>
              </div>

              {/* Acceptance Checkbox */}
              {showAcceptance && (
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={accepted}
                      onCheckedChange={handleAccept}
                      className="mt-0.5"
                    />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      I have read and agree to the Payment Terms of Service.
                    </span>
                  </label>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
