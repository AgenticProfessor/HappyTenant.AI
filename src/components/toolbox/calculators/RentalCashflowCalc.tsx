'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calculator, PieChart } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface RentalCashflowCalcProps {
  onClose?: () => void;
}

interface CashflowResult {
  monthlyIncome: number;
  monthlyExpenses: number;
  mortgagePayment: number;
  monthlyCashflow: number;
  annualCashflow: number;
  cashOnCashReturn: number;
  capRate: number;
  totalInvestment: number;
  expenseBreakdown: {
    mortgage: number;
    taxes: number;
    insurance: number;
    hoa: number;
    management: number;
    maintenance: number;
    vacancy: number;
    utilities: number;
  };
}

export function RentalCashflowCalc({ onClose }: RentalCashflowCalcProps) {
  // Property Details
  const [purchasePrice, setPurchasePrice] = useState('300000');
  const [downPaymentPct, setDownPaymentPct] = useState('20');
  const [interestRate, setInterestRate] = useState('7.5');
  const [loanTerm, setLoanTerm] = useState('30');

  // Income
  const [monthlyRent, setMonthlyRent] = useState('2500');
  const [otherIncome, setOtherIncome] = useState('0');

  // Expenses
  const [propertyTax, setPropertyTax] = useState('300');
  const [insurance, setInsurance] = useState('150');
  const [hoa, setHoa] = useState('0');
  const [managementPct, setManagementPct] = useState('10');
  const [maintenancePct, setMaintenancePct] = useState('5');
  const [vacancyPct, setVacancyPct] = useState('5');
  const [utilities, setUtilities] = useState('0');

  const [result, setResult] = useState<CashflowResult | null>(null);

  const calculateMortgage = (principal: number, annualRate: number, years: number): number => {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    if (monthlyRate === 0) return principal / numPayments;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  };

  const calculateCashflow = () => {
    const price = parseFloat(purchasePrice);
    const downPct = parseFloat(downPaymentPct) / 100;
    const rate = parseFloat(interestRate);
    const term = parseInt(loanTerm);
    const rent = parseFloat(monthlyRent);
    const other = parseFloat(otherIncome) || 0;
    const taxes = parseFloat(propertyTax);
    const ins = parseFloat(insurance);
    const hoaFee = parseFloat(hoa) || 0;
    const mgmtPct = parseFloat(managementPct) / 100;
    const maintPct = parseFloat(maintenancePct) / 100;
    const vacPct = parseFloat(vacancyPct) / 100;
    const utils = parseFloat(utilities) || 0;

    // Calculate values
    const downPayment = price * downPct;
    const loanAmount = price - downPayment;
    const mortgagePayment = calculateMortgage(loanAmount, rate, term);

    // Income
    const monthlyIncome = rent + other;

    // Expense calculations
    const management = rent * mgmtPct;
    const maintenance = rent * maintPct;
    const vacancy = rent * vacPct;

    const monthlyExpenses = taxes + ins + hoaFee + management + maintenance + vacancy + utils;
    const totalMonthlyOutflow = monthlyExpenses + mortgagePayment;

    // Cashflow
    const monthlyCashflow = monthlyIncome - totalMonthlyOutflow;
    const annualCashflow = monthlyCashflow * 12;

    // Returns
    const totalInvestment = downPayment + (price * 0.03); // Include closing costs estimate
    const cashOnCashReturn = (annualCashflow / totalInvestment) * 100;

    // Cap Rate (NOI / Property Value)
    const annualNOI = (monthlyIncome - monthlyExpenses) * 12;
    const capRate = (annualNOI / price) * 100;

    setResult({
      monthlyIncome: Math.round(monthlyIncome),
      monthlyExpenses: Math.round(totalMonthlyOutflow),
      mortgagePayment: Math.round(mortgagePayment),
      monthlyCashflow: Math.round(monthlyCashflow),
      annualCashflow: Math.round(annualCashflow),
      cashOnCashReturn: Math.round(cashOnCashReturn * 10) / 10,
      capRate: Math.round(capRate * 10) / 10,
      totalInvestment: Math.round(totalInvestment),
      expenseBreakdown: {
        mortgage: Math.round(mortgagePayment),
        taxes: Math.round(taxes),
        insurance: Math.round(ins),
        hoa: Math.round(hoaFee),
        management: Math.round(management),
        maintenance: Math.round(maintenance),
        vacancy: Math.round(vacancy),
        utilities: Math.round(utils),
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Property Details */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Property Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
            <Input
              id="purchasePrice"
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="downPaymentPct">Down Payment (%)</Label>
            <Select value={downPaymentPct} onValueChange={setDownPaymentPct}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="15">15%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
                <SelectItem value="25">25%</SelectItem>
                <SelectItem value="30">30%</SelectItem>
                <SelectItem value="100">100% (Cash)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="loanTerm">Loan Term</Label>
            <Select value={loanTerm} onValueChange={setLoanTerm}>
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

      {/* Income */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Monthly Income
        </h3>
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
            <Label htmlFor="otherIncome">Other Income ($)</Label>
            <Input
              id="otherIncome"
              type="number"
              value={otherIncome}
              onChange={(e) => setOtherIncome(e.target.value)}
              placeholder="Parking, laundry, etc."
            />
          </div>
        </div>
      </div>

      {/* Expenses */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Monthly Expenses
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="propertyTax">Property Tax ($)</Label>
            <Input
              id="propertyTax"
              type="number"
              value={propertyTax}
              onChange={(e) => setPropertyTax(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="insurance">Insurance ($)</Label>
            <Input
              id="insurance"
              type="number"
              value={insurance}
              onChange={(e) => setInsurance(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="hoa">HOA Fees ($)</Label>
            <Input
              id="hoa"
              type="number"
              value={hoa}
              onChange={(e) => setHoa(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="utilities">Utilities ($)</Label>
            <Input
              id="utilities"
              type="number"
              value={utilities}
              onChange={(e) => setUtilities(e.target.value)}
              placeholder="If landlord pays"
            />
          </div>
          <div>
            <Label htmlFor="managementPct">Property Management (%)</Label>
            <Select value={managementPct} onValueChange={setManagementPct}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0% (Self-managed)</SelectItem>
                <SelectItem value="8">8%</SelectItem>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="12">12%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="maintenancePct">Maintenance Reserve (%)</Label>
            <Select value={maintenancePct} onValueChange={setMaintenancePct}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3%</SelectItem>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="8">8%</SelectItem>
                <SelectItem value="10">10%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label htmlFor="vacancyPct">Vacancy Rate (%)</Label>
            <Select value={vacancyPct} onValueChange={setVacancyPct}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3% (~11 days/year)</SelectItem>
                <SelectItem value="5">5% (~18 days/year)</SelectItem>
                <SelectItem value="8">8% (~29 days/year)</SelectItem>
                <SelectItem value="10">10% (~36 days/year)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button onClick={calculateCashflow} className="w-full">
        <Calculator className="h-4 w-4 mr-2" />
        Calculate Cashflow
      </Button>

      {result && (
        <div className="space-y-4">
          {/* Main Cashflow Card */}
          <Card className={cn(
            result.monthlyCashflow >= 0
              ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
              : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
          )}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                {result.monthlyCashflow >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
                <div className="text-center">
                  <p className={cn(
                    "text-sm",
                    result.monthlyCashflow >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    Monthly Cashflow
                  </p>
                  <p className={cn(
                    "text-4xl font-bold",
                    result.monthlyCashflow >= 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                  )}>
                    ${result.monthlyCashflow >= 0 ? '+' : ''}{result.monthlyCashflow.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${result.annualCashflow.toLocaleString()}/year
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Returns */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-blue-50 dark:bg-blue-950">
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-blue-600 dark:text-blue-400">Cash-on-Cash Return</p>
                <p className={cn(
                  "text-2xl font-bold",
                  result.cashOnCashReturn >= 8 ? "text-green-600" : result.cashOnCashReturn >= 5 ? "text-blue-600" : "text-orange-600"
                )}>
                  {result.cashOnCashReturn}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Investment: ${result.totalInvestment.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 dark:bg-purple-950">
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-purple-600 dark:text-purple-400">Cap Rate</p>
                <p className={cn(
                  "text-2xl font-bold",
                  result.capRate >= 8 ? "text-green-600" : result.capRate >= 5 ? "text-purple-600" : "text-orange-600"
                )}>
                  {result.capRate}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.capRate >= 8 ? 'Excellent' : result.capRate >= 5 ? 'Average' : 'Below avg'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Income vs Expenses */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-4 text-center">
                <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Monthly Income</p>
                <p className="text-xl font-bold text-green-600">
                  ${result.monthlyIncome.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <DollarSign className="h-5 w-5 text-red-600 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Monthly Expenses</p>
                <p className="text-xl font-bold text-red-600">
                  ${result.monthlyExpenses.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Expense Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Expense Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(result.expenseBreakdown).map(([key, value]) => (
                  value > 0 && (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{key}</span>
                      <span className="font-medium">${value.toLocaleString()}</span>
                    </div>
                  )
                ))}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${result.monthlyExpenses.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
