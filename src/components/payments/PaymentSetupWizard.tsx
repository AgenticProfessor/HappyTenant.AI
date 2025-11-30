'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Building2,
  User,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Shield,
  CheckCircle2,
  CreditCard,
  Banknote,
  Sparkles,
} from 'lucide-react';

type BusinessType = 'individual' | 'company';
type BusinessEntityType = 'INDIVIDUAL' | 'LLC' | 'LP' | 'S_CORP' | 'C_CORP' | 'TRUST' | 'OTHER';

interface PaymentSetupWizardProps {
  organizationName: string;
  organizationEmail: string;
  onComplete: (data: {
    businessType: BusinessType;
    businessEntityType: BusinessEntityType;
    businessName?: string;
  }) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const entityTypes: { value: BusinessEntityType; label: string; description: string }[] = [
  { value: 'INDIVIDUAL', label: 'Individual', description: 'Sole proprietor or self-employed' },
  { value: 'LLC', label: 'LLC', description: 'Limited Liability Company' },
  { value: 'LP', label: 'LP', description: 'Limited Partnership' },
  { value: 'S_CORP', label: 'S Corporation', description: 'S Corp tax election' },
  { value: 'C_CORP', label: 'C Corporation', description: 'Traditional corporation' },
  { value: 'TRUST', label: 'Trust', description: 'Family trust or other trust entity' },
  { value: 'OTHER', label: 'Other', description: 'Other business structure' },
];

export function PaymentSetupWizard({
  organizationName,
  organizationEmail,
  onComplete,
  onCancel,
  isLoading,
}: PaymentSetupWizardProps) {
  const [step, setStep] = useState(1);
  const [businessType, setBusinessType] = useState<BusinessType>('individual');
  const [entityType, setEntityType] = useState<BusinessEntityType>('INDIVIDUAL');
  const [businessName, setBusinessName] = useState(organizationName);

  const handleSubmit = async () => {
    await onComplete({
      businessType,
      businessEntityType: entityType,
      businessName: businessType === 'company' ? businessName : undefined,
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Set Up Payment Collection
        </CardTitle>
        <CardDescription>
          Enable online rent payments for your tenants. This secure setup takes about 5 minutes.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Benefits banner */}
        {step === 1 && (
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              What you&apos;ll get
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Accept ACH bank transfers (lowest fees)</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Accept credit & debit cards</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Apple Pay & Google Pay support</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Automatic deposits to your bank</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Business Type */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-1">How do you receive rental income?</h3>
              <p className="text-sm text-muted-foreground">
                This helps us set up your account correctly for tax purposes.
              </p>
            </div>

            <RadioGroup
              value={businessType}
              onValueChange={(v) => {
                setBusinessType(v as BusinessType);
                if (v === 'individual') {
                  setEntityType('INDIVIDUAL');
                } else {
                  setEntityType('LLC');
                }
              }}
              className="grid gap-4"
            >
              <label
                htmlFor="individual"
                className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  businessType === 'individual'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="individual" id="individual" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <span className="font-medium">Individual</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    I own properties in my personal name or as a sole proprietor
                  </p>
                </div>
              </label>

              <label
                htmlFor="company"
                className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  businessType === 'company'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="company" id="company" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span className="font-medium">Business Entity</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    I own properties through an LLC, corporation, partnership, or trust
                  </p>
                </div>
              </label>
            </RadioGroup>
          </div>
        )}

        {/* Step 2: Entity Type (for businesses) */}
        {step === 2 && businessType === 'company' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-1">What type of business entity?</h3>
              <p className="text-sm text-muted-foreground">
                Select the legal structure of your property-holding entity.
              </p>
            </div>

            <RadioGroup
              value={entityType}
              onValueChange={(v) => setEntityType(v as BusinessEntityType)}
              className="grid gap-3"
            >
              {entityTypes
                .filter((e) => e.value !== 'INDIVIDUAL')
                .map((entity) => (
                  <label
                    key={entity.value}
                    htmlFor={entity.value}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      entityType === entity.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value={entity.value} id={entity.value} />
                    <div className="flex-1">
                      <span className="font-medium">{entity.label}</span>
                      <p className="text-sm text-muted-foreground">{entity.description}</p>
                    </div>
                  </label>
                ))}
            </RadioGroup>

            <div className="space-y-2 pt-4">
              <Label htmlFor="businessName">Legal Business Name</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter your business name as registered"
              />
              <p className="text-xs text-muted-foreground">
                This should match your official registration documents
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-1">Ready to continue</h3>
              <p className="text-sm text-muted-foreground">
                You&apos;ll be redirected to Stripe to securely complete your account setup.
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <h4 className="font-medium text-sm">Account Summary</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Type</span>
                  <span className="font-medium capitalize">{businessType}</span>
                </div>
                {businessType === 'company' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entity Type</span>
                      <span className="font-medium">
                        {entityTypes.find((e) => e.value === entityType)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Business Name</span>
                      <span className="font-medium">{businessName}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{organizationEmail}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
              <h4 className="font-medium text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Shield className="h-4 w-4" />
                What you&apos;ll need
              </h4>
              <ul className="text-sm text-amber-600 dark:text-amber-300 mt-2 space-y-1">
                {businessType === 'individual' ? (
                  <>
                    <li>• Your Social Security Number (SSN)</li>
                    <li>• Bank account for receiving payments</li>
                    <li>• Valid ID for verification</li>
                  </>
                ) : (
                  <>
                    <li>• Business EIN (Employer Identification Number)</li>
                    <li>• Business bank account</li>
                    <li>• Information about beneficial owners (25%+ stake)</li>
                    <li>• Valid ID for representatives</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                Your information is securely transmitted to Stripe, our payment processor. We never
                store sensitive data like SSNs or full bank account numbers.
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4 border-t">
          <div>
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={isLoading}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {step === 1 && onCancel && (
              <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}
          </div>

          <div>
            {step === 1 && (
              <Button
                onClick={() => {
                  if (businessType === 'individual') {
                    setStep(3); // Skip entity type for individuals
                  } else {
                    setStep(2);
                  }
                }}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {step === 2 && (
              <Button onClick={() => setStep(3)} disabled={!entityType}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {step === 3 && (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  'Setting up...'
                ) : (
                  <>
                    Continue to Stripe
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
