import type { PrismaClient } from '@prisma/client';
import type { ReportFilters, ReportData, ReportRow, ReportColumn } from '../types';

export async function generateBalanceSheet(
  prisma: PrismaClient,
  organizationId: string,
  filters: ReportFilters
): Promise<ReportData> {
  const { startDate, endDate, groupBy, propertyId } = filters;
  const endDateObj = new Date(endDate);

  // Build property filter
  const propertyFilter = propertyId ? { id: propertyId } : {};

  // Generate columns based on groupBy
  const columns = generateColumns(groupBy, startDate, endDate);

  // === ASSETS ===

  // Bank/Cash: Sum of completed payments minus refunds
  const payments = await prisma.payment.findMany({
    where: {
      status: 'COMPLETED',
      receivedAt: { lte: endDateObj },
      lease: {
        unit: {
          property: {
            organizationId,
            ...propertyFilter,
          },
        },
      },
    },
    select: {
      amount: true,
      receivedAt: true,
      lease: {
        select: {
          unit: {
            select: {
              property: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Accounts Receivable: Outstanding charges
  const outstandingCharges = await prisma.charge.findMany({
    where: {
      status: { in: ['DUE', 'PARTIAL'] },
      dueDate: { lte: endDateObj },
      lease: {
        unit: {
          property: {
            organizationId,
            ...propertyFilter,
          },
        },
      },
    },
    include: {
      paymentAllocations: {
        select: { amount: true },
      },
      lease: {
        select: {
          unit: {
            select: {
              property: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Security Deposits Held (as both asset and liability)
  const securityDeposits = await prisma.lease.findMany({
    where: {
      status: { in: ['ACTIVE', 'EXPIRED'] },
      securityDeposit: { gt: 0 },
      unit: {
        property: {
          organizationId,
          ...propertyFilter,
        },
      },
    },
    select: {
      securityDeposit: true,
      startDate: true,
      unit: {
        select: {
          property: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  // Calculate values grouped by period
  const cashByPeriod = groupByPeriod(
    payments,
    (p) => Number(p.amount),
    (p) => new Date(p.receivedAt),
    (p) => p.lease.unit.property.id,
    (p) => p.lease.unit.property.name,
    groupBy,
    startDate,
    endDate
  );

  const arByPeriod = groupByPeriod(
    outstandingCharges,
    (c) => Number(c.amount) - c.paymentAllocations.reduce((s, pa) => s + Number(pa.amount), 0),
    (c) => new Date(c.dueDate),
    (c) => c.lease.unit.property.id,
    (c) => c.lease.unit.property.name,
    groupBy,
    startDate,
    endDate
  );

  const depositsTotal = securityDeposits.reduce((sum, l) => sum + Number(l.securityDeposit), 0);

  // Build rows
  const rows: ReportRow[] = [];

  // Assets section
  const assetsRow: ReportRow = {
    id: 'assets',
    name: 'Assets',
    depth: 0,
    isGroup: true,
    isTotal: false,
    values: {},
    children: [],
  };

  // Current Assets
  const currentAssetsRow: ReportRow = {
    id: 'current-assets',
    name: 'Current Assets',
    depth: 1,
    isGroup: true,
    isTotal: false,
    values: {},
    children: [],
  };

  // Bank accounts
  const bankRow: ReportRow = {
    id: 'bank',
    name: 'Bank Accounts',
    depth: 2,
    isGroup: true,
    isTotal: false,
    values: sumAllPeriods(cashByPeriod, columns),
    children: [
      {
        id: 'bank-operating',
        name: 'Operating Account',
        depth: 3,
        isGroup: false,
        isTotal: false,
        values: sumAllPeriods(cashByPeriod, columns),
      },
    ],
  };

  const totalBankRow: ReportRow = {
    id: 'total-bank',
    name: 'Total Bank Accounts',
    depth: 2,
    isGroup: false,
    isTotal: true,
    values: sumAllPeriods(cashByPeriod, columns),
  };

  // Accounts Receivable
  const arRow: ReportRow = {
    id: 'accounts-receivable',
    name: 'Accounts Receivable',
    depth: 2,
    isGroup: true,
    isTotal: false,
    values: sumAllPeriods(arByPeriod, columns),
    children: [
      {
        id: 'ar-tenant',
        name: 'Tenant Receivables',
        depth: 3,
        isGroup: false,
        isTotal: false,
        values: sumAllPeriods(arByPeriod, columns),
      },
    ],
  };

  const totalArRow: ReportRow = {
    id: 'total-ar',
    name: 'Total Accounts Receivable',
    depth: 2,
    isGroup: false,
    isTotal: true,
    values: sumAllPeriods(arByPeriod, columns),
  };

  // Total Current Assets
  const totalCurrentAssetsRow: ReportRow = {
    id: 'total-current-assets',
    name: 'Total Current Assets',
    depth: 1,
    isGroup: false,
    isTotal: true,
    values: addValues(sumAllPeriods(cashByPeriod, columns), sumAllPeriods(arByPeriod, columns)),
  };

  currentAssetsRow.children = [bankRow, totalBankRow, arRow, totalArRow];

  // Total Assets
  const totalAssetsRow: ReportRow = {
    id: 'total-assets',
    name: 'Total Assets',
    depth: 0,
    isGroup: false,
    isTotal: true,
    values: totalCurrentAssetsRow.values,
  };

  assetsRow.children = [currentAssetsRow, totalCurrentAssetsRow];
  rows.push(assetsRow, totalAssetsRow);

  // === LIABILITIES AND EQUITY ===

  const liabilitiesRow: ReportRow = {
    id: 'liabilities-equity',
    name: 'Liabilities and Equity',
    depth: 0,
    isGroup: true,
    isTotal: false,
    values: {},
    children: [],
  };

  // Liabilities
  const liabilitiesSubRow: ReportRow = {
    id: 'liabilities',
    name: 'Liabilities',
    depth: 1,
    isGroup: true,
    isTotal: false,
    values: {},
    children: [],
  };

  // Security Deposits Payable
  const depositsPayableRow: ReportRow = {
    id: 'deposits-payable',
    name: 'Security Deposits Payable',
    depth: 2,
    isGroup: false,
    isTotal: false,
    values: createConstantValues(depositsTotal, columns),
  };

  const totalLiabilitiesRow: ReportRow = {
    id: 'total-liabilities',
    name: 'Total Liabilities',
    depth: 1,
    isGroup: false,
    isTotal: true,
    values: depositsPayableRow.values,
  };

  liabilitiesSubRow.children = [depositsPayableRow];

  // Equity
  const equityRow: ReportRow = {
    id: 'equity',
    name: 'Equity',
    depth: 1,
    isGroup: true,
    isTotal: false,
    values: {},
    children: [],
  };

  // Retained Earnings (Assets - Liabilities)
  const retainedEarningsValues = subtractValues(totalAssetsRow.values, depositsPayableRow.values);
  const retainedEarningsRow: ReportRow = {
    id: 'retained-earnings',
    name: 'Retained Earnings',
    depth: 2,
    isGroup: false,
    isTotal: false,
    values: retainedEarningsValues,
  };

  const totalEquityRow: ReportRow = {
    id: 'total-equity',
    name: 'Total Equity',
    depth: 1,
    isGroup: false,
    isTotal: true,
    values: retainedEarningsValues,
  };

  equityRow.children = [retainedEarningsRow];

  // Total Liabilities and Equity
  const totalLiabilitiesEquityRow: ReportRow = {
    id: 'total-liabilities-equity',
    name: 'Total Liabilities and Equity',
    depth: 0,
    isGroup: false,
    isTotal: true,
    values: addValues(totalLiabilitiesRow.values, totalEquityRow.values),
  };

  liabilitiesRow.children = [liabilitiesSubRow, totalLiabilitiesRow, equityRow, totalEquityRow];
  rows.push(liabilitiesRow, totalLiabilitiesEquityRow);

  // Format date range for display
  const startDateFormatted = new Date(startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const endDateFormatted = new Date(endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    type: 'balance-sheet',
    title: 'Balance Sheet',
    subtitle: `As of ${endDateFormatted}`,
    dateRange: `${startDateFormatted} - ${endDateFormatted}`,
    generatedAt: new Date().toISOString(),
    filters,
    columns,
    rows,
  };
}

// Helper functions

function generateColumns(groupBy: string, startDate: string, endDate: string): ReportColumn[] {
  const columns: ReportColumn[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (groupBy === 'month') {
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    while (current <= end) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      columns.push({
        key,
        label: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        type: 'currency',
      });
      current.setMonth(current.getMonth() + 1);
    }
  } else if (groupBy === 'quarter') {
    const currentQuarter = Math.floor(start.getMonth() / 3);
    const current = new Date(start.getFullYear(), currentQuarter * 3, 1);
    while (current <= end) {
      const quarter = Math.floor(current.getMonth() / 3) + 1;
      const key = `${current.getFullYear()}-Q${quarter}`;
      columns.push({
        key,
        label: `Q${quarter} ${current.getFullYear()}`,
        type: 'currency',
      });
      current.setMonth(current.getMonth() + 3);
    }
  } else {
    columns.push({
      key: 'total',
      label: 'Total',
      type: 'currency',
    });
  }

  return columns;
}

function groupByPeriod<T>(
  items: T[],
  getValue: (item: T) => number,
  getDate: (item: T) => Date,
  getPropertyId: (item: T) => string,
  getPropertyName: (item: T) => string,
  groupBy: string,
  startDate: string,
  endDate: string
): Record<string, number> {
  const result: Record<string, number> = {};
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (const item of items) {
    const date = getDate(item);
    if (date < start || date > end) continue;

    let key: string;
    if (groupBy === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else if (groupBy === 'quarter') {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      key = `${date.getFullYear()}-Q${quarter}`;
    } else if (groupBy === 'property') {
      key = getPropertyId(item);
    } else {
      key = 'total';
    }

    result[key] = (result[key] || 0) + getValue(item);
  }

  return result;
}

function sumAllPeriods(data: Record<string, number>, columns: ReportColumn[]): Record<string, number | string | null> {
  const result: Record<string, number | string | null> = {};
  let runningTotal = 0;

  for (const col of columns) {
    runningTotal += data[col.key] || 0;
    result[col.key] = runningTotal;
  }

  return result;
}

function createConstantValues(value: number, columns: ReportColumn[]): Record<string, number | string | null> {
  const result: Record<string, number | string | null> = {};
  for (const col of columns) {
    result[col.key] = value;
  }
  return result;
}

function addValues(
  a: Record<string, number | string | null>,
  b: Record<string, number | string | null>
): Record<string, number | string | null> {
  const result: Record<string, number | string | null> = {};
  for (const key of Object.keys(a)) {
    const aVal = typeof a[key] === 'number' ? a[key] : 0;
    const bVal = typeof b[key] === 'number' ? b[key] : 0;
    result[key] = (aVal as number) + (bVal as number);
  }
  return result;
}

function subtractValues(
  a: Record<string, number | string | null>,
  b: Record<string, number | string | null>
): Record<string, number | string | null> {
  const result: Record<string, number | string | null> = {};
  for (const key of Object.keys(a)) {
    const aVal = typeof a[key] === 'number' ? a[key] : 0;
    const bVal = typeof b[key] === 'number' ? b[key] : 0;
    result[key] = (aVal as number) - (bVal as number);
  }
  return result;
}
