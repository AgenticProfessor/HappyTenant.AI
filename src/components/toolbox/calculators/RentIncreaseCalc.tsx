'use client';

import { useState } from 'react';
import { TrendingUp, AlertTriangle, Calculator, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface RentIncreaseCalcProps {
  onClose?: () => void;
}

interface IncreaseResult {
  suggestedIncrease: number;
  newRent: number;
  percentageIncrease: number;
  marketComparison: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  recommendation: string;
}

export function RentIncreaseCalc({ onClose }: RentIncreaseCalcProps) {
  const [currentRent, setCurrentRent] = useState('2000');
  const [marketRent, setMarketRent] = useState('2200');
  const [yearsSinceIncrease, setYearsSinceIncrease] = useState('1');
  const [rentControlLimit, setRentControlLimit] = useState('none');
  const [tenantPriority, setTenantPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [tenantLength, setTenantLength] = useState('2');

  const [result, setResult] = useState<IncreaseResult | null>(null);

  const calculateRentIncrease = () => {
    const current = parseFloat(currentRent);
    const market = parseFloat(marketRent);
    const years = parseInt(yearsSinceIncrease);
    const tenantYears = parseInt(tenantLength);

    // Calculate market gap
    const marketGap = ((market - current) / current) * 100;

    // Base increase considering years without increase (3% per year baseline)
    let baseIncrease = Math.min(years * 3, marketGap);

    // Apply rent control limit if applicable
    let maxIncrease = 100;
    if (rentControlLimit !== 'none') {
      maxIncrease = parseFloat(rentControlLimit);
      baseIncrease = Math.min(baseIncrease, maxIncrease);
    }

    // Adjust based on tenant retention priority
    let priorityMultiplier = 1;
    if (tenantPriority === 'high') {
      priorityMultiplier = 0.6; // Reduce increase to retain
    } else if (tenantPriority === 'low') {
      priorityMultiplier = 1.2; // More aggressive increase
    }

    // Adjust for long-term tenants
    let tenantDiscount = 0;
    if (tenantYears >= 5) {
      tenantDiscount = 1; // 1% discount for 5+ years
    } else if (tenantYears >= 3) {
      tenantDiscount = 0.5; // 0.5% discount for 3+ years
    }

    // Calculate final percentage
    let finalPercentage = Math.max(0, (baseIncrease * priorityMultiplier) - tenantDiscount);

    // Round to nearest 0.5%
    finalPercentage = Math.round(finalPercentage * 2) / 2;

    // Cap at rent control if applicable
    if (rentControlLimit !== 'none') {
      finalPercentage = Math.min(finalPercentage, maxIncrease);
    }

    // Calculate amounts
    const suggestedIncrease = Math.round((current * finalPercentage) / 100);
    const newRent = current + suggestedIncrease;
    const marketComparison = ((newRent / market) * 100);

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    const riskFactors: string[] = [];

    if (finalPercentage > 10) {
      riskLevel = 'high';
      riskFactors.push('Large increase may cause tenant to leave');
    } else if (finalPercentage > 5) {
      riskLevel = 'medium';
    }

    if (tenantYears >= 3 && finalPercentage > 5) {
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
      riskFactors.push('Long-term tenant may seek alternatives');
    }

    if (newRent > market) {
      riskLevel = 'high';
      riskFactors.push('New rent exceeds market rate');
    }

    if (years === 0) {
      riskFactors.push('Recent increase may feel excessive to tenant');
    }

    // Generate recommendation
    let recommendation = '';
    if (marketGap <= 0) {
      recommendation = 'Your rent is at or above market rate. Consider a modest increase (2-3%) or no increase to retain tenant.';
    } else if (riskLevel === 'high') {
      recommendation = 'Consider a phased approach: split the increase over 2 years to reduce turnover risk.';
    } else if (riskLevel === 'medium') {
      recommendation = 'This increase is reasonable but communicate value improvements to justify.';
    } else {
      recommendation = 'This is a conservative increase that should be well-received by tenant.';
    }

    setResult({
      suggestedIncrease,
      newRent,
      percentageIncrease: finalPercentage,
      marketComparison: Math.round(marketComparison),
      riskLevel,
      riskFactors,
      recommendation,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currentRent">Current Monthly Rent ($)</Label>
            <Input
              id="currentRent"
              type="number"
              value={currentRent}
              onChange={(e) => setCurrentRent(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="marketRent">Market Rent ($)</Label>
            <Input
              id="marketRent"
              type="number"
              value={marketRent}
              onChange={(e) => setMarketRent(e.target.value)}
              placeholder="Comparable units in area"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="yearsSinceIncrease">Years Since Last Increase</Label>
            <Select value={yearsSinceIncrease} onValueChange={setYearsSinceIncrease}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Less than 1 year</SelectItem>
                <SelectItem value="1">1 year</SelectItem>
                <SelectItem value="2">2 years</SelectItem>
                <SelectItem value="3">3 years</SelectItem>
                <SelectItem value="4">4+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tenantLength">Tenant Tenure (years)</Label>
            <Select value={tenantLength} onValueChange={setTenantLength}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Less than 1 year</SelectItem>
                <SelectItem value="2">1-2 years</SelectItem>
                <SelectItem value="3">3-4 years</SelectItem>
                <SelectItem value="5">5+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rentControlLimit">Rent Control Limit</Label>
            <Select value={rentControlLimit} onValueChange={setRentControlLimit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No rent control</SelectItem>
                <SelectItem value="3">3% max (strict)</SelectItem>
                <SelectItem value="5">5% max</SelectItem>
                <SelectItem value="7">7% max</SelectItem>
                <SelectItem value="10">10% max (lenient)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tenantPriority">Tenant Retention Priority</Label>
            <Select value={tenantPriority} onValueChange={(v: 'high' | 'medium' | 'low') => setTenantPriority(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High (Great tenant)</SelectItem>
                <SelectItem value="medium">Medium (Average)</SelectItem>
                <SelectItem value="low">Low (Would replace)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button onClick={calculateRentIncrease} className="w-full">
        <Calculator className="h-4 w-4 mr-2" />
        Calculate Optimal Increase
      </Button>

      {result && (
        <div className="space-y-4">
          {/* Suggested Increase Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Suggested New Rent</p>
                  <p className="text-3xl font-bold text-primary">
                    ${result.newRent.toLocaleString()}/mo
                  </p>
                  <p className="text-sm text-green-600">
                    +${result.suggestedIncrease}/mo ({result.percentageIncrease}% increase)
                  </p>
                </div>
                <div className="text-right">
                  <TrendingUp className="h-10 w-10 text-primary opacity-50" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Comparison */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium">New Rent vs Market</p>
                <p className={cn(
                  "font-semibold",
                  result.marketComparison > 100 ? "text-red-600" : result.marketComparison >= 95 ? "text-yellow-600" : "text-green-600"
                )}>
                  {result.marketComparison}%
                </p>
              </div>
              <Progress
                value={Math.min(result.marketComparison, 110)}
                className="h-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Below Market</span>
                <span>Market Rate (${marketRent})</span>
                <span>Above</span>
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card className={cn(
            result.riskLevel === 'low' && "bg-green-50 border-green-200 dark:bg-green-950",
            result.riskLevel === 'medium' && "bg-yellow-50 border-yellow-200 dark:bg-yellow-950",
            result.riskLevel === 'high' && "bg-red-50 border-red-200 dark:bg-red-950"
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Tenant Turnover Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                {result.riskLevel === 'high' && (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <span className={cn(
                  "font-semibold capitalize",
                  result.riskLevel === 'low' && "text-green-700",
                  result.riskLevel === 'medium' && "text-yellow-700",
                  result.riskLevel === 'high' && "text-red-700"
                )}>
                  {result.riskLevel} Risk
                </span>
              </div>

              {result.riskFactors.length > 0 && (
                <ul className="space-y-1 mb-3">
                  {result.riskFactors.map((factor, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-yellow-600">•</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              )}

              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Recommendation: </span>
                  {result.recommendation}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="pt-3 text-center">
                <DollarSign className="h-4 w-4 text-green-600 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Monthly Gain</p>
                <p className="font-bold text-green-600">
                  +${result.suggestedIncrease}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3 text-center">
                <TrendingUp className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Annual Gain</p>
                <p className="font-bold text-blue-600">
                  +${(result.suggestedIncrease * 12).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3 text-center">
                <Users className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">% Increase</p>
                <p className="font-bold text-purple-600">
                  {result.percentageIncrease}%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
