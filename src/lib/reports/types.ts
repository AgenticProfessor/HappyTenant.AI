// Report Types and Definitions for Happy Tenant Accounting Reports

export type ReportType =
  | 'balance-sheet'
  | 'profit-loss'
  | 'cash-flow'
  | 'owner-statement'
  | 'rent-roll'
  | 'property-performance'
  | 'vacancy'
  | 'aging-report'
  | 'security-deposit'
  | 'tenant-ledger'
  | 'tax-1099'
  | 'expense-report'
  | 'depreciation';

export type ReportCategory = 'business-overview' | 'property' | 'tenant' | 'tax';

export type PeriodPreset =
  | 'year-to-date'
  | 'last-year'
  | 'last-12-months'
  | 'this-quarter'
  | 'last-quarter'
  | 'this-month'
  | 'last-month'
  | 'custom';

export type AccountingMethod = 'cash' | 'accrual';

export type GroupBy = 'none' | 'month' | 'quarter' | 'property';

export interface ReportFilters {
  period: PeriodPreset;
  startDate: string;
  endDate: string;
  accountingMethod: AccountingMethod;
  groupBy: GroupBy;
  propertyId?: string;
}

export interface ReportColumn {
  key: string;
  label: string;
  type: 'text' | 'currency' | 'number' | 'percentage' | 'date';
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface ReportRow {
  id: string;
  name: string;
  accountCode?: string;
  depth: number;
  isGroup: boolean;
  isTotal: boolean;
  values: Record<string, number | string | null>;
  children?: ReportRow[];
  metadata?: Record<string, unknown>;
}

export interface ReportData {
  type: ReportType;
  title: string;
  subtitle?: string;
  dateRange: string;
  generatedAt: string;
  filters: ReportFilters;
  columns: ReportColumn[];
  rows: ReportRow[];
  summary?: ReportSummary;
}

export interface ReportSummary {
  totalIncome?: number;
  totalExpenses?: number;
  netIncome?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  totalEquity?: number;
  customMetrics?: Record<string, number | string>;
}

export interface ReportDefinition {
  type: ReportType;
  name: string;
  description: string;
  category: ReportCategory;
  icon: string;
  variants: ReportVariant[];
  supportedFilters: {
    period: boolean;
    dateRange: boolean;
    accountingMethod: boolean;
    groupBy: GroupBy[];
    propertyFilter: boolean;
  };
}

export interface ReportVariant {
  id: string;
  name: string;
  groupBy: GroupBy;
}

export interface ReportListItem {
  type: ReportType;
  name: string;
  description: string;
  category: ReportCategory;
  icon: string;
  isFavorite: boolean;
  variants: ReportVariant[];
}

export interface ReportCategoryGroup {
  category: ReportCategory;
  name: string;
  description: string;
  reports: ReportListItem[];
}

// Steward AI Analysis Types
export interface StewardAnalysis {
  summary: string;
  keyFindings: string[];
  potentialIssues: string[];
  suggestions: string[];
  metrics?: AnalysisMetric[];
}

export interface AnalysisMetric {
  name: string;
  value: number | string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'good' | 'warning' | 'critical';
}

// Transaction Drill-down Types
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'charge' | 'payment' | 'expense';
  category: string;
  reference?: string;
  propertyName?: string;
  unitNumber?: string;
  tenantName?: string;
  status?: string;
}

export interface DrilldownTransaction {
  id: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  property?: string;
  tenant?: string;
  paymentMethod?: string;
  status: string;
}

export interface DrilldownRequest {
  reportType: ReportType;
  rowId: string;
  columnKey: string;
  filters: ReportFilters;
}

export interface DrilldownResponse {
  transactions: DrilldownTransaction[];
  totalAmount: number;
  count: number;
}

// Export Types
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'google-sheets' | 'quickbooks' | 'xero' | 'wave';

export interface ExportRequest {
  reportType: ReportType;
  filters: ReportFilters;
  format: ExportFormat;
}

export interface ExportResponse {
  success: boolean;
  url?: string;
  message?: string;
  filename?: string;
}

// API Response Types
export interface ReportsListResponse {
  reports: ReportListItem[];
  categories: ReportCategoryGroup[];
}

export interface ReportDataResponse {
  report: ReportData;
}

export interface FavoriteToggleRequest {
  reportType: ReportType;
}

export interface FavoriteToggleResponse {
  success: boolean;
  isFavorite: boolean;
}
