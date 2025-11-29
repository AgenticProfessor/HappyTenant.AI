import type { PrismaClient } from '@prisma/client';
import type { ReportFilters, ReportData, ReportRow, ReportColumn } from '../types';

export async function generateAgingReport(
  prisma: PrismaClient,
  organizationId: string,
  filters: ReportFilters
): Promise<ReportData> {
  const { propertyId, groupBy } = filters;
  const propertyFilter = propertyId ? { id: propertyId } : {};
  const now = new Date();

  // Get all overdue charges
  const charges = await prisma.charge.findMany({
    where: {
      status: { in: ['DUE', 'PARTIAL'] },
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
      tenant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      lease: {
        select: {
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
        },
      },
    },
    orderBy: { dueDate: 'asc' },
  });

  const columns: ReportColumn[] = [
    { key: 'current', label: 'Current', type: 'currency' },
    { key: '1-30', label: '1-30 Days', type: 'currency' },
    { key: '31-60', label: '31-60 Days', type: 'currency' },
    { key: '61-90', label: '61-90 Days', type: 'currency' },
    { key: '90+', label: '90+ Days', type: 'currency' },
    { key: 'total', label: 'Total', type: 'currency' },
  ];

  // Group charges by tenant
  const tenantBalances: Map<string, {
    tenantName: string;
    email: string;
    property: string;
    unit: string;
    current: number;
    '1-30': number;
    '31-60': number;
    '61-90': number;
    '90+': number;
    total: number;
  }> = new Map();

  for (const charge of charges) {
    const allocated = charge.paymentAllocations.reduce((s, pa) => s + Number(pa.amount), 0);
    const balance = Number(charge.amount) - allocated;

    if (balance <= 0) continue;

    const daysOverdue = Math.floor(
      (now.getTime() - new Date(charge.dueDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    const tenantId = charge.tenant?.id || 'unknown';
    const tenantName = charge.tenant
      ? `${charge.tenant.firstName} ${charge.tenant.lastName}`
      : 'Unknown';

    if (!tenantBalances.has(tenantId)) {
      tenantBalances.set(tenantId, {
        tenantName,
        email: charge.tenant?.email || '',
        property: charge.lease.unit.property.name,
        unit: charge.lease.unit.unitNumber,
        current: 0,
        '1-30': 0,
        '31-60': 0,
        '61-90': 0,
        '90+': 0,
        total: 0,
      });
    }

    const record = tenantBalances.get(tenantId)!;

    if (daysOverdue <= 0) {
      record.current += balance;
    } else if (daysOverdue <= 30) {
      record['1-30'] += balance;
    } else if (daysOverdue <= 60) {
      record['31-60'] += balance;
    } else if (daysOverdue <= 90) {
      record['61-90'] += balance;
    } else {
      record['90+'] += balance;
    }
    record.total += balance;
  }

  const rows: ReportRow[] = [];
  const totals = { current: 0, '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0, total: 0 };

  for (const [tenantId, data] of tenantBalances) {
    rows.push({
      id: `tenant-${tenantId}`,
      name: `${data.tenantName} (${data.property} - ${data.unit})`,
      depth: 0,
      isGroup: false,
      isTotal: false,
      values: {
        current: data.current,
        '1-30': data['1-30'],
        '31-60': data['31-60'],
        '61-90': data['61-90'],
        '90+': data['90+'],
        total: data.total,
      },
    });

    totals.current += data.current;
    totals['1-30'] += data['1-30'];
    totals['31-60'] += data['31-60'];
    totals['61-90'] += data['61-90'];
    totals['90+'] += data['90+'];
    totals.total += data.total;
  }

  // Add totals row
  rows.push({
    id: 'totals',
    name: 'Total',
    depth: 0,
    isGroup: false,
    isTotal: true,
    values: totals,
  });

  return {
    type: 'aging-report',
    title: 'Aging Report',
    subtitle: `As of ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    dateRange: '',
    generatedAt: now.toISOString(),
    filters,
    columns,
    rows,
  };
}
