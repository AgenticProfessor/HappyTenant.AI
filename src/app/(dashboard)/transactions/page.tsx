'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Search,
  MoreVertical,
  Calendar,
  Building2,
  DollarSign,
  Download,
  Upload,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Edit,
  Trash2,
  Receipt,
  CreditCard,
  Banknote,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

type TransactionType = 'income' | 'expense';
type TransactionCategory =
  | 'rent' | 'late_fee' | 'deposit' | 'application_fee' | 'other_income'
  | 'maintenance' | 'utilities' | 'insurance' | 'property_tax' | 'management' | 'mortgage' | 'other_expense';
type TransactionStatus = 'completed' | 'pending' | 'failed' | 'refunded';
type PaymentMethod = 'ach' | 'card' | 'check' | 'cash' | 'other';

interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  property?: string;
  unit?: string;
  tenant?: string;
  vendor?: string;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  reference?: string;
  notes?: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-01-20',
    type: 'income',
    category: 'rent',
    description: 'January Rent Payment',
    amount: 1800,
    property: '123 Oak Street',
    unit: 'Unit 2A',
    tenant: 'Sarah Johnson',
    status: 'completed',
    paymentMethod: 'ach',
    reference: 'TXN-001234',
  },
  {
    id: '2',
    date: '2024-01-19',
    type: 'income',
    category: 'rent',
    description: 'January Rent Payment',
    amount: 2200,
    property: '456 Maple Ave',
    unit: 'Unit 3B',
    tenant: 'Michael Chen',
    status: 'completed',
    paymentMethod: 'card',
    reference: 'TXN-001235',
  },
  {
    id: '3',
    date: '2024-01-18',
    type: 'expense',
    category: 'maintenance',
    description: 'Plumbing repair - kitchen sink',
    amount: 350,
    property: '123 Oak Street',
    unit: 'Unit 1C',
    vendor: 'ABC Plumbing',
    status: 'completed',
    paymentMethod: 'check',
    reference: 'CHK-5678',
  },
  {
    id: '4',
    date: '2024-01-17',
    type: 'income',
    category: 'late_fee',
    description: 'Late payment fee',
    amount: 75,
    property: '789 Pine Blvd',
    unit: 'Unit 2B',
    tenant: 'David Thompson',
    status: 'completed',
    paymentMethod: 'ach',
    reference: 'TXN-001236',
  },
  {
    id: '5',
    date: '2024-01-15',
    type: 'expense',
    category: 'utilities',
    description: 'Water bill - January',
    amount: 180,
    property: '123 Oak Street',
    status: 'completed',
    paymentMethod: 'ach',
    reference: 'AUTO-WATER',
  },
  {
    id: '6',
    date: '2024-01-14',
    type: 'expense',
    category: 'insurance',
    description: 'Property insurance - monthly',
    amount: 425,
    property: '123 Oak Street',
    status: 'completed',
    paymentMethod: 'ach',
    reference: 'INS-2024-01',
  },
  {
    id: '7',
    date: '2024-01-12',
    type: 'income',
    category: 'deposit',
    description: 'Security deposit',
    amount: 3600,
    property: '321 Elm Court',
    unit: 'Unit 4A',
    tenant: 'Emily Rodriguez',
    status: 'completed',
    paymentMethod: 'ach',
    reference: 'DEP-001237',
  },
  {
    id: '8',
    date: '2024-01-10',
    type: 'expense',
    category: 'maintenance',
    description: 'HVAC annual service',
    amount: 275,
    property: '456 Maple Ave',
    vendor: 'Cool Air Services',
    status: 'completed',
    paymentMethod: 'card',
    reference: 'TXN-001238',
  },
  {
    id: '9',
    date: '2024-01-08',
    type: 'income',
    category: 'application_fee',
    description: 'Application fee',
    amount: 45,
    property: '555 Cedar Lane',
    tenant: 'James Wilson',
    status: 'completed',
    paymentMethod: 'card',
    reference: 'APP-001239',
  },
  {
    id: '10',
    date: '2024-01-05',
    type: 'expense',
    category: 'property_tax',
    description: 'Property tax - Q1 2024',
    amount: 1250,
    property: '123 Oak Street',
    status: 'pending',
    paymentMethod: 'check',
    reference: 'TAX-2024-Q1',
    notes: 'Due by January 31st',
  },
  {
    id: '11',
    date: '2024-01-03',
    type: 'income',
    category: 'rent',
    description: 'January Rent Payment',
    amount: 1650,
    property: '789 Pine Blvd',
    unit: 'Unit 1C',
    tenant: 'Amanda Lee',
    status: 'failed',
    paymentMethod: 'ach',
    reference: 'TXN-001240',
    notes: 'Insufficient funds - retry scheduled',
  },
];

const categoryConfig: Record<TransactionCategory, { label: string; color: string }> = {
  rent: { label: 'Rent', color: 'bg-green-100 text-green-700' },
  late_fee: { label: 'Late Fee', color: 'bg-yellow-100 text-yellow-700' },
  deposit: { label: 'Deposit', color: 'bg-blue-100 text-blue-700' },
  application_fee: { label: 'Application Fee', color: 'bg-purple-100 text-purple-700' },
  other_income: { label: 'Other Income', color: 'bg-teal-100 text-teal-700' },
  maintenance: { label: 'Maintenance', color: 'bg-orange-100 text-orange-700' },
  utilities: { label: 'Utilities', color: 'bg-cyan-100 text-cyan-700' },
  insurance: { label: 'Insurance', color: 'bg-indigo-100 text-indigo-700' },
  property_tax: { label: 'Property Tax', color: 'bg-pink-100 text-pink-700' },
  management: { label: 'Management', color: 'bg-gray-100 text-gray-700' },
  mortgage: { label: 'Mortgage', color: 'bg-red-100 text-red-700' },
  other_expense: { label: 'Other Expense', color: 'bg-slate-100 text-slate-700' },
};

const statusConfig: Record<TransactionStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: XCircle },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700', icon: RefreshCw },
};

const paymentMethodIcons: Record<PaymentMethod, React.ComponentType<{ className?: string }>> = {
  ach: Banknote,
  card: CreditCard,
  check: FileText,
  cash: DollarSign,
  other: Receipt,
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState('this-month');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.property?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.tenant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.vendor?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || txn.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = totalIncome - totalExpenses;
  const pendingCount = filteredTransactions.filter((t) => t.status === 'pending').length;

  const handleExport = () => {
    toast.success('Transactions exported to CSV');
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
    toast.success('Transaction deleted');
  };

  const handleBulkDelete = () => {
    setTransactions(transactions.filter((t) => !selectedTransactions.includes(t.id)));
    setSelectedTransactions([]);
    toast.success(`${selectedTransactions.length} transactions deleted`);
  };

  const toggleSelectAll = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map((t) => t.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedTransactions.includes(id)) {
      setSelectedTransactions(selectedTransactions.filter((i) => i !== id));
    } else {
      setSelectedTransactions([...selectedTransactions, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Track all income and expense transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Transactions</DialogTitle>
                <DialogDescription>
                  Import transactions from a CSV file or connect your bank
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="font-medium">Drop CSV file here</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Banknote className="h-4 w-4 mr-2" />
                  Connect Bank Account
                </Button>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
                <DialogDescription>
                  Record a new income or expense transaction
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label>Transaction Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="late_fee">Late Fee</SelectItem>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="property_tax">Property Tax</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="Transaction description" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Property</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="123-oak">123 Oak Street</SelectItem>
                        <SelectItem value="456-maple">456 Maple Ave</SelectItem>
                        <SelectItem value="789-pine">789 Pine Blvd</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ach">ACH/Bank Transfer</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea placeholder="Additional notes..." rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setIsAddOpen(false);
                  toast.success('Transaction added');
                }}>
                  Add Transaction
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
              </div>
              <ArrowDownRight className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Net Cash Flow</p>
                <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${netCashFlow.toLocaleString()}
                </p>
              </div>
              <DollarSign className={`h-8 w-8 ${netCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TransactionType | 'all')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TransactionStatus | 'all')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[150px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="this-quarter">This Quarter</SelectItem>
            <SelectItem value="this-year">This Year</SelectItem>
            <SelectItem value="all-time">All Time</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedTransactions.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedTransactions.length} selected</span>
          <Button variant="outline" size="sm" onClick={() => setSelectedTransactions([])}>
            Clear Selection
          </Button>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            Delete Selected
          </Button>
        </div>
      )}

      {/* Transactions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((txn) => {
              const StatusIcon = statusConfig[txn.status].icon;
              const PaymentIcon = txn.paymentMethod ? paymentMethodIcons[txn.paymentMethod] : Receipt;
              return (
                <TableRow key={txn.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTransactions.includes(txn.id)}
                      onCheckedChange={() => toggleSelect(txn.id)}
                    />
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(txn.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${txn.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {txn.type === 'income' ? (
                          <ArrowUpRight className={`h-4 w-4 text-green-600`} />
                        ) : (
                          <ArrowDownRight className={`h-4 w-4 text-red-600`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{txn.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {txn.tenant && <span>{txn.tenant}</span>}
                          {txn.vendor && <span>{txn.vendor}</span>}
                          {txn.reference && (
                            <>
                              <span>&bull;</span>
                              <span>{txn.reference}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={categoryConfig[txn.category].color}>
                      {categoryConfig[txn.category].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {txn.property && (
                      <div className="flex items-center gap-1 text-sm">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{txn.property}</span>
                        {txn.unit && <span className="text-muted-foreground">- {txn.unit}</span>}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusConfig[txn.status].color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig[txn.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium ${txn.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.type === 'income' ? '+' : '-'}${txn.amount.toLocaleString()}
                    </span>
                    <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground mt-1">
                      <PaymentIcon className="h-3 w-3" />
                      <span className="capitalize">{txn.paymentMethod?.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Receipt className="h-4 w-4 mr-2" />
                          View Receipt
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteTransaction(txn.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No transactions found
          </div>
        )}
      </Card>
    </div>
  );
}
