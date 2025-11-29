import type { PrismaClient } from '@prisma/client';
import type { ReportFilters, ReportData, ReportColumn } from '../types';

export async function generateCashFlow(
  prisma: PrismaClient,
  organizationId: string,
  filters: ReportFilters
): Promise<ReportData> {
  const { startDate, endDate, groupBy, propertyId } = filters;
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const propertyFilter = propertyId ? { id: propertyId } : {};

  // Get cash inflows (payments)
  const payments = await prisma.payment.findMany({
    where: {
      status: 'COMPLETED',
      receivedAt: { gte: startDateObj, lte: endDateObj },
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
    },
  });

  // Get cash outflows (expenses)
  const expenses = await prisma.expense.findMany({
    where: {
      organizationId,
      expenseDate: { gte: startDateObj, lte: endDateObj },
      ...(propertyId ? { propertyId } : {}),
    },
    select: {
      amount: true,
      expenseDate: true,
    },
  });

  const columns: ReportColumn[] = [{ key: 'total', label: 'Total', type: 'currency' }];

  const totalInflows = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalOutflows = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netCashFlow = totalInflows - totalOutflows;

  const startFormatted = startDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const endFormatted = endDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return {
    type: 'cash-flow',
    title: 'Cash Flow Statement',
    dateRange: `${startFormatted} - ${endFormatted}`,
    generatedAt: new Date().toISOString(),
    filters,
    columns,
    rows: [
      {
        id: 'operating-activities',
        name: 'Cash Flows from Operating Activities',
        depth: 0,
        isGroup: true,
        isTotal: false,
        values: {},
        children: [
          { id: 'inflows', name: 'Cash Inflows (Rent & Fees)', depth: 1, isGroup: false, isTotal: false, values: { total: totalInflows } },
          { id: 'outflows', name: 'Cash Outflows (Expenses)', depth: 1, isGroup: false, isTotal: false, values: { total: -totalOutflows } },
        ],
      },
      { id: 'net-operating', name: 'Net Cash from Operations', depth: 0, isGroup: false, isTotal: true, values: { total: netCashFlow } },
      { id: 'net-change', name: 'Net Change in Cash', depth: 0, isGroup: false, isTotal: true, values: { total: netCashFlow } },
    ],
  };
}
