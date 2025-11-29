import type { PrismaClient } from '@prisma/client';
import type { ReportFilters, ReportData, ReportRow } from '../types';
import { generateBalanceSheet } from '../calculations/balance-sheet';
import { generateProfitLoss } from '../calculations/profit-loss';
import { generateRentRoll } from '../calculations/rent-roll';
import { generateAgingReport } from '../calculations/aging-report';
import { generateCashFlow } from '../calculations/cash-flow';
import { generateSecurityDeposit } from '../calculations/security-deposit';
import { generateExpenseReport } from '../calculations/expense-report';
import { generateOwnerStatement } from '../calculations/owner-statement';
import { generatePropertyPerformance } from '../calculations/property-performance';
import { generateVacancyReport } from '../calculations/vacancy';
import { generateTenantLedger } from '../calculations/tenant-ledger';
import { generateTax1099 } from '../calculations/tax-1099';
import { generateDepreciation } from '../calculations/depreciation';

export async function generateReportData(
  prisma: PrismaClient,
  organizationId: string,
  reportType: string,
  filters: ReportFilters
): Promise<string> {
  // Generate the report
  let report: ReportData;

  switch (reportType) {
    case 'balance-sheet':
      report = await generateBalanceSheet(prisma, organizationId, filters);
      break;
    case 'profit-loss':
      report = await generateProfitLoss(prisma, organizationId, filters);
      break;
    case 'cash-flow':
      report = await generateCashFlow(prisma, organizationId, filters);
      break;
    case 'owner-statement':
      report = await generateOwnerStatement(prisma, organizationId, filters);
      break;
    case 'rent-roll':
      report = await generateRentRoll(prisma, organizationId, filters);
      break;
    case 'property-performance':
      report = await generatePropertyPerformance(prisma, organizationId, filters);
      break;
    case 'vacancy':
      report = await generateVacancyReport(prisma, organizationId, filters);
      break;
    case 'aging-report':
      report = await generateAgingReport(prisma, organizationId, filters);
      break;
    case 'security-deposit':
      report = await generateSecurityDeposit(prisma, organizationId, filters);
      break;
    case 'tenant-ledger':
      report = await generateTenantLedger(prisma, organizationId, filters);
      break;
    case 'tax-1099':
      report = await generateTax1099(prisma, organizationId, filters);
      break;
    case 'expense-report':
      report = await generateExpenseReport(prisma, organizationId, filters);
      break;
    case 'depreciation':
      report = await generateDepreciation(prisma, organizationId, filters);
      break;
    default:
      throw new Error(`Unknown report type: ${reportType}`);
  }

  return reportToCSV(report);
}

function reportToCSV(report: ReportData): string {
  const lines: string[] = [];

  // Header with report info
  lines.push(`"${report.title}"`);
  if (report.dateRange) {
    lines.push(`"${report.dateRange}"`);
  }
  lines.push(`"Generated: ${new Date(report.generatedAt).toLocaleString()}"`);
  lines.push(''); // Empty line

  // Column headers
  const headers = ['Account', ...report.columns.map((col) => col.label)];
  lines.push(headers.map(escapeCSV).join(','));

  // Data rows
  const flatRows = flattenRows(report.rows);
  for (const row of flatRows) {
    const indent = '  '.repeat(row.depth);
    const values = [
      `${indent}${row.name}`,
      ...report.columns.map((col) => {
        const value = row.values[col.key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'number') {
          if (col.type === 'currency') {
            return formatCurrency(value);
          }
          if (col.type === 'percentage') {
            return `${value.toFixed(1)}%`;
          }
          return value.toString();
        }
        return String(value);
      }),
    ];
    lines.push(values.map(escapeCSV).join(','));
  }

  return lines.join('\n');
}

function flattenRows(rows: ReportRow[], result: ReportRow[] = []): ReportRow[] {
  for (const row of rows) {
    result.push(row);
    if (row.children) {
      flattenRows(row.children, result);
    }
  }
  return result;
}

function escapeCSV(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}
