import type { PrismaClient } from '@prisma/client';
import type { ReportFilters, ReportData, ReportColumn } from '../types';

export async function generateTax1099(
  prisma: PrismaClient,
  organizationId: string,
  filters: ReportFilters
): Promise<ReportData> {
  const { startDate, endDate } = filters;
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  // Get all vendors with payments over $600
  const vendors = await prisma.vendor.findMany({
    where: { organizationId },
    include: {
      maintenanceRequests: {
        where: {
          status: 'COMPLETED',
          resolvedAt: { gte: startDateObj, lte: endDateObj },
          actualCost: { gt: 0 },
        },
        select: { actualCost: true },
      },
    },
  });

  const columns: ReportColumn[] = [
    { key: 'ein', label: 'EIN/SSN', type: 'text' },
    { key: 'totalPaid', label: 'Total Paid', type: 'currency' },
    { key: 'requires1099', label: 'Requires 1099', type: 'text' },
  ];

  const rows = vendors
    .map((vendor) => {
      const totalPaid = vendor.maintenanceRequests.reduce((sum, mr) => sum + Number(mr.actualCost || 0), 0);

      return {
        id: `vendor-${vendor.id}`,
        name: vendor.name,
        depth: 0,
        isGroup: false,
        isTotal: false,
        values: {
          ein: vendor.licenseNumber || 'Not Provided',
          totalPaid,
          requires1099: totalPaid >= 600 ? 'Yes' : 'No',
        },
        totalPaid,
      };
    })
    .filter((v) => v.totalPaid > 0)
    .sort((a, b) => b.totalPaid - a.totalPaid);

  const over600 = rows.filter((r) => r.totalPaid >= 600);

  rows.push({
    id: 'summary',
    name: `Total Vendors Requiring 1099: ${over600.length}`,
    depth: 0,
    isGroup: false,
    isTotal: true,
    values: {
      ein: '',
      totalPaid: rows.reduce((sum, r) => sum + r.totalPaid, 0),
      requires1099: '',
    },
    totalPaid: 0,
  });

  const year = startDateObj.getFullYear();

  return {
    type: 'tax-1099',
    title: '1099 Report',
    subtitle: `Tax Year ${year}`,
    dateRange: `Jan 1, ${year} - Dec 31, ${year}`,
    generatedAt: new Date().toISOString(),
    filters,
    columns,
    rows: rows.map(({ totalPaid, ...row }) => row),
  };
}
