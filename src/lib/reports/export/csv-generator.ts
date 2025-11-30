import type { PrismaClient } from '@prisma/client';
import type { ReportFilters, ReportData, ReportRow } from '../types';
import { generateReport } from '../report-factory';

export async function generateReportData(
  prisma: PrismaClient,
  organizationId: string,
  reportType: string,
  filters: ReportFilters
): Promise<string> {
  // Use the centralized report factory
  const report = await generateReport(prisma, organizationId, reportType, filters);
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
