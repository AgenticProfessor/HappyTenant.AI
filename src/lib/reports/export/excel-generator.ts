import type { PrismaClient } from '@prisma/client';
import type { ReportFilters, ReportData, ReportRow } from '../types';
import { generateReport } from '../report-factory';

export async function generateExcelReport(
  prisma: PrismaClient,
  organizationId: string,
  reportType: string,
  filters: ReportFilters
): Promise<Buffer> {
  // Use the centralized report factory
  const report = await generateReport(prisma, organizationId, reportType, filters);

  // Try to use xlsx if available, otherwise fall back to CSV
  try {
    const XLSX = await import('xlsx');
    return generateWithXLSX(XLSX, report);
  } catch {
    // xlsx not installed, return CSV format that Excel can open
    const csvContent = reportToCSV(report);
    return Buffer.from(csvContent, 'utf-8');
  }
}

function generateWithXLSX(XLSX: typeof import('xlsx'), report: ReportData): Buffer {
  const wb = XLSX.utils.book_new();

  // Create worksheet data
  const wsData: (string | number | null)[][] = [];

  // Title and metadata
  wsData.push([report.title]);
  if (report.dateRange) {
    wsData.push([report.dateRange]);
  }
  wsData.push([`Generated: ${new Date(report.generatedAt).toLocaleString()}`]);
  wsData.push([]); // Empty row

  // Headers
  wsData.push(['Account', ...report.columns.map((col) => col.label)]);

  // Data rows
  const flatRows = flattenRows(report.rows);
  for (const row of flatRows) {
    const indent = '  '.repeat(row.depth);
    wsData.push([
      `${indent}${row.name}`,
      ...report.columns.map((col) => {
        const value = row.values[col.key];
        if (value === null || value === undefined) return null;
        return typeof value === 'number' ? value : String(value);
      }),
    ]);
  }

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  const colWidths = [{ wch: 40 }, ...report.columns.map(() => ({ wch: 15 }))];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Report');

  // Generate buffer
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

function reportToCSV(report: ReportData): string {
  const lines: string[] = [];

  lines.push(`"${report.title}"`);
  if (report.dateRange) {
    lines.push(`"${report.dateRange}"`);
  }
  lines.push(`"Generated: ${new Date(report.generatedAt).toLocaleString()}"`);
  lines.push('');

  const headers = ['Account', ...report.columns.map((col) => col.label)];
  lines.push(headers.map(escapeCSV).join(','));

  const flatRows = flattenRows(report.rows);
  for (const row of flatRows) {
    const indent = '  '.repeat(row.depth);
    const values = [
      `${indent}${row.name}`,
      ...report.columns.map((col) => {
        const value = row.values[col.key];
        if (value === null || value === undefined) return '';
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
