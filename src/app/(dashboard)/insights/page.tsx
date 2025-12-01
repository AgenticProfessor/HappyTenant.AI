'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  Home,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  PieChart,
  BarChart3,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Lightbulb,
  ArrowRight,
  Target,
  ShieldAlert
} from 'lucide-react';

// Types for Steward Analysis
interface AccountingInsight {
  type: 'anomaly' | 'trend' | 'forecast' | 'optimization' | 'risk' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  value?: string;
  action?: string;
}

interface AccountingAnalysis {
  summary: string;
  insights: AccountingInsight[];
  monthOverMonth: {
    revenue: number;
    expenses: number;
    noi: number;
  };
  timestamp: string;
}

// Simulated chart data
const revenueData = [
  { month: 'Jan', revenue: 24500, expenses: 8200 },
  { month: 'Feb', revenue: 25200, expenses: 7800 },
  { month: 'Mar', revenue: 26100, expenses: 9100 },
  { month: 'Apr', revenue: 25800, expenses: 8500 },
  { month: 'May', revenue: 27200, expenses: 8900 },
  { month: 'Jun', revenue: 28500, expenses: 9200 },
];

const propertyPerformance = [
  { name: '123 Oak Street', revenue: 5400, expenses: 1200, occupancy: 100, units: 4 },
  { name: '456 Maple Ave', revenue: 7200, expenses: 2100, occupancy: 92, units: 6 },
  { name: '789 Pine Blvd', revenue: 6600, expenses: 1800, occupancy: 83, units: 3 },
  { name: '321 Elm Court', revenue: 4800, expenses: 1500, occupancy: 100, units: 4 },
  { name: '555 Cedar Lane', revenue: 4500, expenses: 900, occupancy: 75, units: 2 },
];

const expenseBreakdown = [
  { category: 'Maintenance', amount: 3200, percentage: 35, color: 'bg-blue-500' },
  { category: 'Utilities', amount: 1800, percentage: 20, color: 'bg-green-500' },
  { category: 'Insurance', amount: 1500, percentage: 16, color: 'bg-warning/100' },
  { category: 'Property Tax', amount: 1200, percentage: 13, color: 'bg-purple-500' },
  { category: 'Management', amount: 900, percentage: 10, color: 'bg-orange-500' },
  { category: 'Other', amount: 600, percentage: 6, color: 'bg-gray-500' },
];

const delinquentTenants = [
  { name: 'John Smith', property: '123 Oak St, Unit 3A', amount: 1800, daysLate: 15 },
  { name: 'Sarah Williams', property: '456 Maple Ave, Unit 2B', amount: 2200, daysLate: 8 },
  { name: 'Mike Johnson', property: '789 Pine Blvd, Unit 1C', amount: 1650, daysLate: 5 },
];

export default function InsightsPage() {
  const [dateRange, setDateRange] = useState('this-month');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [analysis, setAnalysis] = useState<AccountingAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);

  // Fetch Steward Analysis
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await fetch('/api/intelligence/accounting');
        const data = await res.json();
        setAnalysis(data);
      } catch (error) {
        console.error('Failed to fetch accounting analysis', error);
      } finally {
        setLoadingAnalysis(false);
      }
    };

    fetchAnalysis();
  }, []);

  // Summary metrics
  const totalRevenue = 28500;
  const totalExpenses = 9200;
  const netIncome = totalRevenue - totalExpenses;
  const occupancyRate = 91;
  const collectionRate = 94;
  const totalUnits = 19;
  const occupiedUnits = 17;
  const vacantUnits = 2;

  const revenueChange = 4.8;
  const expenseChange = 3.4;
  const netIncomeChange = 5.2;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Insights</h1>
          <p className="text-muted-foreground mt-1">
            Financial analytics and portfolio performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Steward AI Accounting Analyst */}
      <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-0 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="h-48 w-48" />
        </div>
        <CardHeader className="relative z-10 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-200 border-0 hover:bg-indigo-500/30">
              <Sparkles className="h-3 w-3 mr-1" />
              Steward AI Analyst
            </Badge>
            <span className="text-xs text-indigo-300">Powered by Gemini 3 Pro</span>
          </div>
          <CardTitle className="text-2xl font-light">Portfolio Intelligence</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Summary */}
            <div className="lg:col-span-2 space-y-6">
              {loadingAnalysis ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-4 bg-white/10 rounded w-full"></div>
                  <div className="h-4 bg-white/10 rounded w-5/6"></div>
                </div>
              ) : (
                <>
                  <p className="text-lg text-indigo-50 leading-relaxed font-light">
                    "{analysis?.summary}"
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis?.insights.map((insight, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {insight.type === 'anomaly' ? <AlertTriangle className="h-4 w-4 text-amber-400" /> :
                              insight.type === 'trend' ? <TrendingUp className="h-4 w-4 text-emerald-400" /> :
                                insight.type === 'forecast' ? <TrendingUp className="h-4 w-4 text-blue-400" /> :
                                  insight.type === 'risk' ? <ShieldAlert className="h-4 w-4 text-red-400" /> :
                                    insight.type === 'opportunity' ? <Target className="h-4 w-4 text-green-400" /> :
                                      <Lightbulb className="h-4 w-4 text-purple-400" />}
                            <span className="font-medium text-sm text-indigo-100">{insight.title}</span>
                          </div>
                          {insight.value && (
                            <Badge variant="outline" className="border-white/20 text-white">
                              {insight.value}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-indigo-200 mb-3">
                          {insight.description}
                        </p>
                        {insight.action && (
                          <Button size="sm" variant="secondary" className="h-7 text-xs bg-white/10 hover:bg-white/20 text-white border-0 w-full justify-between">
                            {insight.action}
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Key Metrics */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-medium text-indigo-200 mb-6 uppercase tracking-wider">Month over Month</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Revenue</span>
                      <span className="text-emerald-400 text-sm font-medium flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {analysis?.monthOverMonth.revenue}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Expenses</span>
                      <span className="text-amber-400 text-sm font-medium flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {analysis?.monthOverMonth.expenses}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Net Operating Income</span>
                      <span className="text-blue-400 text-sm font-medium flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {analysis?.monthOverMonth.noi}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <Button className="w-full mt-6 bg-indigo-500 hover:bg-indigo-600 text-white border-0">
                View Detailed Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">+{revenueChange}%</span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">${totalExpenses.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-500">+{expenseChange}%</span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Operating Income</p>
                <p className="text-2xl font-bold">${netIncome.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">+{netIncomeChange}%</span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                <p className="text-2xl font-bold">{occupancyRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-sm text-muted-foreground">{occupiedUnits}/{totalUnits} units</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Home className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <CardDescription>Monthly comparison for the past 6 months</CardDescription>
              </div>
              <Badge variant="outline">
                <BarChart3 className="h-3 w-3 mr-1" />
                Chart
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Simulated bar chart */}
            <div className="h-64 flex items-end justify-between gap-4 px-4">
              {revenueData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 items-end justify-center h-48">
                    <div
                      className="w-5 bg-primary rounded-t"
                      style={{ height: `${(data.revenue / 30000) * 100}%` }}
                      title={`Revenue: $${data.revenue}`}
                    />
                    <div
                      className="w-5 bg-red-400 rounded-t"
                      style={{ height: `${(data.expenses / 30000) * 100}%` }}
                      title={`Expenses: $${data.expenses}`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary" />
                <span className="text-sm text-muted-foreground">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-400" />
                <span className="text-sm text-muted-foreground">Expenses</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>By category this month</CardDescription>
              </div>
              <Badge variant="outline">
                <PieChart className="h-3 w-3 mr-1" />
                Chart
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseBreakdown.map((expense, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{expense.category}</span>
                    <span className="font-medium">${expense.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={expense.percentage} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground w-10">{expense.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between font-medium">
                <span>Total Expenses</span>
                <span>${totalExpenses.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collection Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Rent Collection</CardTitle>
            <CardDescription>Current month collection status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative h-32 w-32">
                <svg className="h-32 w-32 -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    strokeWidth="12"
                    className="fill-none stroke-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    strokeWidth="12"
                    strokeDasharray={`${collectionRate * 3.52} 352`}
                    className="fill-none stroke-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{collectionRate}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Collected</span>
                  </div>
                  <span className="font-medium">$26,790</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="font-medium">$1,710</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Overdue</span>
                  </div>
                  <span className="font-medium text-red-500">$5,650</span>
                </div>
              </div>
            </div>

            {/* Delinquent Tenants */}
            {delinquentTenants.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Overdue Payments</p>
                <div className="space-y-3">
                  {delinquentTenants.map((tenant, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{tenant.name}</p>
                        <p className="text-xs text-muted-foreground">{tenant.property}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-destructive">${tenant.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{tenant.daysLate} days late</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Property Performance</CardTitle>
            <CardDescription>Revenue and occupancy by property</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {propertyPerformance.map((property, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{property.name}</span>
                    </div>
                    <Badge variant={property.occupancy === 100 ? 'default' : property.occupancy >= 80 ? 'secondary' : 'destructive'}>
                      {property.occupancy}% occupied
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Revenue</p>
                      <p className="font-medium text-success">${property.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Expenses</p>
                      <p className="font-medium text-destructive">${property.expenses.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">NOI</p>
                      <p className="font-medium">${(property.revenue - property.expenses).toLocaleString()}</p>
                    </div>
                  </div>
                  <Progress value={property.occupancy} className="h-1.5 mt-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vacancy & Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vacancy Status</CardTitle>
            <CardDescription>Current unit availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold">{vacantUnits}</p>
              <p className="text-muted-foreground">Vacant Units</p>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-warning/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">123 Oak St, Unit 3B</span>
                  <Badge variant="outline">15 days</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Listed at $1,600/mo</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">555 Cedar Ln, Unit 1A</span>
                  <Badge variant="outline">8 days</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Listed at $1,850/mo</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Potential Lost Revenue</span>
                <span className="font-medium text-destructive">$3,450/mo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Projection</CardTitle>
            <CardDescription>Next 3 months forecast</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['February', 'March', 'April'].map((month, index) => {
                const projected = netIncome + (index * 500) + Math.floor(Math.random() * 1000);
                return (
                  <div key={month} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">{month}</span>
                    <div className="text-right">
                      <p className="font-medium text-success">${projected.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Projected NOI</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
              <p>Based on current lease agreements and historical expense patterns</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Ratios</CardTitle>
            <CardDescription>Financial health indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Expense Ratio</p>
                  <p className="text-xs text-muted-foreground">Expenses / Revenue</p>
                </div>
                <Badge variant={((totalExpenses / totalRevenue) * 100) < 40 ? 'default' : 'destructive'}>
                  {((totalExpenses / totalRevenue) * 100).toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Cap Rate</p>
                  <p className="text-xs text-muted-foreground">NOI / Property Value</p>
                </div>
                <Badge>7.2%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Cash on Cash Return</p>
                  <p className="text-xs text-muted-foreground">Annual cash flow / Cash invested</p>
                </div>
                <Badge>9.8%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">DSCR</p>
                  <p className="text-xs text-muted-foreground">Debt Service Coverage</p>
                </div>
                <Badge variant="default">1.45</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
