import type { PrismaClient } from '@prisma/client';
import type { ReportFilters, ReportData, ReportColumn } from '../types';

export async function generateVacancyReport(
  prisma: PrismaClient,
  organizationId: string,
  filters: ReportFilters
): Promise<ReportData> {
  const { propertyId } = filters;
  const now = new Date();

  const vacantUnits = await prisma.unit.findMany({
    where: {
      status: { in: ['VACANT', 'NOTICE_GIVEN', 'UNDER_APPLICATION'] },
      property: {
        organizationId,
        ...(propertyId ? { id: propertyId } : {}),
      },
    },
    include: {
      property: { select: { name: true } },
    },
    orderBy: [{ property: { name: 'asc' } }, { unitNumber: 'asc' }],
  });

  const columns: ReportColumn[] = [
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'bedrooms', label: 'Beds', type: 'number' },
    { key: 'marketRent', label: 'Market Rent', type: 'currency' },
    { key: 'daysVacant', label: 'Days Vacant', type: 'number' },
  ];

  let totalPotentialRent = 0;
  const rows: Array<{
    id: string;
    name: string;
    depth: number;
    isGroup: boolean;
    isTotal: boolean;
    values: Record<string, string | number | null>;
  }> = vacantUnits.map((unit) => {
    const marketRent = Number(unit.marketRent || 0);
    totalPotentialRent += marketRent;

    return {
      id: `unit-${unit.id}`,
      name: `${unit.property.name} - Unit ${unit.unitNumber}`,
      depth: 0,
      isGroup: false,
      isTotal: false,
      values: {
        status: unit.status,
        bedrooms: unit.bedrooms,
        marketRent,
        daysVacant: unit.availableDate
          ? Math.max(0, Math.floor((now.getTime() - new Date(unit.availableDate).getTime()) / (1000 * 60 * 60 * 24)))
          : 0,
      },
    };
  });

  rows.push({
    id: 'total',
    name: 'Total Vacant Units',
    depth: 0,
    isGroup: false,
    isTotal: true,
    values: {
      status: `${vacantUnits.length} units`,
      bedrooms: null,
      marketRent: totalPotentialRent,
      daysVacant: null,
    },
  });

  return {
    type: 'vacancy',
    title: 'Vacancy Report',
    dateRange: '',
    generatedAt: now.toISOString(),
    filters,
    columns,
    rows,
  };
}
