'use client';

import { useState } from 'react';
import { Home, AlertTriangle, Calculator, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface VacancyCostCalcProps {
  onClose?: () => void;
}

interface VacancyResult {
  lostRent: number;
  turnoverCosts: number;
  totalVacancyCost: number;
  costPerDay: number;
  annualImpact: number;
  effectiveVacancyRate: number;
  breakEvenOccupancy: number;
}

export function VacancyCostCalc({ onClose }: VacancyCostCalcProps) {
  const [monthlyRent, setMonthlyRent] = useState('2000');
  const [daysVacant, setDaysVacant] = useState('30');
  const [cleaningCost, setCleaningCost] = useState('200');
  const [repairsCost, setRepairsCost] = useState('500');
  const [paintingCost, setPaintingCost] = useState('300');
  const [marketingCost, setMarketingCost] = useState('100');
  const [utilityCost, setUtilityCost] = useState('150');

  const [result, setResult] = useState<VacancyResult | null>(null);

  const calculateVacancyCost = () => {
    const rent = parseFloat(monthlyRent);
    const days = parseInt(daysVacant);
    const cleaning = parseFloat(cleaningCost) || 0;
    const repairs = parseFloat(repairsCost) || 0;
    const painting = parseFloat(paintingCost) || 0;
    const marketing = parseFloat(marketingCost) || 0;
    const utilities = parseFloat(utilityCost) || 0;

    // Calculate daily rent
    const dailyRent = rent / 30;

    // Lost rent during vacancy
    const lostRent = dailyRent * days;

    // Total turnover costs
    const turnoverCosts = cleaning + repairs + painting + marketing + utilities;

    // Total vacancy cost
    const totalVacancyCost = lostRent + turnoverCosts;

    // Cost per day of vacancy
    const costPerDay = totalVacancyCost / days;

    // Annual impact (if this vacancy rate continues)
    const annualRent = rent * 12;
    const vacancyRate = days / 365;
    const annualImpact = totalVacancyCost * (365 / days);

    // Effective vacancy rate as percentage
    const effectiveVacancyRate = (days / 365) * 100;

    // Break-even occupancy rate
    const breakEvenOccupancy = 100 - effectiveVacancyRate;

    setResult({
      lostRent: Math.round(lostRent),
      turnoverCosts: Math.round(turnoverCosts),
      totalVacancyCost: Math.round(totalVacancyCost),
      costPerDay: Math.round(costPerDay),
      annualImpact: Math.round(annualImpact),
      effectiveVacancyRate: Math.round(effectiveVacancyRate * 10) / 10,
      breakEvenOccupancy: Math.round(breakEvenOccupancy * 10) / 10,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="monthlyRent">Monthly Rent ($)</Label>
            <Input
              id="monthlyRent"
              type="number"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="daysVacant">Days Vacant</Label>
            <Input
              id="daysVacant"
              type="number"
              value={daysVacant}
              onChange={(e) => setDaysVacant(e.target.value)}
            />
          </div>
        </div>

        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide pt-2">
          Turnover Costs
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cleaningCost">Cleaning ($)</Label>
            <Input
              id="cleaningCost"
              type="number"
              value={cleaningCost}
              onChange={(e) => setCleaningCost(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="repairsCost">Repairs ($)</Label>
            <Input
              id="repairsCost"
              type="number"
              value={repairsCost}
              onChange={(e) => setRepairsCost(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="paintingCost">Painting ($)</Label>
            <Input
              id="paintingCost"
              type="number"
              value={paintingCost}
              onChange={(e) => setPaintingCost(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="marketingCost">Marketing/Listing ($)</Label>
            <Input
              id="marketingCost"
              type="number"
              value={marketingCost}
              onChange={(e) => setMarketingCost(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="utilityCost">Utilities During Vacancy ($)</Label>
            <Input
              id="utilityCost"
              type="number"
              value={utilityCost}
              onChange={(e) => setUtilityCost(e.target.value)}
              placeholder="Electric, water, etc. while vacant"
            />
          </div>
        </div>
      </div>

      <Button onClick={calculateVacancyCost} className="w-full">
        <Calculator className="h-4 w-4 mr-2" />
        Calculate Vacancy Cost
      </Button>

      {result && (
        <div className="space-y-4">
          {/* Total Cost Card */}
          <Card className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="text-center">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Total Vacancy Cost
                  </p>
                  <p className="text-4xl font-bold text-red-700 dark:text-red-300">
                    ${result.totalVacancyCost.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    for {daysVacant} days vacant
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-4 text-center">
                <Home className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Lost Rent</p>
                <p className="text-xl font-bold text-orange-600">
                  ${result.lostRent.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Calendar className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Turnover Costs</p>
                <p className="text-xl font-bold text-purple-600">
                  ${result.turnoverCosts.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Daily and Annual Impact */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-orange-50 dark:bg-orange-950">
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-orange-600 dark:text-orange-400">Cost Per Day</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  ${result.costPerDay}/day
                </p>
                <p className="text-xs text-muted-foreground">
                  Every day vacant
                </p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 dark:bg-red-950">
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-red-600 dark:text-red-400">Annual Impact</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  ${result.annualImpact.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  If rate continues
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Vacancy Rate */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Effective Vacancy Rate</p>
                  <p className="text-xs text-muted-foreground">Based on {daysVacant} days</p>
                </div>
                <p className={cn(
                  "text-2xl font-bold",
                  result.effectiveVacancyRate > 8 ? "text-red-600" : result.effectiveVacancyRate > 5 ? "text-orange-600" : "text-green-600"
                )}>
                  {result.effectiveVacancyRate}%
                </p>
              </div>
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-center">
                  <span className="text-muted-foreground">Break-even occupancy: </span>
                  <span className="font-semibold text-blue-700 dark:text-blue-300">
                    {result.breakEvenOccupancy}%
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Tips to Reduce Vacancy Costs
              </p>
              <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Start marketing 60 days before lease ends</li>
                <li>• Offer move-in specials during slow seasons</li>
                <li>• Maintain property well to retain tenants longer</li>
                <li>• Consider slight rent reduction vs. long vacancy</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
