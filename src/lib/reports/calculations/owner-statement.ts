import type { PrismaClient } from '@prisma/client';
import type { ReportFilters, ReportData, ReportColumn } from '../types';

export async function generateOwnerStatement(
  prisma: PrismaClient,
  organizationId: string,
  filters: ReportFilters
): Promise<ReportData> {
  const { startDate, endDate, propertyId } = filters;
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  // Get properties for owner statement
  const properties = await prisma.property.findMany({
    where: {
      organizationId,
      ...(propertyId ? { id: propertyId } : {}),
    },
    select: { id: true, name: true },
  });

  const columns: ReportColumn[] = [{ key: 'total', label: 'Amount', type: 'currency' }];

  const rows = [];
  let grandTotalIncome = 0;
  let grandTotalExpenses = 0;

  for (const property of properties) {
    // Get income for property
    const payments = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        receivedAt: { gte: startDateObj, lte: endDateObj },
        lease: { unit: { propertyId: property.id } },
      },
      _sum: { amount: true },
    });

    // Get expenses for property
    const expenses = await prisma.expense.aggregate({
      where: {
        expenseDate: { gte: startDateObj, lte: endDateObj },
        propertyId: property.id,
      },
      _sum: { amount: true },
    });

    const income = Number(payments._sum.amount || 0);
    const expenseAmount = Number(expenses._sum.amount || 0);
    const netIncome = income - expenseAmount;

    grandTotalIncome += income;
    grandTotalExpenses += expenseAmount;

    rows.push({
      id: `property-${property.id}`,
      name: property.name,
      depth: 0,
      isGroup: true,
      isTotal: false,
      values: {},
      children: [
        { id: `${property.id}-income`, name: 'Gross Rental Income', depth: 1, isGroup: false, isTotal: false, values: { total: income } },
        { id: `${property.id}-expenses`, name: 'Operating Expenses', depth: 1, isGroup: false, isTotal: false, values: { total: -expenseAmount } },
        { id: `${property.id}-net`, name: 'Net Income', depth: 1, isGroup: false, isTotal: true, values: { total: netIncome } },
      ],
    });
  }

  rows.push({
    id: 'grand-total',
    name: 'Total Net Income',
    depth: 0,
    isGroup: false,
    isTotal: true,
    values: { total: grandTotalIncome - grandTotalExpenses },
  });

  const startFormatted = startDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const endFormatted = endDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return {
    type: 'owner-statement',
    title: 'Owner Statement',
    dateRange: `${startFormatted} - ${endFormatted}`,
    generatedAt: new Date().toISOString(),
    filters,
    columns,
    rows,
  };
}
