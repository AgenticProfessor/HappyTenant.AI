'use client';

import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { DrilldownTransaction, ReportRow, ReportFilters, ReportType } from '@/lib/reports/types';

interface TransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: ReportType;
  row: ReportRow | null;
  columnKey: string | null;
  filters: ReportFilters;
}

export function TransactionDrawer({
  isOpen,
  onClose,
  reportType,
  row,
  columnKey,
  filters,
}: TransactionDrawerProps) {
  const [transactions, setTransactions] = useState<DrilldownTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (isOpen && row && columnKey) {
      fetchTransactions();
    }
  }, [isOpen, row, columnKey]);

  const fetchTransactions = async () => {
    if (!row || !columnKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        rowId: row.id,
        columnKey,
        startDate: filters.startDate,
        endDate: filters.endDate,
        accountingMethod: filters.accountingMethod,
      });

      const response = await fetch(
        `/api/reports/${reportType}/transactions?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
      setTotalAmount(data.totalAmount || 0);
    } catch (err) {
      setError('Could not load transactions. Please try again.');
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const isNegative = amount < 0;
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
    return isNegative ? `-${formatted}` : formatted;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Transaction Details</SheetTitle>
          <SheetDescription>
            {row?.name} - {columnKey}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {/* Summary */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg mb-4">
            <div>
              <p className="text-sm text-slate-500">Total Amount</p>
              <p
                className={cn(
                  'text-2xl font-bold',
                  totalAmount < 0 ? 'text-red-600' : 'text-slate-900'
                )}
              >
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <Badge variant="secondary">{transactions.length} transactions</Badge>
          </div>

          {/* Transaction List */}
          <ScrollArea className="h-[calc(100vh-280px)]">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-5 w-48 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-slate-500">
                <p>{error}</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p>No transactions found for this period.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="p-4 border border-slate-200 rounded-lg hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-slate-500">
                            {formatDate(txn.date)}
                          </span>
                          <Badge
                            variant={txn.type === 'income' ? 'default' : 'secondary'}
                            className={cn(
                              'text-xs',
                              txn.type === 'income'
                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                : 'bg-red-100 text-red-700 hover:bg-red-100'
                            )}
                          >
                            {txn.type === 'income' ? 'Income' : 'Expense'}
                          </Badge>
                        </div>
                        <p className="font-medium text-slate-900 truncate">
                          {txn.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                          {txn.category && <span>{txn.category}</span>}
                          {txn.property && (
                            <>
                              <span className="text-slate-300">|</span>
                              <span>{txn.property}</span>
                            </>
                          )}
                          {txn.tenant && (
                            <>
                              <span className="text-slate-300">|</span>
                              <span>{txn.tenant}</span>
                            </>
                          )}
                          {txn.paymentMethod && (
                            <>
                              <span className="text-slate-300">|</span>
                              <span>{txn.paymentMethod}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={cn(
                            'font-semibold',
                            txn.type === 'expense' || txn.amount < 0
                              ? 'text-red-600'
                              : 'text-green-600'
                          )}
                        >
                          {txn.type === 'expense' ? '-' : '+'}
                          {formatCurrency(Math.abs(txn.amount))}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {txn.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
