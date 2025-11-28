'use client';

import { useState } from 'react';
import {
  Calculator,
  Home,
  DollarSign,
  Percent,
  Building2,
  FileText,
  Scale,
  Clock,
  TrendingUp,
  MapPin,
  Users,
  CalendarDays,
  FileSearch,
  AlertTriangle,
  Sparkles,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ToolCard } from '@/components/toolbox/ToolCard';
import { ToolGrid, ToolSection } from '@/components/toolbox/ToolGrid';
import {
  ProratedRentCalc,
  RentIncomeRatioCalc,
  RentalCashflowCalc,
  VacancyCostCalc,
  LeaseAuditTool,
  RentIncreaseCalc
} from '@/components/toolbox/calculators';

// Calculator types
type CalculatorType =
  | 'rent'
  | 'roi'
  | 'cap-rate'
  | 'mortgage'
  | 'deposit'
  | 'late-fee'
  | 'lease'
  | 'state-law'
  | 'prorated-rent'
  | 'rent-income-ratio'
  | 'rental-cashflow'
  | 'vacancy-cost'
  | 'lease-audit'
  | 'rent-increase';

interface CalculatorCard {
  id: CalculatorType;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'financial' | 'legal' | 'ai';
  badge?: 'AI' | 'Popular' | 'New';
}

const calculators: CalculatorCard[] = [
  // AI Tools (Featured)
  {
    id: 'lease-audit',
    name: 'Lease Agreement AI Audit Tool',
    description: 'Upload a lease and get AI analysis for compliance issues and missing clauses',
    icon: FileSearch,
    category: 'ai',
    badge: 'AI'
  },
  {
    id: 'lease',
    name: 'AI Lease Generator',
    description: 'Generate state-compliant lease agreements with AI assistance',
    icon: FileText,
    category: 'ai',
    badge: 'AI'
  },
  // Financial Calculators
  {
    id: 'rent',
    name: 'Rent Estimate Calculator',
    description: 'Get market rent estimates based on location, size, and amenities',
    icon: MapPin,
    category: 'financial',
    badge: 'Popular'
  },
  {
    id: 'roi',
    name: 'Rental Property Calculator',
    description: 'Calculate ROI and returns on rental property investments',
    icon: TrendingUp,
    category: 'financial'
  },
  {
    id: 'prorated-rent',
    name: 'Prorated Rent Calculator',
    description: 'Calculate partial month rent for move-in or move-out dates',
    icon: CalendarDays,
    category: 'financial',
    badge: 'New'
  },
  {
    id: 'rent-income-ratio',
    name: 'Rent-to-Income Ratio Calculator',
    description: 'Check if a tenant can afford the rent based on their income',
    icon: Users,
    category: 'financial',
    badge: 'New'
  },
  {
    id: 'rental-cashflow',
    name: 'Rental Cashflow Calculator',
    description: 'Comprehensive property profitability and cashflow analysis',
    icon: DollarSign,
    category: 'financial',
    badge: 'New'
  },
  {
    id: 'vacancy-cost',
    name: 'Vacancy Cost Calculator',
    description: 'Calculate the true cost of a vacant rental unit',
    icon: AlertTriangle,
    category: 'financial',
    badge: 'New'
  },
  {
    id: 'rent-increase',
    name: 'Rent Increase Calculator',
    description: 'Determine optimal rent increase with tenant retention analysis',
    icon: TrendingUp,
    category: 'financial',
    badge: 'New'
  },
  {
    id: 'cap-rate',
    name: 'Cap Rate Calculator',
    description: 'Determine capitalization rate for property valuation',
    icon: Percent,
    category: 'financial'
  },
  {
    id: 'mortgage',
    name: 'Mortgage Calculator',
    description: 'Calculate monthly payments, interest, and amortization',
    icon: Home,
    category: 'financial'
  },
  // Legal Tools
  {
    id: 'deposit',
    name: 'Security Deposit Calculator',
    description: 'Calculate maximum security deposit amounts by state law',
    icon: DollarSign,
    category: 'legal'
  },
  {
    id: 'late-fee',
    name: 'Late Fee Calculator',
    description: 'Determine maximum allowable late fees by state',
    icon: Clock,
    category: 'legal'
  },
  {
    id: 'state-law',
    name: 'State Law Reference',
    description: 'Quick reference for landlord-tenant laws by state',
    icon: Scale,
    category: 'legal'
  }
];

// State data for legal calculations
const stateData: Record<string, { maxDeposit: string; lateFeeGrace: number; maxLateFee: string }> = {
  'AL': { maxDeposit: 'No limit', lateFeeGrace: 0, maxLateFee: 'Reasonable' },
  'AK': { maxDeposit: '2 months rent', lateFeeGrace: 0, maxLateFee: 'Reasonable' },
  'AZ': { maxDeposit: '1.5 months rent', lateFeeGrace: 5, maxLateFee: '5% of rent' },
  'CA': { maxDeposit: '2 months (unfurnished) / 3 months (furnished)', lateFeeGrace: 0, maxLateFee: 'Reasonable' },
  'CO': { maxDeposit: 'No limit', lateFeeGrace: 0, maxLateFee: 'Reasonable' },
  'CT': { maxDeposit: '2 months rent', lateFeeGrace: 9, maxLateFee: '5% of rent' },
  'DE': { maxDeposit: '1 month rent (unfurnished)', lateFeeGrace: 5, maxLateFee: '5% of rent' },
  'FL': { maxDeposit: 'No limit', lateFeeGrace: 0, maxLateFee: 'Reasonable' },
  'GA': { maxDeposit: 'No limit', lateFeeGrace: 0, maxLateFee: 'Reasonable' },
  'HI': { maxDeposit: '1 month rent', lateFeeGrace: 0, maxLateFee: '8% of rent' },
  'NY': { maxDeposit: '1 month rent', lateFeeGrace: 5, maxLateFee: '$50 or 5%' },
  'TX': { maxDeposit: 'No limit', lateFeeGrace: 2, maxLateFee: '12% of rent' },
  'WA': { maxDeposit: 'No limit', lateFeeGrace: 0, maxLateFee: 'Reasonable' },
};

export default function ToolboxPage() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType | null>(null);

  // Existing Calculator States (kept from original)
  const [rentAddress, setRentAddress] = useState('');
  const [rentBedrooms, setRentBedrooms] = useState('2');
  const [rentBathrooms, setRentBathrooms] = useState('1');
  const [rentSqft, setRentSqft] = useState('1000');
  const [rentEstimate, setRentEstimate] = useState<number | null>(null);

  const [roiPurchasePrice, setRoiPurchasePrice] = useState('250000');
  const [roiDownPayment, setRoiDownPayment] = useState('50000');
  const [roiMonthlyRent, setRoiMonthlyRent] = useState('2000');
  const [roiMonthlyExpenses, setRoiMonthlyExpenses] = useState('800');
  const [roiResult, setRoiResult] = useState<{ cashOnCash: number; totalROI: number } | null>(null);

  const [capNOI, setCapNOI] = useState('24000');
  const [capPropertyValue, setCapPropertyValue] = useState('300000');
  const [capResult, setCapResult] = useState<number | null>(null);

  const [mortgagePrincipal, setMortgagePrincipal] = useState('200000');
  const [mortgageRate, setMortgageRate] = useState('7.5');
  const [mortgageTerm, setMortgageTerm] = useState('30');
  const [mortgageResult, setMortgageResult] = useState<{ monthly: number; total: number; interest: number } | null>(null);

  const [depositState, setDepositState] = useState('CA');
  const [depositRent, setDepositRent] = useState('2000');
  const [depositFurnished, setDepositFurnished] = useState('no');
  const [depositResult, setDepositResult] = useState<string | null>(null);

  const [lateFeeState, setLateFeeState] = useState('CA');
  const [lateFeeRent, setLateFeeRent] = useState('2000');
  const [lateFeeResult, setLateFeeResult] = useState<{ grace: number; maxFee: string } | null>(null);

  const [leasePropertyAddress, setLeasePropertyAddress] = useState('');
  const [leaseTenantName, setLeaseTenantName] = useState('');
  const [leaseStartDate, setLeaseStartDate] = useState('');
  const [leaseEndDate, setLeaseEndDate] = useState('');
  const [leaseRent, setLeaseRent] = useState('');
  const [leaseState, setLeaseState] = useState('CA');
  const [leaseGenerating, setLeaseGenerating] = useState(false);
  const [leaseGenerated, setLeaseGenerated] = useState(false);

  const [lawState, setLawState] = useState('CA');

  // Calculator Functions
  const calculateRentEstimate = () => {
    const basePrices: Record<string, number> = {
      '0': 1200, '1': 1500, '2': 1800, '3': 2200, '4': 2800
    };
    const base = basePrices[rentBedrooms] || 1800;
    const sqftAdjustment = (parseInt(rentSqft) - 1000) * 0.5;
    const bathAdjustment = (parseFloat(rentBathrooms) - 1) * 150;
    const estimate = Math.round(base + sqftAdjustment + bathAdjustment);
    setRentEstimate(estimate);
  };

  const calculateROI = () => {
    const purchase = parseFloat(roiPurchasePrice);
    const down = parseFloat(roiDownPayment);
    const rent = parseFloat(roiMonthlyRent);
    const expenses = parseFloat(roiMonthlyExpenses);

    const annualCashFlow = (rent - expenses) * 12;
    const cashOnCash = (annualCashFlow / down) * 100;
    const totalROI = (annualCashFlow / purchase) * 100;

    setRoiResult({ cashOnCash: Math.round(cashOnCash * 100) / 100, totalROI: Math.round(totalROI * 100) / 100 });
  };

  const calculateCapRate = () => {
    const noi = parseFloat(capNOI);
    const value = parseFloat(capPropertyValue);
    const rate = (noi / value) * 100;
    setCapResult(Math.round(rate * 100) / 100);
  };

  const calculateMortgage = () => {
    const principal = parseFloat(mortgagePrincipal);
    const annualRate = parseFloat(mortgageRate) / 100;
    const monthlyRate = annualRate / 12;
    const numPayments = parseInt(mortgageTerm) * 12;

    const monthly = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    const total = monthly * numPayments;
    const interest = total - principal;

    setMortgageResult({
      monthly: Math.round(monthly * 100) / 100,
      total: Math.round(total * 100) / 100,
      interest: Math.round(interest * 100) / 100
    });
  };

  const calculateDeposit = () => {
    const state = stateData[depositState];
    const rent = parseFloat(depositRent);

    if (state) {
      let maxDeposit = state.maxDeposit;
      if (depositState === 'CA') {
        const months = depositFurnished === 'yes' ? 3 : 2;
        maxDeposit = `$${(rent * months).toLocaleString()} (${months} months rent)`;
      } else if (maxDeposit.includes('month')) {
        const monthMatch = maxDeposit.match(/(\d+\.?\d*)/);
        if (monthMatch) {
          const months = parseFloat(monthMatch[1]);
          maxDeposit = `$${(rent * months).toLocaleString()} (${state.maxDeposit})`;
        }
      }
      setDepositResult(maxDeposit);
    }
  };

  const calculateLateFee = () => {
    const state = stateData[lateFeeState];
    if (state) {
      setLateFeeResult({
        grace: state.lateFeeGrace,
        maxFee: state.maxLateFee
      });
    }
  };

  const generateLease = () => {
    setLeaseGenerating(true);
    setTimeout(() => {
      setLeaseGenerating(false);
      setLeaseGenerated(true);
    }, 2000);
  };

  const getCalculatorTitle = () => {
    return calculators.find(c => c.id === activeCalculator)?.name || '';
  };

  const getCalculatorDescription = () => {
    return calculators.find(c => c.id === activeCalculator)?.description || '';
  };

  // Group calculators by category
  const aiTools = calculators.filter(c => c.category === 'ai');
  const financialTools = calculators.filter(c => c.category === 'financial');
  const legalTools = calculators.filter(c => c.category === 'legal');

  const renderCalculatorContent = () => {
    switch (activeCalculator) {
      case 'prorated-rent':
        return <ProratedRentCalc />;
      case 'rent-income-ratio':
        return <RentIncomeRatioCalc />;
      case 'rental-cashflow':
        return <RentalCashflowCalc />;
      case 'vacancy-cost':
        return <VacancyCostCalc />;
      case 'lease-audit':
        return <LeaseAuditTool />;
      case 'rent-increase':
        return <RentIncreaseCalc />;

      case 'rent':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="rentAddress">Property Address or ZIP Code</Label>
                <Input
                  id="rentAddress"
                  placeholder="123 Main St, City, ST 12345"
                  value={rentAddress}
                  onChange={(e) => setRentAddress(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="rentBedrooms">Bedrooms</Label>
                  <Select value={rentBedrooms} onValueChange={setRentBedrooms}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Studio</SelectItem>
                      <SelectItem value="1">1 Bed</SelectItem>
                      <SelectItem value="2">2 Bed</SelectItem>
                      <SelectItem value="3">3 Bed</SelectItem>
                      <SelectItem value="4">4+ Bed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rentBathrooms">Bathrooms</Label>
                  <Select value={rentBathrooms} onValueChange={setRentBathrooms}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Bath</SelectItem>
                      <SelectItem value="1.5">1.5 Bath</SelectItem>
                      <SelectItem value="2">2 Bath</SelectItem>
                      <SelectItem value="2.5">2.5 Bath</SelectItem>
                      <SelectItem value="3">3+ Bath</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rentSqft">Square Feet</Label>
                  <Input
                    id="rentSqft"
                    type="number"
                    value={rentSqft}
                    onChange={(e) => setRentSqft(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <Button onClick={calculateRentEstimate} className="w-full">
              <MapPin className="h-4 w-4 mr-2" />
              Get Rent Estimate
            </Button>
            {rentEstimate && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-green-600 mb-1">Estimated Monthly Rent</p>
                    <p className="text-4xl font-bold text-green-700">${rentEstimate.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Range: ${(rentEstimate * 0.9).toLocaleString()} - ${(rentEstimate * 1.1).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'roi':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roiPurchase">Purchase Price ($)</Label>
                <Input
                  id="roiPurchase"
                  type="number"
                  value={roiPurchasePrice}
                  onChange={(e) => setRoiPurchasePrice(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="roiDown">Down Payment ($)</Label>
                <Input
                  id="roiDown"
                  type="number"
                  value={roiDownPayment}
                  onChange={(e) => setRoiDownPayment(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="roiRent">Monthly Rent ($)</Label>
                <Input
                  id="roiRent"
                  type="number"
                  value={roiMonthlyRent}
                  onChange={(e) => setRoiMonthlyRent(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="roiExpenses">Monthly Expenses ($)</Label>
                <Input
                  id="roiExpenses"
                  type="number"
                  value={roiMonthlyExpenses}
                  onChange={(e) => setRoiMonthlyExpenses(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={calculateROI} className="w-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              Calculate ROI
            </Button>
            {roiResult && (
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-blue-600 mb-1">Cash-on-Cash Return</p>
                    <p className="text-3xl font-bold text-blue-700">{roiResult.cashOnCash}%</p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-purple-600 mb-1">Total ROI</p>
                    <p className="text-3xl font-bold text-purple-700">{roiResult.totalROI}%</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );

      case 'cap-rate':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="capNOI">Annual Net Operating Income ($)</Label>
                <Input
                  id="capNOI"
                  type="number"
                  value={capNOI}
                  onChange={(e) => setCapNOI(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  NOI = Gross Income - Operating Expenses (excluding mortgage)
                </p>
              </div>
              <div>
                <Label htmlFor="capValue">Property Value ($)</Label>
                <Input
                  id="capValue"
                  type="number"
                  value={capPropertyValue}
                  onChange={(e) => setCapPropertyValue(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={calculateCapRate} className="w-full">
              <Percent className="h-4 w-4 mr-2" />
              Calculate Cap Rate
            </Button>
            {capResult !== null && (
              <Card className={`${capResult >= 8 ? 'bg-green-50 border-green-200' : capResult >= 5 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className={`text-sm mb-1 ${capResult >= 8 ? 'text-green-600' : capResult >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                      Capitalization Rate
                    </p>
                    <p className={`text-4xl font-bold ${capResult >= 8 ? 'text-green-700' : capResult >= 5 ? 'text-yellow-700' : 'text-red-700'}`}>
                      {capResult}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {capResult >= 8 ? 'Excellent investment' : capResult >= 5 ? 'Average investment' : 'Below average'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'mortgage':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="mortgagePrincipal">Loan Amount ($)</Label>
                <Input
                  id="mortgagePrincipal"
                  type="number"
                  value={mortgagePrincipal}
                  onChange={(e) => setMortgagePrincipal(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mortgageRate">Interest Rate (%)</Label>
                  <Input
                    id="mortgageRate"
                    type="number"
                    step="0.1"
                    value={mortgageRate}
                    onChange={(e) => setMortgageRate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="mortgageTerm">Loan Term (years)</Label>
                  <Select value={mortgageTerm} onValueChange={setMortgageTerm}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 years</SelectItem>
                      <SelectItem value="20">20 years</SelectItem>
                      <SelectItem value="30">30 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Button onClick={calculateMortgage} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Calculate Payment
            </Button>
            {mortgageResult && (
              <div className="space-y-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-blue-600 mb-1">Monthly Payment</p>
                    <p className="text-4xl font-bold text-blue-700">${mortgageResult.monthly.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-xs text-muted-foreground">Total Payments</p>
                      <p className="text-lg font-semibold">${mortgageResult.total.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-xs text-muted-foreground">Total Interest</p>
                      <p className="text-lg font-semibold">${mortgageResult.interest.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        );

      case 'deposit':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="depositState">State</Label>
                <Select value={depositState} onValueChange={setDepositState}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(stateData).map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="depositRent">Monthly Rent ($)</Label>
                <Input
                  id="depositRent"
                  type="number"
                  value={depositRent}
                  onChange={(e) => setDepositRent(e.target.value)}
                />
              </div>
              {depositState === 'CA' && (
                <div>
                  <Label>Is the unit furnished?</Label>
                  <Select value={depositFurnished} onValueChange={setDepositFurnished}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No - Unfurnished</SelectItem>
                      <SelectItem value="yes">Yes - Furnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <Button onClick={calculateDeposit} className="w-full">
              <DollarSign className="h-4 w-4 mr-2" />
              Calculate Maximum Deposit
            </Button>
            {depositResult && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-green-600 mb-1">Maximum Security Deposit</p>
                    <p className="text-2xl font-bold text-green-700">{depositResult}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'late-fee':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="lateFeeState">State</Label>
                <Select value={lateFeeState} onValueChange={setLateFeeState}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(stateData).map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="lateFeeRent">Monthly Rent ($)</Label>
                <Input
                  id="lateFeeRent"
                  type="number"
                  value={lateFeeRent}
                  onChange={(e) => setLateFeeRent(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={calculateLateFee} className="w-full">
              <Clock className="h-4 w-4 mr-2" />
              Calculate Late Fee Limits
            </Button>
            {lateFeeResult && (
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-orange-600 mb-1">Grace Period</p>
                    <p className="text-3xl font-bold text-orange-700">
                      {lateFeeResult.grace > 0 ? `${lateFeeResult.grace} days` : 'None'}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-red-600 mb-1">Maximum Fee</p>
                    <p className="text-2xl font-bold text-red-700">{lateFeeResult.maxFee}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );

      case 'lease':
        return (
          <div className="space-y-6">
            {!leaseGenerated ? (
              <>
                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <span className="text-sm text-purple-700">AI-powered lease generation based on state laws</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="leaseAddress">Property Address</Label>
                    <Input
                      id="leaseAddress"
                      placeholder="123 Main St, City, ST 12345"
                      value={leasePropertyAddress}
                      onChange={(e) => setLeasePropertyAddress(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="leaseTenant">Tenant Name(s)</Label>
                    <Input
                      id="leaseTenant"
                      placeholder="John Doe, Jane Doe"
                      value={leaseTenantName}
                      onChange={(e) => setLeaseTenantName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="leaseStart">Lease Start Date</Label>
                    <Input
                      id="leaseStart"
                      type="date"
                      value={leaseStartDate}
                      onChange={(e) => setLeaseStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="leaseEnd">Lease End Date</Label>
                    <Input
                      id="leaseEnd"
                      type="date"
                      value={leaseEndDate}
                      onChange={(e) => setLeaseEndDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="leaseRent">Monthly Rent ($)</Label>
                    <Input
                      id="leaseRent"
                      type="number"
                      value={leaseRent}
                      onChange={(e) => setLeaseRent(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="leaseState">State</Label>
                    <Select value={leaseState} onValueChange={setLeaseState}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(stateData).map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={generateLease}
                  className="w-full"
                  disabled={leaseGenerating}
                >
                  {leaseGenerating ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Generating Lease...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Lease Agreement
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6 text-center">
                    <FileText className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <p className="font-semibold text-green-700">Lease Agreement Generated!</p>
                    <p className="text-sm text-green-600 mt-1">
                      Compliant with {leaseState} landlord-tenant laws
                    </p>
                  </CardContent>
                </Card>
                <div className="flex gap-2">
                  <Button className="flex-1">Download PDF</Button>
                  <Button variant="outline" className="flex-1">Send for E-Sign</Button>
                </div>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setLeaseGenerated(false)}
                >
                  Generate Another Lease
                </Button>
              </div>
            )}
          </div>
        );

      case 'state-law':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="lawState">Select State</Label>
              <Select value={lawState} onValueChange={setLawState}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(stateData).map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {stateData[lawState] && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Security Deposit Limits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{stateData[lawState].maxDeposit}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Late Fee Grace Period</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">
                      {stateData[lawState].lateFeeGrace > 0
                        ? `${stateData[lawState].lateFeeGrace} days`
                        : 'No required grace period'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Maximum Late Fee</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{stateData[lawState].maxLateFee}</p>
                  </CardContent>
                </Card>
                <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                  <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-700">
                    Laws change frequently. Always verify current requirements with your state's official resources or a legal professional.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tools & Calculators</h1>
        <p className="text-muted-foreground">
          Powerful tools to help you manage your rental properties
        </p>
      </div>

      {/* AI Tools Section */}
      <ToolSection
        title="AI-Powered Tools"
        subtitle="Smart tools powered by artificial intelligence"
      >
        {aiTools.map((calc) => (
          <ToolCard
            key={calc.id}
            id={calc.id}
            title={calc.name}
            description={calc.description}
            icon={calc.icon}
            badge={calc.badge}
            onClick={() => setActiveCalculator(calc.id)}
          />
        ))}
      </ToolSection>

      {/* Financial Tools Section */}
      <ToolSection
        title="Financial Calculators"
        subtitle="Calculate rent, ROI, cashflow, and more"
      >
        {financialTools.map((calc) => (
          <ToolCard
            key={calc.id}
            id={calc.id}
            title={calc.name}
            description={calc.description}
            icon={calc.icon}
            badge={calc.badge}
            onClick={() => setActiveCalculator(calc.id)}
          />
        ))}
      </ToolSection>

      {/* Legal Tools Section */}
      <ToolSection
        title="Legal Tools"
        subtitle="Stay compliant with state landlord-tenant laws"
      >
        {legalTools.map((calc) => (
          <ToolCard
            key={calc.id}
            id={calc.id}
            title={calc.name}
            description={calc.description}
            icon={calc.icon}
            badge={calc.badge}
            onClick={() => setActiveCalculator(calc.id)}
          />
        ))}
      </ToolSection>

      {/* Quick Reference Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Reference</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Good Cap Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">8-12%</p>
              <p className="text-sm text-muted-foreground">
                Generally considered a good cap rate for rental properties
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Percent className="h-4 w-4 text-blue-600" />
                1% Rule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">1%</p>
              <p className="text-sm text-muted-foreground">
                Monthly rent should be at least 1% of purchase price
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-purple-600" />
                50% Rule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-600">50%</p>
              <p className="text-sm text-muted-foreground">
                Expect expenses to be ~50% of rental income
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Calculator Dialog */}
      <Dialog open={activeCalculator !== null} onOpenChange={() => setActiveCalculator(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {getCalculatorTitle()}
            </DialogTitle>
            <DialogDescription>
              {getCalculatorDescription()}
            </DialogDescription>
          </DialogHeader>
          {renderCalculatorContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
