'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Building2,
  CreditCard,
  Banknote,
  ArrowRight,
} from 'lucide-react';

type StripeConnectStatus =
  | 'NOT_STARTED'
  | 'ONBOARDING_STARTED'
  | 'PENDING_VERIFICATION'
  | 'RESTRICTED'
  | 'ACTIVE'
  | 'DISABLED';

interface ConnectStatusCardProps {
  status: StripeConnectStatus;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
  currentlyDue?: string[];
  pastDue?: string[];
  disabledReason?: string;
  capabilities?: {
    cardPayments: string;
    transfers: string;
    usBankAccountAchPayments: string;
  };
  bankAccountLast4?: string;
  bankAccountName?: string;
  onStartOnboarding?: () => void;
  onContinueOnboarding?: () => void;
  onRefreshStatus?: () => void;
  onOpenDashboard?: () => void;
  isLoading?: boolean;
}

const statusConfig: Record<
  StripeConnectStatus,
  {
    icon: LucideIcon;
    label: string;
    description: string;
    color: string;
    badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  NOT_STARTED: {
    icon: Building2,
    label: 'Not Set Up',
    description: 'Set up your payment account to start collecting rent online.',
    color: 'text-muted-foreground',
    badgeVariant: 'secondary',
  },
  ONBOARDING_STARTED: {
    icon: Clock,
    label: 'Setup In Progress',
    description: 'Complete your account setup to enable payments.',
    color: 'text-amber-500',
    badgeVariant: 'outline',
  },
  PENDING_VERIFICATION: {
    icon: Clock,
    label: 'Pending Verification',
    description: 'Stripe is reviewing your information. This usually takes 1-2 business days.',
    color: 'text-amber-500',
    badgeVariant: 'outline',
  },
  RESTRICTED: {
    icon: AlertTriangle,
    label: 'Action Required',
    description: 'Your account has restrictions. Please provide additional information.',
    color: 'text-orange-500',
    badgeVariant: 'destructive',
  },
  ACTIVE: {
    icon: CheckCircle2,
    label: 'Active',
    description: 'Your payment account is fully set up and ready to accept payments.',
    color: 'text-emerald-500',
    badgeVariant: 'default',
  },
  DISABLED: {
    icon: XCircle,
    label: 'Disabled',
    description: 'Your account has been disabled. Please contact support.',
    color: 'text-red-500',
    badgeVariant: 'destructive',
  },
};

export function ConnectStatusCard({
  status,
  chargesEnabled,
  payoutsEnabled,
  detailsSubmitted,
  currentlyDue = [],
  pastDue = [],
  disabledReason,
  capabilities,
  bankAccountLast4,
  bankAccountName,
  onStartOnboarding,
  onContinueOnboarding,
  onRefreshStatus,
  onOpenDashboard,
  isLoading,
}: ConnectStatusCardProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  // Calculate setup progress
  const getProgress = () => {
    if (status === 'NOT_STARTED') return 0;
    if (status === 'ONBOARDING_STARTED') return 25;
    if (status === 'PENDING_VERIFICATION') return 75;
    if (status === 'ACTIVE') return 100;
    return 50;
  };

  const renderCapabilityBadge = (name: string, capStatus: string) => {
    const isActive = capStatus === 'active';
    const isPending = capStatus === 'pending';

    return (
      <div key={name} className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isActive ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-gray-300'
          }`}
        />
        <span className="text-sm capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${config.color}`} />
              Payment Account Status
            </CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </div>
          <Badge variant={config.badgeVariant}>{config.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress indicator for non-active states */}
        {status !== 'ACTIVE' && status !== 'DISABLED' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Setup Progress</span>
              <span className="font-medium">{getProgress()}%</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        )}

        {/* Capabilities for active accounts */}
        {status === 'ACTIVE' && capabilities && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Payment Capabilities</h4>
            <div className="grid grid-cols-2 gap-3">
              {renderCapabilityBadge('Card Payments', capabilities.cardPayments)}
              {renderCapabilityBadge('ACH Payments', capabilities.usBankAccountAchPayments)}
              {renderCapabilityBadge('Transfers', capabilities.transfers)}
            </div>
          </div>
        )}

        {/* Bank account info */}
        {status === 'ACTIVE' && bankAccountLast4 && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Payout Account
            </h4>
            <p className="text-sm text-muted-foreground">
              {bankAccountName || 'Bank Account'} ending in {bankAccountLast4}
            </p>
          </div>
        )}

        {/* Requirements for restricted accounts */}
        {(status === 'RESTRICTED' || currentlyDue.length > 0 || pastDue.length > 0) && (
          <div className="space-y-3">
            {pastDue.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                  Overdue Requirements
                </h4>
                <ul className="text-sm text-red-600 dark:text-red-300 space-y-1">
                  {pastDue.slice(0, 3).map((req) => (
                    <li key={req} className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3" />
                      {formatRequirement(req)}
                    </li>
                  ))}
                  {pastDue.length > 3 && (
                    <li className="text-xs">...and {pastDue.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}

            {currentlyDue.length > 0 && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                <h4 className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">
                  Information Needed
                </h4>
                <ul className="text-sm text-amber-600 dark:text-amber-300 space-y-1">
                  {currentlyDue.slice(0, 3).map((req) => (
                    <li key={req} className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {formatRequirement(req)}
                    </li>
                  ))}
                  {currentlyDue.length > 3 && (
                    <li className="text-xs">...and {currentlyDue.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Disabled reason */}
        {status === 'DISABLED' && disabledReason && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-300">{disabledReason}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {status === 'NOT_STARTED' && (
            <Button onClick={onStartOnboarding} disabled={isLoading}>
              <CreditCard className="h-4 w-4 mr-2" />
              Set Up Payments
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {(status === 'ONBOARDING_STARTED' || status === 'RESTRICTED') && (
            <Button onClick={onContinueOnboarding} disabled={isLoading}>
              Continue Setup
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {status === 'ACTIVE' && onOpenDashboard && (
            <Button variant="outline" onClick={onOpenDashboard} disabled={isLoading}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Stripe Dashboard
            </Button>
          )}

          {status !== 'NOT_STARTED' && onRefreshStatus && (
            <Button variant="ghost" size="sm" onClick={onRefreshStatus} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper to format Stripe requirement strings into human-readable text
function formatRequirement(requirement: string): string {
  const mapping: Record<string, string> = {
    'business_profile.url': 'Business website URL',
    'business_profile.mcc': 'Business category',
    'external_account': 'Bank account for payouts',
    'individual.dob.day': 'Date of birth',
    'individual.dob.month': 'Date of birth',
    'individual.dob.year': 'Date of birth',
    'individual.first_name': 'First name',
    'individual.last_name': 'Last name',
    'individual.ssn_last_4': 'Last 4 digits of SSN',
    'individual.address.line1': 'Address',
    'individual.address.city': 'City',
    'individual.address.state': 'State',
    'individual.address.postal_code': 'Postal code',
    'company.name': 'Business name',
    'company.tax_id': 'EIN/Tax ID',
    'company.address.line1': 'Business address',
    'tos_acceptance.date': 'Terms of Service acceptance',
    'tos_acceptance.ip': 'Terms of Service acceptance',
  };

  return mapping[requirement] || requirement.replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}
