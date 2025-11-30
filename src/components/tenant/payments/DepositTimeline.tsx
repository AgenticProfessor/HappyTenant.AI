'use client';

import { motion } from 'framer-motion';
import {
  Clock,
  Send,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Wallet,
  BadgeCheck,
  CalendarClock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LucideIcon } from 'lucide-react';

type PaymentStatus =
  | 'INITIATED'
  | 'PROCESSING'
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'DISPUTED';

type PayoutStatus =
  | 'NOT_STARTED'
  | 'PAYOUT_PENDING'
  | 'IN_TRANSIT'
  | 'PAID'
  | 'PAYOUT_FAILED'
  | 'CANCELED';

interface TimelineEvent {
  id: string;
  type: 'payment' | 'processing' | 'payout';
  status: string;
  title: string;
  description: string;
  timestamp: string | null;
  estimatedDate?: string;
}

interface DepositTimelineProps {
  paymentId: string;
  paymentStatus: PaymentStatus;
  payoutStatus: PayoutStatus;
  amount: number;
  netAmount: number;
  fees: number;
  createdAt: string;
  processedAt: string | null;
  expectedPayoutDate: string | null;
  actualPayoutDate: string | null;
  failureReason?: string;
  paymentMethodType: 'CARD' | 'US_BANK_ACCOUNT';
}

export function DepositTimeline({
  paymentId,
  paymentStatus,
  payoutStatus,
  amount,
  netAmount,
  fees,
  createdAt,
  processedAt,
  expectedPayoutDate,
  actualPayoutDate,
  failureReason,
  paymentMethodType,
}: DepositTimelineProps) {
  // Build timeline events
  const buildTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // Payment initiated
    events.push({
      id: 'initiated',
      type: 'payment',
      status: 'completed',
      title: 'Payment Initiated',
      description: `${paymentMethodType === 'CARD' ? 'Card' : 'Bank'} payment submitted`,
      timestamp: createdAt,
    });

    // Processing
    if (['PROCESSING', 'PENDING', 'COMPLETED', 'FAILED'].includes(paymentStatus)) {
      const isComplete = ['PENDING', 'COMPLETED', 'FAILED'].includes(paymentStatus);
      events.push({
        id: 'processing',
        type: 'processing',
        status: paymentStatus === 'FAILED' ? 'failed' : isComplete ? 'completed' : 'in_progress',
        title: paymentStatus === 'FAILED' ? 'Payment Failed' : 'Processing',
        description: paymentStatus === 'FAILED'
          ? failureReason || 'Payment could not be processed'
          : paymentMethodType === 'US_BANK_ACCOUNT'
          ? 'ACH transfer in progress'
          : 'Card authorization complete',
        timestamp: processedAt,
      });
    }

    // Payment complete
    if (['COMPLETED', 'PENDING'].includes(paymentStatus)) {
      const isComplete = paymentStatus === 'COMPLETED';
      events.push({
        id: 'captured',
        type: 'payment',
        status: isComplete ? 'completed' : 'pending',
        title: isComplete ? 'Payment Received' : 'Awaiting Confirmation',
        description: isComplete
          ? 'Funds secured from your account'
          : paymentMethodType === 'US_BANK_ACCOUNT'
          ? 'ACH typically settles in 3-5 business days'
          : 'Awaiting bank confirmation',
        timestamp: isComplete ? processedAt : null,
        estimatedDate: !isComplete && paymentMethodType === 'US_BANK_ACCOUNT' ? getEstimatedDate(createdAt, 5) : undefined,
      });
    }

    // Payout stages (only if payment succeeded)
    if (paymentStatus === 'COMPLETED') {
      // Payout pending
      if (['PAYOUT_PENDING', 'IN_TRANSIT', 'PAID'].includes(payoutStatus)) {
        events.push({
          id: 'payout_pending',
          type: 'payout',
          status: payoutStatus === 'PAYOUT_PENDING' ? 'in_progress' : 'completed',
          title: 'Payout Scheduled',
          description: 'Funds queued for transfer to landlord',
          timestamp: processedAt,
          estimatedDate: payoutStatus === 'PAYOUT_PENDING' ? expectedPayoutDate || undefined : undefined,
        });
      }

      // In transit
      if (['IN_TRANSIT', 'PAID'].includes(payoutStatus)) {
        events.push({
          id: 'in_transit',
          type: 'payout',
          status: payoutStatus === 'IN_TRANSIT' ? 'in_progress' : 'completed',
          title: 'In Transit',
          description: 'Money being transferred to landlord\'s bank',
          timestamp: payoutStatus === 'PAID' ? actualPayoutDate : null,
          estimatedDate: payoutStatus === 'IN_TRANSIT' ? expectedPayoutDate || undefined : undefined,
        });
      }

      // Deposited
      if (payoutStatus === 'PAID') {
        events.push({
          id: 'deposited',
          type: 'payout',
          status: 'completed',
          title: 'Deposited',
          description: 'Funds delivered to landlord',
          timestamp: actualPayoutDate,
        });
      }

      // Payout failed
      if (payoutStatus === 'PAYOUT_FAILED') {
        events.push({
          id: 'payout_failed',
          type: 'payout',
          status: 'failed',
          title: 'Payout Failed',
          description: 'Transfer to landlord failed',
          timestamp: null,
        });
      }
    }

    return events;
  };

  const events = buildTimelineEvents();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const formatDate = (dateString: string | null, includeTime = false) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...(includeTime ? { hour: 'numeric', minute: '2-digit' } : {}),
    });
  };

  const getEstimatedDate = (fromDate: string, daysToAdd: number): string => {
    const date = new Date(fromDate);
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500 text-white';
      case 'in_progress':
        return 'bg-blue-500 text-white';
      case 'pending':
        return 'bg-amber-500 text-white';
      case 'failed':
        return 'bg-red-500 text-white';
      default:
        return 'bg-zinc-300 dark:bg-zinc-700 text-zinc-500';
    }
  };

  const getStatusIcon = (status: string): LucideIcon => {
    switch (status) {
      case 'completed':
        return CheckCircle2;
      case 'in_progress':
        return Loader2;
      case 'pending':
        return Clock;
      case 'failed':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getTypeIcon = (type: string): LucideIcon => {
    switch (type) {
      case 'payment':
        return Wallet;
      case 'processing':
        return Send;
      case 'payout':
        return Building2;
      default:
        return Clock;
    }
  };

  const getOverallStatus = () => {
    if (paymentStatus === 'FAILED') return { label: 'Failed', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    if (paymentStatus === 'DISPUTED') return { label: 'Disputed', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
    if (payoutStatus === 'PAID') return { label: 'Complete', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
    if (payoutStatus === 'IN_TRANSIT') return { label: 'In Transit', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
    if (paymentStatus === 'PENDING') return { label: 'Processing', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
    return { label: 'Processing', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
  };

  const overallStatus = getOverallStatus();

  return (
    <Card className="relative overflow-hidden border-zinc-200 dark:border-zinc-800">
      {/* Top gradient accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
              <CalendarClock className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
                Payment Timeline
              </CardTitle>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Track your payment from start to finish
              </p>
            </div>
          </div>
          <Badge className={overallStatus.color}>
            {overallStatus.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Amount summary */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900">
          <div className="space-y-1">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Payment Amount</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">
              {formatCurrency(amount)}
            </p>
          </div>
          {fees > 0 && (
            <div className="text-right space-y-1">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Fees</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{formatCurrency(fees)}</p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="relative">
          {events.map((event, index) => {
            const StatusIcon = getStatusIcon(event.status);
            const TypeIcon = getTypeIcon(event.type);
            const isLast = index === events.length - 1;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex gap-4"
              >
                {/* Vertical line */}
                {!isLast && (
                  <div
                    className={cn(
                      'absolute left-[19px] top-10 w-0.5 h-[calc(100%-10px)]',
                      event.status === 'completed'
                        ? 'bg-emerald-200 dark:bg-emerald-900'
                        : 'bg-zinc-200 dark:bg-zinc-800'
                    )}
                  />
                )}

                {/* Icon */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      getStatusColor(event.status)
                    )}
                  >
                    {event.status === 'in_progress' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <StatusIcon className="w-5 h-5" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className={cn('flex-1 pb-8', isLast && 'pb-0')}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-zinc-900 dark:text-white">
                        {event.title}
                      </h4>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {event.description}
                      </p>
                    </div>
                    <div className="text-right">
                      {event.timestamp ? (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {formatDate(event.timestamp, true)}
                        </p>
                      ) : event.estimatedDate ? (
                        <p className="text-sm text-zinc-400 dark:text-zinc-500 italic">
                          Est. {formatDate(event.estimatedDate)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Expected payout info */}
        {paymentStatus === 'COMPLETED' && payoutStatus !== 'PAID' && expectedPayoutDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30"
          >
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <BadgeCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Landlord will receive funds by
              </p>
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {formatDate(expectedPayoutDate)}
              </p>
            </div>
          </motion.div>
        )}

        {/* Payment ID */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Payment ID: <span className="font-mono">{paymentId}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
