import type { PrismaClient } from '@prisma/client';
import type { ReportFilters, ReportData, ReportColumn } from '../types';

export async function generateSecurityDeposit(
  prisma: PrismaClient,
  organizationId: string,
  filters: ReportFilters
): Promise<ReportData> {
  const { propertyId } = filters;
  const propertyFilter = propertyId ? { id: propertyId } : {};

  const leases = await prisma.lease.findMany({
    where: {
      status: { in: ['ACTIVE', 'PENDING_SIGNATURE'] },
      securityDeposit: { gt: 0 },
      unit: {
        property: {
          organizationId,
          ...propertyFilter,
        },
      },
    },
    include: {
      unit: {
        select: {
          unitNumber: true,
          property: { select: { name: true } },
        },
      },
      leaseTenants: {
        where: { role: 'PRIMARY' },
        include: {
          tenant: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: [{ unit: { property: { name: 'asc' } } }, { unit: { unitNumber: 'asc' } }],
  });

  const columns: ReportColumn[] = [
    { key: 'tenant', label: 'Tenant', type: 'text' },
    { key: 'leaseStart', label: 'Lease Start', type: 'date' },
    { key: 'deposit', label: 'Deposit Amount', type: 'currency' },
  ];

  let total = 0;
  const rows = leases.map((lease) => {
    const tenant = lease.leaseTenants[0]?.tenant;
    const deposit = Number(lease.securityDeposit);
    total += deposit;

    return {
      id: `lease-${lease.id}`,
      name: `${lease.unit.property.name} - Unit ${lease.unit.unitNumber}`,
      depth: 0,
      isGroup: false,
      isTotal: false,
      values: {
        tenant: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'N/A',
        leaseStart: lease.startDate.toISOString().split('T')[0],
        deposit,
      },
    };
  });

  rows.push({
    id: 'total',
    name: 'Total Security Deposits Held',
    depth: 0,
    isGroup: false,
    isTotal: true,
    values: { tenant: `${leases.length} Leases`, leaseStart: '', deposit: total },
  });

  return {
    type: 'security-deposit',
    title: 'Security Deposit Report',
    dateRange: '',
    generatedAt: new Date().toISOString(),
    filters,
    columns,
    rows,
  };
}
