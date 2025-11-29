import type { PrismaClient } from '@prisma/client';
import type { ReportFilters, ReportData, ReportRow, ReportColumn } from '../types';

export async function generateProfitLoss(
  prisma: PrismaClient,
  organizationId: string,
  filters: ReportFilters
): Promise<ReportData> {
  const { startDate, endDate, groupBy, propertyId } = filters;
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  const propertyFilter = propertyId ? { id: propertyId } : {};

  // Generate columns based on groupBy
  const columns = generateColumns(groupBy, startDate, endDate);

  // === INCOME ===

  // Get all completed payments in the date range
  const payments = await prisma.payment.findMany({
    where: {
      status: 'COMPLETED',
      receivedAt: {
        gte: startDateObj,
        lte: endDateObj,
      },
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
        include: {
          charge: {
            select: { type: true },
          },
        },
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

  // Group payments by charge type
  const incomeByType: Record<string, Record<string, number>> = {};

  for (const payment of payments) {
    const date = new Date(payment.receivedAt);
    const periodKey = getPeriodKey(date, groupBy);

    for (const allocation of payment.paymentAllocations) {
      const type = allocation.charge.type;
      if (!incomeByType[type]) {
        incomeByType[type] = {};
      }
      incomeByType[type][periodKey] = (incomeByType[type][periodKey] || 0) + Number(allocation.amount);
    }
  }

  // === EXPENSES ===

  // Get all expenses in the date range
  const expenses = await prisma.expense.findMany({
    where: {
      organizationId,
      expenseDate: {
        gte: startDateObj,
        lte: endDateObj,
      },
      ...(propertyId ? { propertyId } : {}),
    },
    select: {
      amount: true,
      category: true,
      expenseDate: true,
      propertyId: true,
    },
  });

  // Get maintenance costs
  const maintenanceRequests = await prisma.maintenanceRequest.findMany({
    where: {
      status: 'COMPLETED',
      resolvedAt: {
        gte: startDateObj,
        lte: endDateObj,
      },
      unit: {
        property: {
          organizationId,
          ...propertyFilter,
        },
      },
    },
    select: {
      actualCost: true,
      resolvedAt: true,
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

  // Group expenses by category
  const expensesByCategory: Record<string, Record<string, number>> = {};

  for (const expense of expenses) {
    const date = new Date(expense.expenseDate);
    const periodKey = getPeriodKey(date, groupBy);
    const category = expense.category;

    if (!expensesByCategory[category]) {
      expensesByCategory[category] = {};
    }
    expensesByCategory[category][periodKey] =
      (expensesByCategory[category][periodKey] || 0) + Number(expense.amount);
  }

  // Add maintenance costs
  for (const mr of maintenanceRequests) {
    if (mr.actualCost && mr.resolvedAt) {
      const date = new Date(mr.resolvedAt);
      const periodKey = getPeriodKey(date, groupBy);

      if (!expensesByCategory['REPAIRS_MAINTENANCE']) {
        expensesByCategory['REPAIRS_MAINTENANCE'] = {};
      }
      expensesByCategory['REPAIRS_MAINTENANCE'][periodKey] =
        (expensesByCategory['REPAIRS_MAINTENANCE'][periodKey] || 0) + Number(mr.actualCost);
    }
  }

  // Build rows
  const rows: ReportRow[] = [];

  // Income section
  const incomeRow: ReportRow = {
    id: 'income',
    name: 'Income',
    depth: 0,
    isGroup: true,
    isTotal: false,
    values: {},
    children: [],
  };

  // Rental Income
  const rentalIncomeRow: ReportRow = {
    id: 'rental-income',
    name: 'Rental Income',
    depth: 1,
    isGroup: true,
    isTotal: false,
    values: {},
    children: [],
  };

  const incomeTypes = [
    { type: 'RENT', name: 'Base Rent' },
    { type: 'LATE_FEE', name: 'Late Fees' },
    { type: 'PET_RENT', name: 'Pet Rent' },
    { type: 'PARKING', name: 'Parking' },
    { type: 'STORAGE', name: 'Storage' },
    { type: 'UTILITY', name: 'Utilities Reimbursement' },
    { type: 'OTHER', name: 'Other Income' },
  ];

  let totalIncomeValues: Record<string, number | string | null> = {};

  for (const { type, name } of incomeTypes) {
    const typeData = incomeByType[type] || {};
    const values = columnsToValues(typeData, columns);

    totalIncomeValues = addValues(totalIncomeValues, values);

    if (Object.values(typeData).some(v => v > 0)) {
      rentalIncomeRow.children?.push({
        id: `income-${type.toLowerCase()}`,
        name,
        depth: 2,
        isGroup: false,
        isTotal: false,
        values,
      });
    }
  }

  const totalRentalIncomeRow: ReportRow = {
    id: 'total-rental-income',
    name: 'Total Rental Income',
    depth: 1,
    isGroup: false,
    isTotal: true,
    values: totalIncomeValues,
  };

  incomeRow.children = [rentalIncomeRow, totalRentalIncomeRow];

  const totalIncomeRow: ReportRow = {
    id: 'total-income',
    name: 'Total Income',
    depth: 0,
    isGroup: false,
    isTotal: true,
    values: totalIncomeValues,
  };

  rows.push(incomeRow, totalIncomeRow);

  // Expenses section
  const expensesRow: ReportRow = {
    id: 'expenses',
    name: 'Operating Expenses',
    depth: 0,
    isGroup: true,
    isTotal: false,
    values: {},
    children: [],
  };

  const expenseCategories = [
    { category: 'REPAIRS_MAINTENANCE', name: 'Repairs & Maintenance' },
    { category: 'PROPERTY_TAX', name: 'Property Taxes' },
    { category: 'INSURANCE', name: 'Insurance' },
    { category: 'UTILITIES', name: 'Utilities' },
    { category: 'PROPERTY_MANAGEMENT', name: 'Property Management' },
    { category: 'LEGAL_PROFESSIONAL', name: 'Legal & Professional' },
    { category: 'ADVERTISING', name: 'Advertising' },
    { category: 'SUPPLIES', name: 'Supplies' },
    { category: 'HOA_FEES', name: 'HOA Fees' },
    { category: 'OTHER', name: 'Other Expenses' },
  ];

  let totalExpenseValues: Record<string, number | string | null> = {};

  for (const { category, name } of expenseCategories) {
    const catData = expensesByCategory[category] || {};
    const values = columnsToValues(catData, columns);

    totalExpenseValues = addValues(totalExpenseValues, values);

    if (Object.values(catData).some(v => v > 0)) {
      expensesRow.children?.push({
        id: `expense-${category.toLowerCase()}`,
        name,
        depth: 1,
        isGroup: false,
        isTotal: false,
        values,
      });
    }
  }

  const totalExpensesRow: ReportRow = {
    id: 'total-expenses',
    name: 'Total Operating Expenses',
    depth: 0,
    isGroup: false,
    isTotal: true,
    values: totalExpenseValues,
  };

  rows.push(expensesRow, totalExpensesRow);

  // Net Operating Income
  const noiRow: ReportRow = {
    id: 'noi',
    name: 'Net Operating Income',
    depth: 0,
    isGroup: false,
    isTotal: true,
    values: subtractValues(totalIncomeValues, totalExpenseValues),
  };

  rows.push(noiRow);

  // Format date range
  const startFormatted = new Date(startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const endFormatted = new Date(endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    type: 'profit-loss',
    title: 'Profit and Loss',
    subtitle: `${startFormatted} - ${endFormatted}`,
    dateRange: `${startFormatted} - ${endFormatted}`,
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

function getPeriodKey(date: Date, groupBy: string): string {
  if (groupBy === 'month') {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  } else if (groupBy === 'quarter') {
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `${date.getFullYear()}-Q${quarter}`;
  }
  return 'total';
}

function columnsToValues(
  data: Record<string, number>,
  columns: ReportColumn[]
): Record<string, number | string | null> {
  const result: Record<string, number | string | null> = {};
  for (const col of columns) {
    result[col.key] = data[col.key] || 0;
  }
  return result;
}

function addValues(
  a: Record<string, number | string | null>,
  b: Record<string, number | string | null>
): Record<string, number | string | null> {
  const result: Record<string, number | string | null> = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
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
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    const aVal = typeof a[key] === 'number' ? a[key] : 0;
    const bVal = typeof b[key] === 'number' ? b[key] : 0;
    result[key] = (aVal as number) - (bVal as number);
  }
  return result;
}
