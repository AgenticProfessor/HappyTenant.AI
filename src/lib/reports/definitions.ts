import type { ReportDefinition, ReportCategoryGroup, ReportCategory } from './types';

// Category metadata
export const REPORT_CATEGORIES: Record<ReportCategory, { name: string; description: string; order: number }> = {
  'business-overview': {
    name: 'Business Overview',
    description: 'High-level financial statements and summaries',
    order: 1,
  },
  'property': {
    name: 'Property Reports',
    description: 'Property-specific performance and occupancy metrics',
    order: 2,
  },
  'tenant': {
    name: 'Tenant Reports',
    description: 'Tenant balances, payments, and account details',
    order: 3,
  },
  'tax': {
    name: 'Tax Reports',
    description: 'Tax preparation and compliance reports',
    order: 4,
  },
};

// All report definitions
export const REPORT_DEFINITIONS: ReportDefinition[] = [
  // Business Overview Reports
  {
    type: 'balance-sheet',
    name: 'Balance Sheet',
    description: 'Snapshot of assets, liabilities, and equity at a point in time',
    category: 'business-overview',
    icon: 'Scale',
    variants: [
      { id: 'standard', name: 'Balance Sheet', groupBy: 'none' },
      { id: 'by-month', name: 'Balance Sheet by Month', groupBy: 'month' },
      { id: 'by-property', name: 'Balance Sheet by Property', groupBy: 'property' },
      { id: 'by-quarter', name: 'Balance Sheet by Quarter', groupBy: 'quarter' },
    ],
    supportedFilters: {
      period: true,
      dateRange: true,
      accountingMethod: true,
      groupBy: ['none', 'month', 'quarter', 'property'],
      propertyFilter: true,
    },
  },
  {
    type: 'profit-loss',
    name: 'Profit and Loss',
    description: 'Income and expenses over a period showing net profit or loss',
    category: 'business-overview',
    icon: 'TrendingUp',
    variants: [
      { id: 'standard', name: 'Profit and Loss', groupBy: 'none' },
      { id: 'by-month', name: 'Profit and Loss by Month', groupBy: 'month' },
      { id: 'by-property', name: 'Profit and Loss by Property', groupBy: 'property' },
      { id: 'by-quarter', name: 'Profit and Loss by Quarter', groupBy: 'quarter' },
    ],
    supportedFilters: {
      period: true,
      dateRange: true,
      accountingMethod: true,
      groupBy: ['none', 'month', 'quarter', 'property'],
      propertyFilter: true,
    },
  },
  {
    type: 'cash-flow',
    name: 'Cash Flow Statement',
    description: 'Track cash inflows and outflows from operations',
    category: 'business-overview',
    icon: 'ArrowLeftRight',
    variants: [
      { id: 'standard', name: 'Cash Flow Statement', groupBy: 'none' },
    ],
    supportedFilters: {
      period: true,
      dateRange: true,
      accountingMethod: false,
      groupBy: ['none', 'month', 'quarter'],
      propertyFilter: true,
    },
  },
  {
    type: 'owner-statement',
    name: 'Owner Statement',
    description: 'Summary statement for property owners showing income, expenses, and distributions',
    category: 'business-overview',
    icon: 'FileText',
    variants: [
      { id: 'by-property', name: 'Owner Statement', groupBy: 'property' },
    ],
    supportedFilters: {
      period: true,
      dateRange: true,
      accountingMethod: true,
      groupBy: ['property'],
      propertyFilter: true,
    },
  },

  // Property Reports
  {
    type: 'rent-roll',
    name: 'Rent Roll',
    description: 'Complete list of units with tenants, lease terms, and rent amounts',
    category: 'property',
    icon: 'Building2',
    variants: [
      { id: 'standard', name: 'Rent Roll', groupBy: 'none' },
      { id: 'by-property', name: 'Rent Roll by Property', groupBy: 'property' },
    ],
    supportedFilters: {
      period: false,
      dateRange: false,
      accountingMethod: false,
      groupBy: ['none', 'property'],
      propertyFilter: true,
    },
  },
  {
    type: 'property-performance',
    name: 'Property Performance',
    description: 'Key metrics including occupancy, NOI, and cap rate per property',
    category: 'property',
    icon: 'BarChart3',
    variants: [
      { id: 'standard', name: 'Property Performance', groupBy: 'property' },
    ],
    supportedFilters: {
      period: true,
      dateRange: true,
      accountingMethod: true,
      groupBy: ['property'],
      propertyFilter: true,
    },
  },
  {
    type: 'vacancy',
    name: 'Vacancy Report',
    description: 'Vacant units with days vacant and estimated lost revenue',
    category: 'property',
    icon: 'DoorOpen',
    variants: [
      { id: 'standard', name: 'Vacancy Report', groupBy: 'none' },
      { id: 'by-property', name: 'Vacancy Report by Property', groupBy: 'property' },
    ],
    supportedFilters: {
      period: false,
      dateRange: false,
      accountingMethod: false,
      groupBy: ['none', 'property'],
      propertyFilter: true,
    },
  },

  // Tenant Reports
  {
    type: 'aging-report',
    name: 'Aging Report',
    description: 'Outstanding balances grouped by age: Current, 1-30, 31-60, 61-90, 90+ days',
    category: 'tenant',
    icon: 'Clock',
    variants: [
      { id: 'standard', name: 'Aging Report', groupBy: 'none' },
      { id: 'by-property', name: 'Aging Report by Property', groupBy: 'property' },
    ],
    supportedFilters: {
      period: false,
      dateRange: false,
      accountingMethod: false,
      groupBy: ['none', 'property'],
      propertyFilter: true,
    },
  },
  {
    type: 'security-deposit',
    name: 'Security Deposit Report',
    description: 'All security deposits held with tenant and property details',
    category: 'tenant',
    icon: 'Shield',
    variants: [
      { id: 'standard', name: 'Security Deposit Report', groupBy: 'none' },
      { id: 'by-property', name: 'Security Deposit Report by Property', groupBy: 'property' },
    ],
    supportedFilters: {
      period: false,
      dateRange: false,
      accountingMethod: false,
      groupBy: ['none', 'property'],
      propertyFilter: true,
    },
  },
  {
    type: 'tenant-ledger',
    name: 'Tenant Ledger',
    description: 'Complete transaction history for each tenant',
    category: 'tenant',
    icon: 'Users',
    variants: [
      { id: 'standard', name: 'Tenant Ledger', groupBy: 'none' },
    ],
    supportedFilters: {
      period: true,
      dateRange: true,
      accountingMethod: false,
      groupBy: ['none'],
      propertyFilter: true,
    },
  },

  // Tax Reports
  {
    type: 'tax-1099',
    name: '1099 Report',
    description: 'Vendor payments over $600 for 1099 filing requirements',
    category: 'tax',
    icon: 'FileCheck',
    variants: [
      { id: 'standard', name: '1099 Report', groupBy: 'none' },
    ],
    supportedFilters: {
      period: true,
      dateRange: true,
      accountingMethod: false,
      groupBy: ['none'],
      propertyFilter: false,
    },
  },
  {
    type: 'expense-report',
    name: 'Expense Report',
    description: 'All expenses categorized for tax deduction purposes',
    category: 'tax',
    icon: 'Receipt',
    variants: [
      { id: 'standard', name: 'Expense Report', groupBy: 'none' },
      { id: 'by-category', name: 'Expense Report by Category', groupBy: 'none' },
      { id: 'by-property', name: 'Expense Report by Property', groupBy: 'property' },
    ],
    supportedFilters: {
      period: true,
      dateRange: true,
      accountingMethod: true,
      groupBy: ['none', 'property'],
      propertyFilter: true,
    },
  },
  {
    type: 'depreciation',
    name: 'Depreciation Schedule',
    description: 'Asset depreciation tracking for tax purposes',
    category: 'tax',
    icon: 'Calculator',
    variants: [
      { id: 'standard', name: 'Depreciation Schedule', groupBy: 'none' },
      { id: 'by-property', name: 'Depreciation Schedule by Property', groupBy: 'property' },
    ],
    supportedFilters: {
      period: true,
      dateRange: true,
      accountingMethod: false,
      groupBy: ['none', 'property'],
      propertyFilter: true,
    },
  },
];

// Get report definition by type
export function getReportDefinition(type: string): ReportDefinition | undefined {
  return REPORT_DEFINITIONS.find((r) => r.type === type);
}

// Get all reports grouped by category
export function getReportsByCategory(): ReportCategoryGroup[] {
  const categories: ReportCategoryGroup[] = [];

  for (const [categoryKey, categoryMeta] of Object.entries(REPORT_CATEGORIES)) {
    const category = categoryKey as ReportCategory;
    const reports = REPORT_DEFINITIONS.filter((r) => r.category === category);

    categories.push({
      category,
      name: categoryMeta.name,
      description: categoryMeta.description,
      reports: reports.map((r) => ({
        type: r.type,
        name: r.name,
        description: r.description,
        category: r.category,
        icon: r.icon,
        isFavorite: false, // Will be populated from database
        variants: r.variants,
      })),
    });
  }

  // Sort by order
  return categories.sort((a, b) => {
    const orderA = REPORT_CATEGORIES[a.category].order;
    const orderB = REPORT_CATEGORIES[b.category].order;
    return orderA - orderB;
  });
}

// Get default filters for a report
export function getDefaultFilters(type: string): {
  period: 'year-to-date';
  startDate: string;
  endDate: string;
  accountingMethod: 'cash';
  groupBy: 'none' | 'month' | 'quarter' | 'property';
} {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  return {
    period: 'year-to-date',
    startDate: startOfYear.toISOString().split('T')[0],
    endDate: now.toISOString().split('T')[0],
    accountingMethod: 'cash',
    groupBy: 'none',
  };
}

// Calculate date range from period preset
export function getDateRangeFromPeriod(period: string): { startDate: string; endDate: string } {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  switch (period) {
    case 'year-to-date':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'last-year':
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31);
      break;
    case 'last-12-months':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 12);
      break;
    case 'this-quarter':
      const currentQuarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
      break;
    case 'last-quarter':
      const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
      const year = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const quarter = lastQuarter < 0 ? 3 : lastQuarter;
      startDate = new Date(year, quarter * 3, 1);
      endDate = new Date(year, quarter * 3 + 3, 0);
      break;
    case 'this-month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last-month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    default:
      startDate = new Date(now.getFullYear(), 0, 1);
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

// Period presets for the filter dropdown
export const PERIOD_PRESETS = [
  { value: 'year-to-date', label: 'Year to Date' },
  { value: 'last-year', label: 'Last Year' },
  { value: 'last-12-months', label: 'Last 12 Months' },
  { value: 'this-quarter', label: 'This Quarter' },
  { value: 'last-quarter', label: 'Last Quarter' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' },
];

// Accounting method options
export const ACCOUNTING_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'accrual', label: 'Accrual' },
];

// Group by options
export const GROUP_BY_OPTIONS = [
  { value: 'none', label: 'No Grouping' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'property', label: 'Property' },
];
