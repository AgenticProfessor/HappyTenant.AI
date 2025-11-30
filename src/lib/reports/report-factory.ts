/**
 * Report Factory - Single source of truth for report generation
 * Eliminates duplicate switch statements across export generators
 */

import type { PrismaClient } from '@prisma/client';
import type { ReportType, ReportFilters, ReportData } from './types';

// Import all report generators
import { generateBalanceSheet } from './calculations/balance-sheet';
import { generateProfitLoss } from './calculations/profit-loss';
import { generateRentRoll } from './calculations/rent-roll';
import { generateAgingReport } from './calculations/aging-report';
import { generateCashFlow } from './calculations/cash-flow';
import { generateSecurityDeposit } from './calculations/security-deposit';
import { generateExpenseReport } from './calculations/expense-report';
import { generateOwnerStatement } from './calculations/owner-statement';
import { generatePropertyPerformance } from './calculations/property-performance';
import { generateVacancyReport } from './calculations/vacancy';
import { generateTenantLedger } from './calculations/tenant-ledger';
import { generateTax1099 } from './calculations/tax-1099';
import { generateDepreciation } from './calculations/depreciation';

/**
 * Report generator function type
 */
type ReportGenerator = (
  prisma: PrismaClient,
  organizationId: string,
  filters: ReportFilters
) => Promise<ReportData>;

/**
 * Registry of all available report generators
 * Single definition used by CSV, Excel, PDF, and all other exporters
 */
const REPORT_GENERATORS: Record<ReportType, ReportGenerator> = {
  'balance-sheet': generateBalanceSheet,
  'profit-loss': generateProfitLoss,
  'cash-flow': generateCashFlow,
  'owner-statement': generateOwnerStatement,
  'rent-roll': generateRentRoll,
  'property-performance': generatePropertyPerformance,
  'vacancy': generateVacancyReport,
  'aging-report': generateAgingReport,
  'security-deposit': generateSecurityDeposit,
  'tenant-ledger': generateTenantLedger,
  'tax-1099': generateTax1099,
  'expense-report': generateExpenseReport,
  'depreciation': generateDepreciation,
};

/**
 * List of all valid report types
 */
export const VALID_REPORT_TYPES = Object.keys(REPORT_GENERATORS) as ReportType[];

/**
 * Check if a report type is valid
 */
export function isValidReportType(type: string): type is ReportType {
  return type in REPORT_GENERATORS;
}

/**
 * Generate a report of any type
 * This is the single source of truth for report generation
 *
 * @param prisma - Prisma client instance
 * @param organizationId - Organization ID for data scoping
 * @param reportType - Type of report to generate
 * @param filters - Report filters (date range, accounting method, etc.)
 * @returns Promise<ReportData> - Generated report data
 * @throws Error if report type is invalid
 */
export async function generateReport(
  prisma: PrismaClient,
  organizationId: string,
  reportType: string,
  filters: ReportFilters
): Promise<ReportData> {
  if (!isValidReportType(reportType)) {
    throw new ReportError(`Unknown report type: ${reportType}`, 'INVALID_REPORT_TYPE');
  }

  const generator = REPORT_GENERATORS[reportType];

  try {
    return await generator(prisma, organizationId, filters);
  } catch (error) {
    if (error instanceof ReportError) {
      throw error;
    }
    throw new ReportError(
      `Failed to generate ${reportType} report: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'GENERATION_FAILED'
    );
  }
}

/**
 * Custom error class for report-related errors
 */
export class ReportError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ReportError';
  }
}

/**
 * Report metadata for UI display
 */
export interface ReportMetadata {
  type: ReportType;
  name: string;
  description: string;
  category: 'business-overview' | 'property' | 'tenant' | 'tax';
  icon: string;
}

/**
 * Registry of report metadata for UI display
 */
export const REPORT_METADATA: Record<ReportType, ReportMetadata> = {
  'balance-sheet': {
    type: 'balance-sheet',
    name: 'Balance Sheet',
    description: 'Assets, liabilities, and equity snapshot',
    category: 'business-overview',
    icon: 'Scale',
  },
  'profit-loss': {
    type: 'profit-loss',
    name: 'Profit & Loss',
    description: 'Income and expenses for the period',
    category: 'business-overview',
    icon: 'TrendingUp',
  },
  'cash-flow': {
    type: 'cash-flow',
    name: 'Cash Flow',
    description: 'Money movement over time',
    category: 'business-overview',
    icon: 'ArrowRightLeft',
  },
  'owner-statement': {
    type: 'owner-statement',
    name: 'Owner Statement',
    description: 'Summary for property owners',
    category: 'business-overview',
    icon: 'FileText',
  },
  'rent-roll': {
    type: 'rent-roll',
    name: 'Rent Roll',
    description: 'Current rents and occupancy',
    category: 'property',
    icon: 'Building2',
  },
  'property-performance': {
    type: 'property-performance',
    name: 'Property Performance',
    description: 'Property-level metrics and trends',
    category: 'property',
    icon: 'BarChart3',
  },
  'vacancy': {
    type: 'vacancy',
    name: 'Vacancy Report',
    description: 'Vacant units and lost revenue',
    category: 'property',
    icon: 'DoorOpen',
  },
  'aging-report': {
    type: 'aging-report',
    name: 'Aging Report',
    description: 'Outstanding balances by age',
    category: 'tenant',
    icon: 'Clock',
  },
  'security-deposit': {
    type: 'security-deposit',
    name: 'Security Deposit',
    description: 'Deposit tracking and liability',
    category: 'tenant',
    icon: 'Shield',
  },
  'tenant-ledger': {
    type: 'tenant-ledger',
    name: 'Tenant Ledger',
    description: 'Individual tenant transactions',
    category: 'tenant',
    icon: 'Users',
  },
  'tax-1099': {
    type: 'tax-1099',
    name: '1099 Report',
    description: 'Vendor payments for tax reporting',
    category: 'tax',
    icon: 'Receipt',
  },
  'expense-report': {
    type: 'expense-report',
    name: 'Expense Report',
    description: 'Detailed expense breakdown',
    category: 'tax',
    icon: 'Wallet',
  },
  'depreciation': {
    type: 'depreciation',
    name: 'Depreciation',
    description: 'Asset depreciation schedules',
    category: 'tax',
    icon: 'Calculator',
  },
};
