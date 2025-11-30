'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import type { LucideIcon } from 'lucide-react';
import {
  DollarSign,
  Users,
  Split,
  Info,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type FeeConfiguration = 'LANDLORD_ABSORBS' | 'TENANT_PAYS' | 'SPLIT_FEES';

interface FeeConfigurationCardProps {
  currentConfiguration: FeeConfiguration;
  onSave: (configuration: FeeConfiguration) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

const feeOptions: {
  value: FeeConfiguration;
  label: string;
  description: string;
  icon: LucideIcon;
  example: string;
  popular?: boolean;
}[] = [
  {
    value: 'LANDLORD_ABSORBS',
    label: 'I Absorb Fees',
    description: 'Processing fees are deducted from your payout. Tenants pay exact rent amount.',
    icon: DollarSign,
    example: 'Tenant pays $1,500 → You receive ~$1,467 after fees',
    popular: true,
  },
  {
    value: 'TENANT_PAYS',
    label: 'Tenant Pays Fees',
    description: 'A convenience fee is added to tenant payments. You receive the full rent amount.',
    icon: Users,
    example: 'Tenant pays $1,533 (includes fee) → You receive $1,500',
  },
  {
    value: 'SPLIT_FEES',
    label: 'Split 50/50',
    description: 'Processing fees are split evenly between you and your tenant.',
    icon: Split,
    example: 'Tenant pays $1,516.50 → You receive $1,483.50',
  },
];

// Approximate fee percentages for display
const ACH_FEE = 0.008; // 0.8%
const CARD_FEE = 0.029; // 2.9% + $0.30

export function FeeConfigurationCard({
  currentConfiguration,
  onSave,
  isLoading,
  disabled,
}: FeeConfigurationCardProps) {
  const [selected, setSelected] = useState<FeeConfiguration>(currentConfiguration);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = selected !== currentConfiguration;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selected);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Processing Fees
            </CardTitle>
            <CardDescription>
              Choose who pays the payment processing fees for online payments.
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  <strong>ACH/Bank transfers:</strong> ~0.8% (capped at $5)
                  <br />
                  <strong>Credit/Debit cards:</strong> ~2.9% + $0.30
                  <br />
                  <br />
                  ACH is significantly cheaper for rent payments.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <RadioGroup
          value={selected}
          onValueChange={(v) => setSelected(v as FeeConfiguration)}
          disabled={disabled || isSaving}
          className="grid gap-4"
        >
          {feeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selected === option.value;

            return (
              <label
                key={option.value}
                htmlFor={option.value}
                className={`relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="mt-1"
                  disabled={disabled}
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="font-medium">{option.label}</span>
                    {option.popular && (
                      <Badge variant="secondary" className="text-xs">
                        Popular
                      </Badge>
                    )}
                    {isSelected && currentConfiguration === option.value && (
                      <Badge variant="outline" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                  <p className="text-xs text-muted-foreground/80 italic">{option.example}</p>
                </div>
              </label>
            );
          })}
        </RadioGroup>

        {/* Fee breakdown example */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-3">Fee Example for $1,500 Rent Payment</h4>
          <div className="grid gap-3 text-sm">
            <div className="grid grid-cols-3 gap-2 pb-2 border-b text-xs text-muted-foreground font-medium">
              <span>Payment Method</span>
              <span className="text-right">Tenant Pays</span>
              <span className="text-right">You Receive</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">ACH Transfer</span>
              <span className="text-right font-medium">
                ${calculateTenantAmount(1500, ACH_FEE, selected).toFixed(2)}
              </span>
              <span className="text-right font-medium text-emerald-600">
                ${calculateLandlordAmount(1500, ACH_FEE, selected).toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">Credit Card</span>
              <span className="text-right font-medium">
                ${calculateTenantAmount(1500, CARD_FEE, selected, 0.3).toFixed(2)}
              </span>
              <span className="text-right font-medium text-emerald-600">
                ${calculateLandlordAmount(1500, CARD_FEE, selected, 0.3).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Save button */}
        {hasChanges && (
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setSelected(currentConfiguration)}
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

function calculateTenantAmount(
  rent: number,
  feePercent: number,
  config: FeeConfiguration,
  fixedFee: number = 0
): number {
  const totalFee = rent * feePercent + fixedFee;

  switch (config) {
    case 'LANDLORD_ABSORBS':
      return rent;
    case 'TENANT_PAYS':
      return rent + totalFee;
    case 'SPLIT_FEES':
      return rent + totalFee / 2;
  }
}

function calculateLandlordAmount(
  rent: number,
  feePercent: number,
  config: FeeConfiguration,
  fixedFee: number = 0
): number {
  const totalFee = rent * feePercent + fixedFee;

  switch (config) {
    case 'LANDLORD_ABSORBS':
      return rent - totalFee;
    case 'TENANT_PAYS':
      return rent;
    case 'SPLIT_FEES':
      return rent - totalFee / 2;
  }
}
