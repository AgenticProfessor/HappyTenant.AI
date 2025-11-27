'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { mockTransactions, mockDashboardStats, mockTenants, mockLeases } from '@/data/mock-data';

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  const stats = mockDashboardStats;

  const filteredTransactions = mockTransactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || tx.status === filterStatus;
    const matchesType = !filterType || tx.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalIncome = mockTransactions
    .filter((tx) => tx.type === 'income' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = mockTransactions
    .filter((tx) => tx.type === 'expense' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const pendingPayments = mockTransactions
    .filter((tx) => tx.status === 'pending')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Track rent collection, expenses, and financial overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Rent Collection Overview */}
      <Card className="bg-gradient-to-r from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            November 2024 Rent Collection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Collection Progress</span>
                <span className="text-sm text-muted-foreground">{stats.collectionRate}%</span>
              </div>
              <Progress value={stats.collectionRate} className="h-3 mb-4" />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    ${stats.collectedRent.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Collected</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">
                    ${stats.outstandingRent.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Outstanding</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    ${(stats.collectedRent + stats.outstandingRent).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Expected</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center p-4 bg-muted/50 rounded-lg">
              <Sparkles className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium text-center">AI Collection Assistant</p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                2 tenants may need payment reminders
              </p>
              <Button size="sm" className="mt-3">
                Send Reminders
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
              -5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Income
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${(totalIncome - totalExpenses).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              ${pendingPayments.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockTransactions.filter((tx) => tx.status === 'pending').length} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>
          <div className="flex-1" />
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-[200px]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('completed')}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('pending')}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('failed')}>
                  Failed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value="all">
          <TransactionsTable transactions={filteredTransactions} />
        </TabsContent>
        <TabsContent value="income">
          <TransactionsTable transactions={filteredTransactions.filter((tx) => tx.type === 'income')} />
        </TabsContent>
        <TabsContent value="expenses">
          <TransactionsTable transactions={filteredTransactions.filter((tx) => tx.type === 'expense')} />
        </TabsContent>
      </Tabs>

      {/* Upcoming Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Due Dates</CardTitle>
          <CardDescription>Rent payments due in the next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockLeases
              .filter((l) => l.status === 'active')
              .slice(0, 4)
              .map((lease) => {
                const tenant = mockTenants.find((t) => t.id === lease.tenantId);
                return (
                  <div
                    key={lease.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{tenant?.name || 'Unknown Tenant'}</p>
                        <p className="text-sm text-muted-foreground">Due Dec 1, 2024</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${lease.rentAmount.toLocaleString()}</p>
                      <Badge variant="outline" className="text-xs">
                        Monthly Rent
                      </Badge>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TransactionsTable({ transactions }: { transactions: typeof mockTransactions }) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {tx.type === 'income' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    {tx.propertyId && (
                      <p className="text-xs text-muted-foreground">Property {tx.propertyId}</p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {new Date(tx.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {tx.category}
                </Badge>
              </TableCell>
              <TableCell>
                <span className={`font-semibold ${
                  tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    tx.status === 'completed' ? 'default' :
                    tx.status === 'pending' ? 'secondary' : 'destructive'
                  }
                  className="gap-1"
                >
                  {tx.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                  {tx.status === 'pending' && <Clock className="h-3 w-3" />}
                  {(tx.status as string) === 'failed' && <AlertCircle className="h-3 w-3" />}
                  {tx.status}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Download Receipt</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
