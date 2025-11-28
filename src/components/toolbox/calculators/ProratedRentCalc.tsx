'use client';

import { useState } from 'react';
import { CalendarDays, Calculator } from 'lucide-react';
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

type ProrationMethod = 'actual' | '30day' | 'banker';

interface ProratedRentCalcProps {
  onClose?: () => void;
}

export function ProratedRentCalc({ onClose }: ProratedRentCalcProps) {
  const [monthlyRent, setMonthlyRent] = useState('2000');
  const [moveDate, setMoveDate] = useState('');
  const [isMoveIn, setIsMoveIn] = useState<'in' | 'out'>('in');
  const [prorationMethod, setProrationMethod] = useState<ProrationMethod>('actual');
  const [result, setResult] = useState<{
    proratedAmount: number;
    daysCharged: number;
    dailyRate: number;
    daysInMonth: number;
  } | null>(null);

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const calculateProratedRent = () => {
    if (!moveDate) return;

    const rent = parseFloat(monthlyRent);
    const date = new Date(moveDate);
    const dayOfMonth = date.getDate();
    const daysInMonth = getDaysInMonth(date);

    let dailyRate: number;
    let daysCharged: number;

    // Calculate daily rate based on method
    switch (prorationMethod) {
      case '30day':
        dailyRate = rent / 30;
        break;
      case 'banker':
        dailyRate = rent / 30;
        break;
      case 'actual':
      default:
        dailyRate = rent / daysInMonth;
        break;
    }

    // Calculate days charged based on move-in or move-out
    if (isMoveIn === 'in') {
      // Move-in: charge from move-in date to end of month
      daysCharged = daysInMonth - dayOfMonth + 1;
    } else {
      // Move-out: charge from start of month to move-out date
      daysCharged = dayOfMonth;
    }

    // For banker's method, cap at 30 days
    if (prorationMethod === 'banker' && daysCharged > 30) {
      daysCharged = 30;
    }

    const proratedAmount = dailyRate * daysCharged;

    setResult({
      proratedAmount: Math.round(proratedAmount * 100) / 100,
      daysCharged,
      dailyRate: Math.round(dailyRate * 100) / 100,
      daysInMonth,
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
            <Label htmlFor="moveType">Move Type</Label>
            <Select value={isMoveIn} onValueChange={(v: 'in' | 'out') => setIsMoveIn(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Move-In</SelectItem>
                <SelectItem value="out">Move-Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="moveDate">{isMoveIn === 'in' ? 'Move-In' : 'Move-Out'} Date</Label>
            <Input
              id="moveDate"
              type="date"
              value={moveDate}
              onChange={(e) => setMoveDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="prorationMethod">Proration Method</Label>
          <Select value={prorationMethod} onValueChange={(v: ProrationMethod) => setProrationMethod(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="actual">Actual Days (Rent ÷ Days in Month)</SelectItem>
              <SelectItem value="30day">30-Day Month (Rent ÷ 30)</SelectItem>
              <SelectItem value="banker">Banker's Month (30 days max)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {prorationMethod === 'actual' && 'Most common - uses actual number of days in the month'}
            {prorationMethod === '30day' && 'Assumes every month has 30 days'}
            {prorationMethod === 'banker' && 'Uses 30-day month and caps days at 30'}
          </p>
        </div>
      </div>

      <Button onClick={calculateProratedRent} className="w-full" disabled={!moveDate}>
        <Calculator className="h-4 w-4 mr-2" />
        Calculate Prorated Rent
      </Button>

      {result && (
        <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <CalendarDays className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                Prorated Rent Amount
              </p>
              <p className="text-4xl font-bold text-green-700 dark:text-green-300">
                ${result.proratedAmount.toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Days Charged</p>
                <p className="text-lg font-semibold">{result.daysCharged}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Daily Rate</p>
                <p className="text-lg font-semibold">${result.dailyRate}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Days in Month</p>
                <p className="text-lg font-semibold">{result.daysInMonth}</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                <strong>Calculation:</strong> ${result.dailyRate}/day × {result.daysCharged} days = ${result.proratedAmount.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
