'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Link2,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Building2,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface FinancialConnectionsDisclosureProps {
  onAccept?: (accepted: boolean) => void;
  showAcceptance?: boolean;
  variant?: 'full' | 'compact';
}

export function FinancialConnectionsDisclosure({
  onAccept,
  showAcceptance = false,
  variant = 'full',
}: FinancialConnectionsDisclosureProps) {
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
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Link2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="font-medium text-zinc-900 dark:text-white">
              Bank Connection Privacy Notice
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
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      Bank Connection Privacy Notice
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      How we securely connect to your bank
                    </p>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="space-y-5 text-sm text-zinc-600 dark:text-zinc-400">
                <section>
                  <p>
                    Happy Tenant uses Stripe Financial Connections to securely link your bank
                    account. This service allows us to verify your account ownership and
                    process ACH payments without storing your online banking credentials.
                  </p>
                </section>

                {/* What We Access */}
                <section>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Information We Access
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <p className="font-medium text-zinc-900 dark:text-white text-xs mb-1">
                        Account Details
                      </p>
                      <p className="text-xs">
                        Account and routing numbers, account type, and institution name
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <p className="font-medium text-zinc-900 dark:text-white text-xs mb-1">
                        Account Holder
                      </p>
                      <p className="text-xs">
                        Name on the account to verify ownership
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <p className="font-medium text-zinc-900 dark:text-white text-xs mb-1">
                        Balance (Optional)
                      </p>
                      <p className="text-xs">
                        Current balance to prevent failed payments
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <p className="font-medium text-zinc-900 dark:text-white text-xs mb-1">
                        Account Status
                      </p>
                      <p className="text-xs">
                        Whether the account is open and active
                      </p>
                    </div>
                  </div>
                </section>

                {/* What We Don't Access */}
                <section>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                    <EyeOff className="w-4 h-4" />
                    Information We Never Access
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Your online banking username or password</li>
                    <li>Transaction history or spending patterns</li>
                    <li>Other accounts at your bank</li>
                    <li>Credit score or credit history</li>
                    <li>Tax information or social security number</li>
                  </ul>
                </section>

                {/* Security */}
                <section>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Security Measures
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Bank-level 256-bit encryption for all data</li>
                    <li>PCI DSS Level 1 certified (highest level)</li>
                    <li>SOC 2 Type II audited annually</li>
                    <li>No storage of banking credentials</li>
                    <li>Read-only access—we cannot move money without your authorization</li>
                  </ul>
                </section>

                {/* Data Refresh */}
                <section>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Connection Updates
                  </h4>
                  <p>
                    Your bank connection may periodically need to be re-authenticated for
                    security purposes. We'll notify you if action is needed. You can also
                    manually refresh your connection at any time from your payment settings.
                  </p>
                </section>

                {/* Disconnection */}
                <section>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Disconnecting Your Bank
                  </h4>
                  <p>
                    You can disconnect your bank account at any time from your payment
                    settings. This will:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                    <li>Immediately revoke our access to your account information</li>
                    <li>Cancel any scheduled automatic payments using that account</li>
                    <li>Delete stored account details from our systems within 30 days</li>
                  </ul>
                </section>

                {/* Powered by Stripe */}
                <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <Shield className="w-8 h-8 text-zinc-400" />
                  <div>
                    <p className="text-xs font-medium text-zinc-900 dark:text-white">
                      Powered by Stripe Financial Connections
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Stripe processes payments for millions of businesses worldwide
                    </p>
                  </div>
                </div>
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
                      I understand and agree to allow Happy Tenant to securely connect to my
                      bank account as described above.
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
