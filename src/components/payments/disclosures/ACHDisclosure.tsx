'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Shield, AlertCircle, FileText, Clock, Ban, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface ACHDisclosureProps {
  landlordName: string;
  onAccept?: (accepted: boolean) => void;
  showAcceptance?: boolean;
  variant?: 'full' | 'compact';
}

export function ACHDisclosure({
  landlordName,
  onAccept,
  showAcceptance = false,
  variant = 'full',
}: ACHDisclosureProps) {
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
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-medium text-zinc-900 dark:text-white">
              ACH Authorization & Disclosure
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
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      ACH Payment Authorization
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Required disclosure for bank account payments
                    </p>
                  </div>
                </div>
              )}

              {/* Authorization Text */}
              <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                <section>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-2">
                    Authorization Agreement
                  </h4>
                  <p>
                    By providing your bank account information and clicking "Authorize" or proceeding
                    with payment, you authorize Happy Tenant and {landlordName} to initiate
                    electronic debits (ACH transfers) from your designated bank account for
                    rent payments and associated fees as described in your lease agreement.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Transaction Timing
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>ACH debits typically process within 3-5 business days</li>
                    <li>Transactions initiated after 3:00 PM ET may process the next business day</li>
                    <li>Weekends and federal holidays may delay processing</li>
                    <li>Funds must be available in your account at time of debit</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                    <Ban className="w-4 h-4" />
                    Your Right to Cancel
                  </h4>
                  <p>
                    You may revoke this authorization at any time by contacting us at least 3
                    business days before the scheduled debit date. To cancel a specific payment
                    or revoke this authorization entirely:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                    <li>Email: support@happytenant.com</li>
                    <li>Phone: 1-800-HAPPY-TENANT (1-800-427-7982)</li>
                    <li>In-app: Navigate to Payments → AutoPay → Cancel</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Returned Payments & Fees
                  </h4>
                  <p>
                    If a payment is returned due to insufficient funds, account closure, or
                    incorrect information, you may be charged a returned payment fee as
                    specified in your lease agreement. You remain responsible for the original
                    payment amount plus any applicable fees.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Disputes & Errors
                  </h4>
                  <p>
                    If you believe a transaction was made in error, contact us within 60 days
                    of the transaction. Under the Electronic Fund Transfer Act (EFTA) and
                    Regulation E, you have specific rights regarding unauthorized transfers.
                    We will investigate and respond within 10 business days (up to 45 days
                    in some cases).
                  </p>
                </section>

                <section className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/30">
                  <p className="text-amber-800 dark:text-amber-200 text-xs">
                    <strong>Important:</strong> This authorization will remain in effect until
                    you cancel it in writing, your lease ends, or we notify you of termination.
                    We will provide at least 10 days' notice before any change to the debit
                    amount or frequency.
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
                      I have read and agree to the ACH Authorization terms. I authorize
                      electronic debits from my bank account as described above.
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
