'use client';

import { useState } from 'react';
import {
  Building2,
  User,
  ArrowRight,
  CheckCircle2,
  Shield,
  CreditCard,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type BusinessType = 'individual' | 'company';
type BusinessEntityType = 'INDIVIDUAL' | 'LLC' | 'S_CORP' | 'C_CORP' | 'LP' | 'TRUST' | 'OTHER';

interface StripeConnectOnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    businessType: BusinessType;
    businessEntityType: BusinessEntityType;
    businessName?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function StripeConnectOnboarding({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: StripeConnectOnboardingProps) {
  const [step, setStep] = useState<'type' | 'details' | 'confirm'>('type');
  const [businessType, setBusinessType] = useState<BusinessType>('individual');
  const [businessEntityType, setBusinessEntityType] = useState<BusinessEntityType>('INDIVIDUAL');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleBusinessTypeSelect = (type: BusinessType) => {
    setBusinessType(type);
    if (type === 'individual') {
      setBusinessEntityType('INDIVIDUAL');
    } else {
      setBusinessEntityType('LLC');
    }
  };

  const handleNext = () => {
    if (step === 'type') {
      setStep('details');
    } else if (step === 'details') {
      if (businessType === 'company' && !businessName.trim()) {
        setError('Business name is required');
        return;
      }
      setError(null);
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('type');
    } else if (step === 'confirm') {
      setStep('details');
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      await onSubmit({
        businessType,
        businessEntityType,
        businessName: businessType === 'company' ? businessName : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      // Reset state on close
      setStep('type');
      setBusinessType('individual');
      setBusinessEntityType('INDIVIDUAL');
      setBusinessName('');
      setError(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set Up Payment Account</DialogTitle>
          <DialogDescription>
            {step === 'type' && 'Tell us about your business structure'}
            {step === 'details' && 'Provide your business details'}
            {step === 'confirm' && 'Review and confirm your information'}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 py-4">
          {['type', 'details', 'confirm'].map((s, idx) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium',
                  step === s
                    ? 'bg-primary text-primary-foreground'
                    : idx < ['type', 'details', 'confirm'].indexOf(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {idx < ['type', 'details', 'confirm'].indexOf(step) ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  idx + 1
                )}
              </div>
              {idx < 2 && (
                <div
                  className={cn(
                    'w-12 h-0.5 mx-1',
                    idx < ['type', 'details', 'confirm'].indexOf(step)
                      ? 'bg-green-500'
                      : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Business Type */}
        {step === 'type' && (
          <div className="space-y-4">
            <RadioGroup
              value={businessType}
              onValueChange={(value) =>
                handleBusinessTypeSelect(value as BusinessType)
              }
              className="space-y-3"
            >
              <Label
                htmlFor="individual"
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors',
                  businessType === 'individual'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <RadioGroupItem value="individual" id="individual" />
                <div className="p-2 rounded-lg bg-muted">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Individual / Sole Proprietor</p>
                  <p className="text-sm text-muted-foreground">
                    For single property owners without a formal business entity
                  </p>
                </div>
              </Label>

              <Label
                htmlFor="company"
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors',
                  businessType === 'company'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <RadioGroupItem value="company" id="company" />
                <div className="p-2 rounded-lg bg-muted">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Business / Company</p>
                  <p className="text-sm text-muted-foreground">
                    For LLCs, corporations, partnerships, or other legal entities
                  </p>
                </div>
              </Label>
            </RadioGroup>

            <div className="flex justify-end">
              <Button onClick={handleNext}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Business Details */}
        {step === 'details' && (
          <div className="space-y-4">
            {businessType === 'company' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="Enter your business name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entityType">Business Entity Type</Label>
                  <Select
                    value={businessEntityType}
                    onValueChange={(value) =>
                      setBusinessEntityType(value as BusinessEntityType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LLC">
                        Limited Liability Company (LLC)
                      </SelectItem>
                      <SelectItem value="S_CORP">S Corporation</SelectItem>
                      <SelectItem value="C_CORP">C Corporation</SelectItem>
                      <SelectItem value="LP">Limited Partnership</SelectItem>
                      <SelectItem value="TRUST">Trust</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {businessType === 'individual' && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Individual Account</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You'll provide your personal information (name, address, SSN)
                        during Stripe's secure onboarding process.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && (
          <div className="space-y-4">
            {/* Summary */}
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account Type</span>
                  <span className="font-medium">
                    {businessType === 'individual' ? 'Individual' : 'Business'}
                  </span>
                </div>
                {businessType === 'company' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Business Name
                      </span>
                      <span className="font-medium">{businessName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Entity Type
                      </span>
                      <span className="font-medium">
                        {businessEntityType.replace('_', ' ')}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Security info */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Secure Setup</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You'll be redirected to Stripe to complete identity verification
                      and add your bank account. Your sensitive data is handled
                      securely by Stripe.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What you'll need */}
            <div className="space-y-2">
              <p className="text-sm font-medium">What you'll need:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Government-issued ID
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Bank account information
                </li>
                {businessType === 'company' && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      EIN or Tax ID
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      Business registration documents
                    </li>
                  </>
                )}
              </ul>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Continue to Stripe
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
