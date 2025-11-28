'use client';

import { useState } from 'react';
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
} from 'lucide-react';

// Simulated chart data - in production would use Recharts or similar
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
  { category: 'Insurance', amount: 1500, percentage: 16, color: 'bg-yellow-500' },
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
          <p className="text-muted-foreground">
            Financial analytics and performance metrics
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
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-[180px]">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {propertyPerformance.map((prop) => (
                <SelectItem key={prop.name} value={prop.name}>{prop.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
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
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
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
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-red-600" />
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
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
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
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Home className="h-6 w-6 text-purple-600" />
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
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{tenant.name}</p>
                        <p className="text-xs text-muted-foreground">{tenant.property}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">${tenant.amount.toLocaleString()}</p>
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
                      <p className="font-medium text-green-600">${property.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Expenses</p>
                      <p className="font-medium text-red-600">${property.expenses.toLocaleString()}</p>
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
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">123 Oak St, Unit 3B</span>
                  <Badge variant="outline">15 days</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Listed at $1,600/mo</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
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
                <span className="font-medium text-red-600">$3,450/mo</span>
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
                      <p className="font-medium text-green-600">${projected.toLocaleString()}</p>
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
