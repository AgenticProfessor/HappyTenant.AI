import type { PrismaClient } from '@prisma/client';
import type { ReportFilters, ReportData, ReportRow, ReportColumn } from '../types';

export async function generateRentRoll(
  prisma: PrismaClient,
  organizationId: string,
  filters: ReportFilters
): Promise<ReportData> {
  const { propertyId, groupBy } = filters;
  const propertyFilter = propertyId ? { id: propertyId } : {};

  // Get all active leases
  const leases = await prisma.lease.findMany({
    where: {
      status: 'ACTIVE',
      unit: {
        property: {
          organizationId,
          ...propertyFilter,
        },
      },
    },
    include: {
      unit: {
        include: {
          property: {
            select: {
              id: true,
              name: true,
              addressLine1: true,
            },
          },
        },
      },
      leaseTenants: {
        where: { role: 'PRIMARY' },
        include: {
          tenant: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      charges: {
        where: {
          status: { in: ['DUE', 'PARTIAL'] },
        },
        include: {
          paymentAllocations: {
            select: { amount: true },
          },
        },
      },
    },
    orderBy: [
      { unit: { property: { name: 'asc' } } },
      { unit: { unitNumber: 'asc' } },
    ],
  });

  const columns: ReportColumn[] = [
    { key: 'tenant', label: 'Tenant', type: 'text' },
    { key: 'leaseStart', label: 'Lease Start', type: 'date' },
    { key: 'leaseEnd', label: 'Lease End', type: 'date' },
    { key: 'monthlyRent', label: 'Monthly Rent', type: 'currency' },
    { key: 'deposit', label: 'Deposit', type: 'currency' },
    { key: 'balance', label: 'Balance', type: 'currency' },
  ];

  const rows: ReportRow[] = [];
  let currentPropertyId: string | null = null;
  let propertyRow: ReportRow | null = null;
  let totalRent = 0;
  let totalDeposit = 0;
  let totalBalance = 0;

  for (const lease of leases) {
    const property = lease.unit.property;
    const tenant = lease.leaseTenants[0]?.tenant;
    const tenantName = tenant ? `${tenant.firstName} ${tenant.lastName}` : 'N/A';

    // Calculate outstanding balance
    const balance = lease.charges.reduce((sum, charge) => {
      const allocated = charge.paymentAllocations.reduce((s, pa) => s + Number(pa.amount), 0);
      return sum + (Number(charge.amount) - allocated);
    }, 0);

    // Group by property if requested
    if (groupBy === 'property') {
      if (property.id !== currentPropertyId) {
        if (propertyRow) {
          rows.push(propertyRow);
        }
        currentPropertyId = property.id;
        propertyRow = {
          id: `property-${property.id}`,
          name: property.name,
          depth: 0,
          isGroup: true,
          isTotal: false,
          values: {},
          children: [],
        };
      }

      propertyRow?.children?.push({
        id: `lease-${lease.id}`,
        name: `Unit ${lease.unit.unitNumber}`,
        depth: 1,
        isGroup: false,
        isTotal: false,
        values: {
          tenant: tenantName,
          leaseStart: lease.startDate.toISOString().split('T')[0],
          leaseEnd: lease.endDate?.toISOString().split('T')[0] ?? 'Month-to-Month',
          monthlyRent: Number(lease.rentAmount),
          deposit: Number(lease.securityDeposit),
          balance,
        },
      });
    } else {
      rows.push({
        id: `lease-${lease.id}`,
        name: `${property.name} - Unit ${lease.unit.unitNumber}`,
        depth: 0,
        isGroup: false,
        isTotal: false,
        values: {
          tenant: tenantName,
          leaseStart: lease.startDate.toISOString().split('T')[0],
          leaseEnd: lease.endDate?.toISOString().split('T')[0] ?? 'Month-to-Month',
          monthlyRent: Number(lease.rentAmount),
          deposit: Number(lease.securityDeposit),
          balance,
        },
      });
    }

    totalRent += Number(lease.rentAmount);
    totalDeposit += Number(lease.securityDeposit);
    totalBalance += balance;
  }

  // Add last property group
  if (propertyRow) {
    rows.push(propertyRow);
  }

  // Add totals row
  rows.push({
    id: 'totals',
    name: 'Total',
    depth: 0,
    isGroup: false,
    isTotal: true,
    values: {
      tenant: `${leases.length} Leases`,
      leaseStart: '',
      leaseEnd: '',
      monthlyRent: totalRent,
      deposit: totalDeposit,
      balance: totalBalance,
    },
  });

  return {
    type: 'rent-roll',
    title: 'Rent Roll',
    subtitle: `As of ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    dateRange: '',
    generatedAt: new Date().toISOString(),
    filters,
    columns,
    rows,
  };
}
