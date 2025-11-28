'use client';

import { useState } from 'react';
import { Users, CheckCircle2, XCircle, Calculator } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

interface RentIncomeRatioCalcProps {
  onClose?: () => void;
}

export function RentIncomeRatioCalc({ onClose }: RentIncomeRatioCalcProps) {
  const [monthlyRent, setMonthlyRent] = useState('2000');
  const [incomeType, setIncomeType] = useState<'monthly' | 'annual'>('monthly');
  const [grossIncome, setGrossIncome] = useState('6000');
  const [numApplicants, setNumApplicants] = useState('1');
  const [threshold, setThreshold] = useState('30');
  const [result, setResult] = useState<{
    ratio: number;
    passes: boolean;
    maxAffordableRent: number;
    minRequiredIncome: number;
    monthlyIncome: number;
  } | null>(null);

  const calculateRatio = () => {
    const rent = parseFloat(monthlyRent);
    const income = parseFloat(grossIncome);
    const applicants = parseInt(numApplicants);
    const thresholdPct = parseFloat(threshold);

    // Convert to monthly if annual
    const monthlyIncome = incomeType === 'annual' ? income / 12 : income;

    // Total income across all applicants
    const totalMonthlyIncome = monthlyIncome * applicants;

    // Calculate ratio
    const ratio = (rent / totalMonthlyIncome) * 100;

    // Calculate max affordable rent at threshold
    const maxAffordableRent = totalMonthlyIncome * (thresholdPct / 100);

    // Calculate minimum required income for this rent
    const minRequiredIncome = rent / (thresholdPct / 100);

    setResult({
      ratio: Math.round(ratio * 10) / 10,
      passes: ratio <= thresholdPct,
      maxAffordableRent: Math.round(maxAffordableRent),
      minRequiredIncome: Math.round(minRequiredIncome),
      monthlyIncome: Math.round(totalMonthlyIncome),
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="monthlyRent">Monthly Rent ($)</Label>
          <Input
            id="monthlyRent"
            type="number"
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(e.target.value)}
            placeholder="2000"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="incomeType">Income Period</Label>
            <Select value={incomeType} onValueChange={(v: 'monthly' | 'annual') => setIncomeType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly Income</SelectItem>
                <SelectItem value="annual">Annual Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="grossIncome">Gross Income ($)</Label>
            <Input
              id="grossIncome"
              type="number"
              value={grossIncome}
              onChange={(e) => setGrossIncome(e.target.value)}
              placeholder={incomeType === 'annual' ? '72000' : '6000'}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="numApplicants">Number of Applicants</Label>
            <Select value={numApplicants} onValueChange={setNumApplicants}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Applicant</SelectItem>
                <SelectItem value="2">2 Applicants</SelectItem>
                <SelectItem value="3">3 Applicants</SelectItem>
                <SelectItem value="4">4 Applicants</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Combined income of all applicants
            </p>
          </div>
          <div>
            <Label htmlFor="threshold">Threshold (%)</Label>
            <Select value={threshold} onValueChange={setThreshold}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25% (Conservative)</SelectItem>
                <SelectItem value="30">30% (Standard)</SelectItem>
                <SelectItem value="33">33% (Flexible)</SelectItem>
                <SelectItem value="40">40% (Lenient)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Industry standard is 30%
            </p>
          </div>
        </div>
      </div>

      <Button onClick={calculateRatio} className="w-full">
        <Calculator className="h-4 w-4 mr-2" />
        Calculate Ratio
      </Button>

      {result && (
        <div className="space-y-4">
          {/* Pass/Fail Card */}
          <Card className={cn(
            result.passes
              ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
              : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
          )}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                {result.passes ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
                <div>
                  <p className={cn(
                    "text-lg font-semibold",
                    result.passes ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                  )}>
                    {result.passes ? 'Passes Affordability Check' : 'Fails Affordability Check'}
                  </p>
                  <p className={cn(
                    "text-sm",
                    result.passes ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>
                    Rent is {result.ratio}% of income (threshold: {threshold}%)
                  </p>
                </div>
              </div>

              {/* Progress bar visualization */}
              <div className="mb-2">
                <Progress
                  value={Math.min(result.ratio, 100)}
                  className={cn(
                    "h-3",
                    result.passes ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"
                  )}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span className="font-medium">{threshold}% threshold</span>
                <span>100%</span>
              </div>
            </CardContent>
          </Card>

          {/* Details Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-4 text-center">
                <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Combined Monthly Income</p>
                <p className="text-xl font-bold">${result.monthlyIncome.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-muted-foreground">Rent-to-Income Ratio</p>
                <p className={cn(
                  "text-3xl font-bold",
                  result.passes ? "text-green-600" : "text-red-600"
                )}>
                  {result.ratio}%
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-blue-50 dark:bg-blue-950">
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-blue-600 dark:text-blue-400">Max Affordable Rent</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  ${result.maxAffordableRent.toLocaleString()}/mo
                </p>
                <p className="text-xs text-muted-foreground">at {threshold}% threshold</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 dark:bg-purple-950">
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-purple-600 dark:text-purple-400">Min Required Income</p>
                <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                  ${result.minRequiredIncome.toLocaleString()}/mo
                </p>
                <p className="text-xs text-muted-foreground">for ${monthlyRent}/mo rent</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
