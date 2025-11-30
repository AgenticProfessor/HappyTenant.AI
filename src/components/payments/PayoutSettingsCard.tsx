'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Clock,
  Shield,
  TrendingUp,
  CheckCircle2,
  Loader2,
  Info,
  Award,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type TrustLevel = 'NEW' | 'ESTABLISHED' | 'VERIFIED';

interface PayoutSettingsCardProps {
  payoutDelayDays: number;
  payoutDelayMinimum: number;
  trustLevel: TrustLevel;
  successfulPayoutCount: number;
  firstSuccessfulPayoutAt?: Date | null;
  onSave: (delayDays: number) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

const trustLevelConfig: Record<
  TrustLevel,
  {
    label: string;
    description: string;
    color: string;
    minDelay: number;
    requirements: string;
  }
> = {
  NEW: {
    label: 'New Account',
    description: 'Standard payout timing for new accounts',
    color: 'bg-blue-500',
    minDelay: 7,
    requirements: '90 days + 3 successful payouts + no disputes',
  },
  ESTABLISHED: {
    label: 'Established',
    description: 'Faster payouts available based on account history',
    color: 'bg-emerald-500',
    minDelay: 2,
    requirements: 'Manual verification by Happy Tenant',
  },
  VERIFIED: {
    label: 'Verified',
    description: 'Priority processing with fastest payout times',
    color: 'bg-purple-500',
    minDelay: 2,
    requirements: 'Already at highest level',
  },
};

export function PayoutSettingsCard({
  payoutDelayDays,
  payoutDelayMinimum,
  trustLevel,
  successfulPayoutCount,
  firstSuccessfulPayoutAt,
  onSave,
  isLoading,
  disabled,
}: PayoutSettingsCardProps) {
  const [selectedDelay, setSelectedDelay] = useState(payoutDelayDays.toString());
  const [isSaving, setIsSaving] = useState(false);

  const config = trustLevelConfig[trustLevel];
  const hasChanges = parseInt(selectedDelay) !== payoutDelayDays;

  // Calculate progress toward ESTABLISHED status
  const getProgressToEstablished = () => {
    if (trustLevel !== 'NEW') return 100;

    const daysSinceFirst = firstSuccessfulPayoutAt
      ? Math.floor((Date.now() - new Date(firstSuccessfulPayoutAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const daysProgress = Math.min(daysSinceFirst / 90, 1) * 50;
    const payoutsProgress = Math.min(successfulPayoutCount / 3, 1) * 50;

    return Math.round(daysProgress + payoutsProgress);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(parseInt(selectedDelay));
    } finally {
      setIsSaving(false);
    }
  };

  // Generate delay options based on minimum
  const delayOptions = Array.from({ length: 14 - payoutDelayMinimum + 1 }, (_, i) => i + payoutDelayMinimum);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Payout Schedule
            </CardTitle>
            <CardDescription>
              Configure how quickly you receive funds after a payment is processed.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={`${config.color} bg-opacity-10 border-opacity-30`}
          >
            <Award className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current payout timing */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Current Payout Delay
            </h4>
            <span className="text-2xl font-bold text-primary">{payoutDelayDays} days</span>
          </div>
          <p className="text-xs text-muted-foreground">
            After a payment clears, funds are deposited to your bank account within {payoutDelayDays} business days.
          </p>
        </div>

        {/* Delay selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Payout Delay</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    A payout delay protects against chargebacks and fraud. Shorter delays are available
                    as your account builds trust through successful transactions.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Select
            value={selectedDelay}
            onValueChange={setSelectedDelay}
            disabled={disabled || isSaving}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select payout delay" />
            </SelectTrigger>
            <SelectContent>
              {delayOptions.map((days) => (
                <SelectItem key={days} value={days.toString()}>
                  {days} business day{days !== 1 ? 's' : ''}
                  {days === payoutDelayMinimum && trustLevel !== 'VERIFIED' && (
                    <span className="text-muted-foreground ml-2">(minimum for your tier)</span>
                  )}
                  {days === 2 && <span className="text-emerald-600 ml-2">(fastest)</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {payoutDelayMinimum > 2 && (
            <p className="text-xs text-muted-foreground">
              Your minimum delay is {payoutDelayMinimum} days based on your account trust level.
            </p>
          )}
        </div>

        {/* Trust level progress */}
        {trustLevel === 'NEW' && (
          <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <TrendingUp className="h-4 w-4" />
                Progress to Faster Payouts
              </h4>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                {getProgressToEstablished()}%
              </span>
            </div>
            <Progress value={getProgressToEstablished()} className="h-2" />

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-blue-600 dark:text-blue-300 block">Account Age</span>
                <span className="font-medium text-blue-700 dark:text-blue-400">
                  {firstSuccessfulPayoutAt
                    ? `${Math.floor(
                        (Date.now() - new Date(firstSuccessfulPayoutAt).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )} / 90 days`
                    : '0 / 90 days'}
                </span>
              </div>
              <div>
                <span className="text-blue-600 dark:text-blue-300 block">Successful Payouts</span>
                <span className="font-medium text-blue-700 dark:text-blue-400">
                  {successfulPayoutCount} / 3 required
                </span>
              </div>
            </div>

            <p className="text-xs text-blue-600 dark:text-blue-300">
              Maintain good standing with no disputes to unlock 2-day payouts automatically.
            </p>
          </div>
        )}

        {/* Established/Verified benefits */}
        {trustLevel !== 'NEW' && (
          <div className="space-y-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-lg">
            <h4 className="text-sm font-medium flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <Shield className="h-4 w-4" />
              {trustLevel === 'VERIFIED' ? 'Verified Account Benefits' : 'Established Account Benefits'}
            </h4>
            <ul className="text-xs text-emerald-600 dark:text-emerald-300 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3" />
                Minimum {payoutDelayMinimum}-day payout delay available
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3" />
                Priority support for payment issues
              </li>
              {trustLevel === 'VERIFIED' && (
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" />
                  Instant payouts available (additional fees apply)
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Save button */}
        {hasChanges && (
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setSelectedDelay(payoutDelayDays.toString())}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || disabled}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
