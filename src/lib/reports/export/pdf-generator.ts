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

export async function generatePDFReport(
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

  return reportToHTML(report);
}

function reportToHTML(report: ReportData): string {
  const flatRows = flattenRows(report.rows);

  const tableRows = flatRows
    .map((row) => {
      const indent = row.depth * 20;
      const rowClass = row.isTotal ? 'total-row' : row.isGroup ? 'group-row' : '';

      const cells = report.columns
        .map((col) => {
          const value = row.values[col.key];
          let displayValue = '';

          if (value !== null && value !== undefined) {
            if (typeof value === 'number') {
              if (col.type === 'currency') {
                displayValue = formatCurrency(value);
              } else if (col.type === 'percentage') {
                displayValue = `${value.toFixed(1)}%`;
              } else {
                displayValue = value.toString();
              }
            } else {
              displayValue = String(value);
            }
          }

          const valueClass = typeof value === 'number' && value < 0 ? 'negative' : '';
          return `<td class="${valueClass}">${displayValue}</td>`;
        })
        .join('');

      return `
        <tr class="${rowClass}">
          <td style="padding-left: ${indent + 8}px">${row.name}</td>
          ${cells}
        </tr>
      `;
    })
    .join('');

  const headerCells = report.columns.map((col) => `<th>${col.label}</th>`).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #333;
      padding: 20px;
    }

    .header {
      margin-bottom: 20px;
      border-bottom: 2px solid #4f46e5;
      padding-bottom: 15px;
    }

    .header h1 {
      font-size: 24px;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .header .date-range {
      font-size: 14px;
      color: #64748b;
    }

    .header .generated {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 8px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    th {
      background-color: #f8fafc;
      border-bottom: 2px solid #e2e8f0;
      padding: 10px 8px;
      text-align: right;
      font-weight: 600;
      color: #475569;
    }

    th:first-child {
      text-align: left;
    }

    td {
      padding: 8px;
      border-bottom: 1px solid #f1f5f9;
      text-align: right;
    }

    td:first-child {
      text-align: left;
    }

    tr:hover {
      background-color: #f8fafc;
    }

    .total-row {
      font-weight: 600;
      background-color: #f1f5f9;
    }

    .total-row td {
      border-top: 2px solid #e2e8f0;
      border-bottom: 2px solid #e2e8f0;
    }

    .group-row {
      font-weight: 500;
    }

    .negative {
      color: #dc2626;
    }

    @media print {
      body {
        padding: 0;
      }

      @page {
        margin: 1cm;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${report.title}</h1>
    ${report.dateRange ? `<div class="date-range">${report.dateRange}</div>` : ''}
    <div class="generated">Generated: ${new Date(report.generatedAt).toLocaleString()}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Account</th>
        ${headerCells}
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <script>
    // Auto-print when opened
    // window.onload = function() { window.print(); }
  </script>
</body>
</html>
  `;
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

function formatCurrency(value: number): string {
  const isNegative = value < 0;
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(value));
  return isNegative ? `-${formatted}` : formatted;
}
