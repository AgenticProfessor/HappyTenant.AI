'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  CreditCard,
  Settings,
  ArrowLeft,
  ExternalLink,
  HelpCircle,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { ConnectStatusCard } from '@/components/payments/ConnectStatusCard';
import { PaymentSetupWizard } from '@/components/payments/PaymentSetupWizard';
import { FeeConfigurationCard } from '@/components/payments/FeeConfigurationCard';
import { PayoutSettingsCard } from '@/components/payments/PayoutSettingsCard';

interface PaymentStatus {
  hasAccount: boolean;
  status: string;
  stripeAccountId?: string;
  canAcceptPayments: boolean;
  paymentCapabilityReason?: string;
  businessEntityType?: string;
  onboardedAt?: string;
  feeConfiguration: string;
  trustLevel: string;
  payoutDelayDays: number;
  payoutDelayMinimum: number;
  successfulPayoutCount: number;
  firstSuccessfulPayoutAt?: string;
  stripeDetails?: {
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    capabilities: {
      cardPayments: string;
      transfers: string;
      usBankAccountAchPayments: string;
    };
    requirements: {
      currentlyDue: string[];
      eventuallyDue: string[];
      pastDue: string[];
      disabledReason?: string;
    };
  };
  connectAccount?: {
    cardPaymentsCapability: string;
    transfersCapability: string;
    usBankAccountCapability: string;
    defaultBankAccountLast4?: string;
    defaultBankAccountBankName?: string;
    lastSyncedAt?: string;
  };
}

export default function PaymentSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock organization data - in production, this would come from auth context
  const organization = {
    name: 'Sample Properties LLC',
    email: 'contact@sampleproperties.com',
  };

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/payments/connect/status');
      if (!response.ok) {
        throw new Error('Failed to fetch payment status');
      }
      const data = await response.json();
      setPaymentStatus(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching payment status:', err);
      setError('Unable to load payment settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Handle initial account creation
  const handleCreateAccount = async (data: {
    businessType: 'individual' | 'company';
    businessEntityType: string;
    businessName?: string;
  }) => {
    setIsActionLoading(true);
    try {
      // Create the account
      const createResponse = await fetch('/api/payments/connect/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(error.error || 'Failed to create account');
      }

      // Get onboarding URL
      const urlResponse = await fetch('/api/payments/connect/onboarding-url');
      if (!urlResponse.ok) {
        throw new Error('Failed to get onboarding URL');
      }
      const { url } = await urlResponse.json();

      // Redirect to Stripe
      window.location.href = url;
    } catch (err) {
      console.error('Error creating account:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create account');
      setIsActionLoading(false);
    }
  };

  // Handle continuing onboarding
  const handleContinueOnboarding = async () => {
    setIsActionLoading(true);
    try {
      const response = await fetch('/api/payments/connect/onboarding-url');
      if (!response.ok) {
        throw new Error('Failed to get onboarding URL');
      }
      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      console.error('Error getting onboarding URL:', err);
      toast.error('Failed to continue setup. Please try again.');
      setIsActionLoading(false);
    }
  };

  // Handle refresh status
  const handleRefreshStatus = async () => {
    setIsActionLoading(true);
    try {
      const response = await fetch('/api/payments/connect/refresh', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to refresh status');
      }
      await fetchStatus();
      toast.success('Status refreshed successfully');
    } catch (err) {
      console.error('Error refreshing status:', err);
      toast.error('Failed to refresh status');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle open Stripe dashboard
  const handleOpenDashboard = async () => {
    setIsActionLoading(true);
    try {
      const response = await fetch('/api/payments/connect/dashboard');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get dashboard URL');
      }
      const { url } = await response.json();
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error getting dashboard URL:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to open dashboard');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle fee configuration change
  const handleFeeConfigurationChange = async (configuration: string) => {
    try {
      const response = await fetch('/api/payments/connect/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeConfiguration: configuration }),
      });
      if (!response.ok) {
        throw new Error('Failed to update fee configuration');
      }
      await fetchStatus();
      toast.success('Fee configuration updated');
    } catch (err) {
      console.error('Error updating fee configuration:', err);
      toast.error('Failed to update fee configuration');
      throw err;
    }
  };

  // Handle payout delay change
  const handlePayoutDelayChange = async (delayDays: number) => {
    try {
      const response = await fetch('/api/payments/connect/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutDelayDays: delayDays }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update payout delay');
      }
      await fetchStatus();
      toast.success('Payout schedule updated');
    } catch (err) {
      console.error('Error updating payout delay:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update payout delay');
      throw err;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payment Settings</h1>
            <p className="text-muted-foreground">Configure how you collect rent payments</p>
          </div>
        </div>

        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Unable to Load Settings</h3>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <Button onClick={() => fetchStatus()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show setup wizard for new accounts
  if (showSetupWizard || (paymentStatus && paymentStatus.status === 'NOT_STARTED')) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (showSetupWizard) {
                setShowSetupWizard(false);
              } else {
                router.back();
              }
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payment Settings</h1>
            <p className="text-muted-foreground">Set up your payment account to start collecting rent</p>
          </div>
        </div>

        <PaymentSetupWizard
          organizationName={organization.name}
          organizationEmail={organization.email}
          onComplete={handleCreateAccount}
          onCancel={paymentStatus?.status !== 'NOT_STARTED' ? () => setShowSetupWizard(false) : undefined}
          isLoading={isActionLoading}
        />
      </div>
    );
  }

  // Main settings view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-primary" />
              Payment Settings
            </h1>
            <p className="text-muted-foreground">Configure how you collect rent payments</p>
          </div>
        </div>

        <div className="flex gap-2">
          {paymentStatus?.hasAccount && paymentStatus.status === 'ACTIVE' && (
            <Button variant="outline" onClick={handleOpenDashboard} disabled={isActionLoading}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Stripe Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Account status card */}
      {paymentStatus && (
        <ConnectStatusCard
          status={paymentStatus.status as any}
          chargesEnabled={paymentStatus.stripeDetails?.chargesEnabled}
          payoutsEnabled={paymentStatus.stripeDetails?.payoutsEnabled}
          detailsSubmitted={paymentStatus.stripeDetails?.detailsSubmitted}
          currentlyDue={paymentStatus.stripeDetails?.requirements.currentlyDue}
          pastDue={paymentStatus.stripeDetails?.requirements.pastDue}
          disabledReason={paymentStatus.stripeDetails?.requirements.disabledReason}
          capabilities={paymentStatus.stripeDetails?.capabilities}
          bankAccountLast4={paymentStatus.connectAccount?.defaultBankAccountLast4}
          bankAccountName={paymentStatus.connectAccount?.defaultBankAccountBankName}
          onStartOnboarding={() => setShowSetupWizard(true)}
          onContinueOnboarding={handleContinueOnboarding}
          onRefreshStatus={handleRefreshStatus}
          onOpenDashboard={paymentStatus.status === 'ACTIVE' ? handleOpenDashboard : undefined}
          isLoading={isActionLoading}
        />
      )}

      {/* Settings cards - only show when account is active */}
      {paymentStatus?.status === 'ACTIVE' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <FeeConfigurationCard
            currentConfiguration={paymentStatus.feeConfiguration as any}
            onSave={handleFeeConfigurationChange}
            disabled={!paymentStatus.canAcceptPayments}
          />

          <PayoutSettingsCard
            payoutDelayDays={paymentStatus.payoutDelayDays}
            payoutDelayMinimum={paymentStatus.payoutDelayMinimum}
            trustLevel={paymentStatus.trustLevel as any}
            successfulPayoutCount={paymentStatus.successfulPayoutCount}
            firstSuccessfulPayoutAt={
              paymentStatus.firstSuccessfulPayoutAt
                ? new Date(paymentStatus.firstSuccessfulPayoutAt)
                : null
            }
            onSave={handlePayoutDelayChange}
            disabled={!paymentStatus.canAcceptPayments}
          />
        </div>
      )}

      {/* Help section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Understanding Fees</h4>
            <p className="text-xs text-muted-foreground">
              ACH transfers are ~0.8% (max $5), credit cards are ~2.9% + $0.30 per transaction.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Payout Timing</h4>
            <p className="text-xs text-muted-foreground">
              Funds are deposited to your bank account after the configured delay period.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Account Verification</h4>
            <p className="text-xs text-muted-foreground">
              Stripe may require additional verification documents to enable all features.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security notice */}
      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
        <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">Your data is secure</p>
          <p className="text-muted-foreground">
            Payment processing is handled by Stripe, a PCI Level 1 certified payment provider.
            Happy Tenant never stores sensitive financial information like bank account numbers or SSNs.
          </p>
        </div>
      </div>
    </div>
  );
}
