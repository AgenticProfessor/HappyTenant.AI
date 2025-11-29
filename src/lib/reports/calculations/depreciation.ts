import type { PrismaClient } from '@prisma/client';
import type { ReportFilters, ReportData, ReportColumn } from '../types';

export async function generateDepreciation(
  prisma: PrismaClient,
  organizationId: string,
  filters: ReportFilters
): Promise<ReportData> {
  const { propertyId } = filters;

  // Get properties with their purchase info
  const properties = await prisma.property.findMany({
    where: {
      organizationId,
      ...(propertyId ? { id: propertyId } : {}),
    },
    select: {
      id: true,
      name: true,
      purchasePrice: true,
      purchaseDate: true,
      createdAt: true,
    },
  });

  const columns: ReportColumn[] = [
    { key: 'purchaseDate', label: 'Date Acquired', type: 'date' },
    { key: 'cost', label: 'Cost Basis', type: 'currency' },
    { key: 'method', label: 'Method', type: 'text' },
    { key: 'life', label: 'Life (Years)', type: 'number' },
    { key: 'annualDepreciation', label: 'Annual Depreciation', type: 'currency' },
    { key: 'accumulatedDepreciation', label: 'Accumulated', type: 'currency' },
    { key: 'bookValue', label: 'Book Value', type: 'currency' },
  ];

  const currentYear = new Date().getFullYear();
  let totalAnnual = 0;
  let totalAccumulated = 0;

  const rows = properties.map((property) => {
    const cost = Number(property.purchasePrice || 0);
    const purchaseDate = property.purchaseDate || property.createdAt;
    const purchaseYear = new Date(purchaseDate).getFullYear();
    const yearsOwned = currentYear - purchaseYear;

    // Residential property: 27.5 year straight-line depreciation
    const usefulLife = 27.5;
    const annualDepreciation = cost / usefulLife;
    const accumulatedDepreciation = Math.min(annualDepreciation * yearsOwned, cost);
    const bookValue = cost - accumulatedDepreciation;

    totalAnnual += annualDepreciation;
    totalAccumulated += accumulatedDepreciation;

    return {
      id: `property-${property.id}`,
      name: property.name,
      depth: 0,
      isGroup: false,
      isTotal: false,
      values: {
        purchaseDate: new Date(purchaseDate).toISOString().split('T')[0],
        cost,
        method: 'Straight-Line',
        life: usefulLife,
        annualDepreciation,
        accumulatedDepreciation,
        bookValue,
      },
    };
  });

  rows.push({
    id: 'total',
    name: 'Total',
    depth: 0,
    isGroup: false,
    isTotal: true,
    values: {
      purchaseDate: '',
      cost: properties.reduce((sum, p) => sum + Number(p.purchasePrice || 0), 0),
      method: '',
      life: 0,
      annualDepreciation: totalAnnual,
      accumulatedDepreciation: totalAccumulated,
      bookValue: properties.reduce((sum, p) => sum + Number(p.purchasePrice || 0), 0) - totalAccumulated,
    },
  });

  return {
    type: 'depreciation',
    title: 'Depreciation Schedule',
    subtitle: `As of ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    dateRange: '',
    generatedAt: new Date().toISOString(),
    filters,
    columns,
    rows,
  };
}
