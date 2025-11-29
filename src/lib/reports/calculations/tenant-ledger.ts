import type { PrismaClient } from '@prisma/client';
import type { ReportFilters, ReportData, ReportColumn } from '../types';

export async function generateTenantLedger(
  prisma: PrismaClient,
  organizationId: string,
  filters: ReportFilters
): Promise<ReportData> {
  const { startDate, endDate, propertyId } = filters;
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  // Get all tenants with their transactions
  const tenants = await prisma.tenant.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    include: {
      leaseTenants: {
        where: { role: 'PRIMARY' },
        include: {
          lease: {
            include: {
              unit: {
                select: {
                  unitNumber: true,
                  property: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              charges: {
                where: { createdAt: { gte: startDateObj, lte: endDateObj } },
                orderBy: { dueDate: 'asc' },
              },
              payments: {
                where: { receivedAt: { gte: startDateObj, lte: endDateObj } },
                orderBy: { receivedAt: 'asc' },
              },
            },
          },
        },
      },
    },
    orderBy: { lastName: 'asc' },
  });

  const columns: ReportColumn[] = [
    { key: 'charges', label: 'Charges', type: 'currency' },
    { key: 'payments', label: 'Payments', type: 'currency' },
    { key: 'balance', label: 'Balance', type: 'currency' },
  ];

  const rows = [];

  for (const tenant of tenants) {
    const primaryLease = tenant.leaseTenants[0]?.lease;
    if (!primaryLease) continue;

    if (propertyId && primaryLease.unit.property.id !== propertyId) continue;

    const totalCharges = primaryLease.charges.reduce((sum, c) => sum + Number(c.amount), 0);
    const totalPayments = primaryLease.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const balance = totalCharges - totalPayments;

    rows.push({
      id: `tenant-${tenant.id}`,
      name: `${tenant.firstName} ${tenant.lastName}`,
      depth: 0,
      isGroup: true,
      isTotal: false,
      values: { charges: totalCharges, payments: totalPayments, balance },
      children: [
        {
          id: `${tenant.id}-property`,
          name: `${primaryLease.unit.property.name} - Unit ${primaryLease.unit.unitNumber}`,
          depth: 1,
          isGroup: false,
          isTotal: false,
          values: { charges: totalCharges, payments: totalPayments, balance },
        },
      ],
    });
  }

  const startFormatted = startDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const endFormatted = endDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return {
    type: 'tenant-ledger',
    title: 'Tenant Ledger',
    dateRange: `${startFormatted} - ${endFormatted}`,
    generatedAt: new Date().toISOString(),
    filters,
    columns,
    rows,
  };
}
