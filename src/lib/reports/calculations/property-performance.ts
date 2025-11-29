import type { PrismaClient } from '@prisma/client';
import type { ReportFilters, ReportData, ReportColumn } from '../types';

export async function generatePropertyPerformance(
  prisma: PrismaClient,
  organizationId: string,
  filters: ReportFilters
): Promise<ReportData> {
  const { startDate, endDate, propertyId } = filters;
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  const properties = await prisma.property.findMany({
    where: {
      organizationId,
      ...(propertyId ? { id: propertyId } : {}),
    },
    include: {
      units: {
        select: { id: true, status: true, marketRent: true },
      },
    },
  });

  const columns: ReportColumn[] = [
    { key: 'units', label: 'Units', type: 'number' },
    { key: 'occupancy', label: 'Occupancy', type: 'percentage' },
    { key: 'grossIncome', label: 'Gross Income', type: 'currency' },
    { key: 'expenses', label: 'Expenses', type: 'currency' },
    { key: 'noi', label: 'NOI', type: 'currency' },
  ];

  const rows = [];

  for (const property of properties) {
    const totalUnits = property.units.length;
    const occupiedUnits = property.units.filter(u => u.status === 'OCCUPIED').length;
    const occupancy = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    // Get income
    const payments = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        receivedAt: { gte: startDateObj, lte: endDateObj },
        lease: { unit: { propertyId: property.id } },
      },
      _sum: { amount: true },
    });

    // Get expenses
    const expenseSum = await prisma.expense.aggregate({
      where: {
        expenseDate: { gte: startDateObj, lte: endDateObj },
        propertyId: property.id,
      },
      _sum: { amount: true },
    });

    const grossIncome = Number(payments._sum.amount || 0);
    const expenses = Number(expenseSum._sum.amount || 0);
    const noi = grossIncome - expenses;

    rows.push({
      id: `property-${property.id}`,
      name: property.name,
      depth: 0,
      isGroup: false,
      isTotal: false,
      values: {
        units: totalUnits,
        occupancy,
        grossIncome,
        expenses,
        noi,
      },
    });
  }

  const startFormatted = startDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const endFormatted = endDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return {
    type: 'property-performance',
    title: 'Property Performance',
    dateRange: `${startFormatted} - ${endFormatted}`,
    generatedAt: new Date().toISOString(),
    filters,
    columns,
    rows,
  };
}
