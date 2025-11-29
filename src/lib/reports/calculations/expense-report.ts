import type { PrismaClient } from '@prisma/client';
import type { ReportFilters, ReportData, ReportColumn } from '../types';

export async function generateExpenseReport(
  prisma: PrismaClient,
  organizationId: string,
  filters: ReportFilters
): Promise<ReportData> {
  const { startDate, endDate, propertyId } = filters;
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const propertyFilter = propertyId ? { id: propertyId } : {};

  const expenses = await prisma.expense.findMany({
    where: {
      organizationId,
      expenseDate: { gte: startDateObj, lte: endDateObj },
      ...(propertyId ? { propertyId } : {}),
    },
    orderBy: { expenseDate: 'desc' },
  });

  // Group by category
  const byCategory: Record<string, { amount: number; count: number; taxDeductible: number }> = {};
  for (const exp of expenses) {
    if (!byCategory[exp.category]) {
      byCategory[exp.category] = { amount: 0, count: 0, taxDeductible: 0 };
    }
    byCategory[exp.category].amount += Number(exp.amount);
    byCategory[exp.category].count += 1;
    if (exp.isTaxDeductible) {
      byCategory[exp.category].taxDeductible += Number(exp.amount);
    }
  }

  const columns: ReportColumn[] = [
    { key: 'count', label: 'Count', type: 'number' },
    { key: 'amount', label: 'Amount', type: 'currency' },
    { key: 'taxDeductible', label: 'Tax Deductible', type: 'currency' },
  ];

  const categoryNames: Record<string, string> = {
    REPAIRS_MAINTENANCE: 'Repairs & Maintenance',
    PROPERTY_TAX: 'Property Taxes',
    INSURANCE: 'Insurance',
    UTILITIES: 'Utilities',
    PROPERTY_MANAGEMENT: 'Property Management',
    LEGAL_PROFESSIONAL: 'Legal & Professional',
    ADVERTISING: 'Advertising',
    SUPPLIES: 'Supplies',
    HOA_FEES: 'HOA Fees',
    OTHER: 'Other',
  };

  let totalAmount = 0;
  let totalCount = 0;
  let totalDeductible = 0;

  const rows = Object.entries(byCategory).map(([category, data]) => {
    totalAmount += data.amount;
    totalCount += data.count;
    totalDeductible += data.taxDeductible;

    return {
      id: `cat-${category}`,
      name: categoryNames[category] || category,
      depth: 0,
      isGroup: false,
      isTotal: false,
      values: {
        count: data.count,
        amount: data.amount,
        taxDeductible: data.taxDeductible,
      },
    };
  });

  rows.push({
    id: 'total',
    name: 'Total Expenses',
    depth: 0,
    isGroup: false,
    isTotal: true,
    values: { count: totalCount, amount: totalAmount, taxDeductible: totalDeductible },
  });

  const startFormatted = startDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const endFormatted = endDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return {
    type: 'expense-report',
    title: 'Expense Report',
    dateRange: `${startFormatted} - ${endFormatted}`,
    generatedAt: new Date().toISOString(),
    filters,
    columns,
    rows,
  };
}
