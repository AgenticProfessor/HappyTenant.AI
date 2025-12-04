'use client';

/**
 * StewardDataProvider - Root-level data aggregation for Steward AI
 *
 * This provider sits at the root of the app and aggregates portfolio-wide data
 * that Steward can use to provide intelligent, context-aware assistance.
 *
 * It provides:
 * 1. Portfolio-wide metrics and summaries
 * 2. Real-time alerts and notifications
 * 3. Proactive insights based on data analysis
 * 4. Page-specific context enrichment
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';

// ============================================================================
// Types
// ============================================================================

export interface PortfolioMetrics {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  totalTenants: number;
  totalRevenue: number;
  totalExpenses: number;
  netOperatingIncome: number;
  collectionRate: number;
  pendingMaintenance: number;
  overduePayments: number;
  activeApplications: number;
  unreadMessages: number;
}

export interface PortfolioAlert {
  id: string;
  type: 'warning' | 'critical' | 'info' | 'success';
  category: 'payments' | 'maintenance' | 'leases' | 'compliance' | 'applications';
  title: string;
  description: string;
  actionLabel?: string;
  actionPath?: string;
  timestamp: Date;
  priority: number;
}

export interface ProactiveInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'recommendation' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  suggestedAction?: string;
  relatedData?: Record<string, unknown>;
}

export interface PageContextEnrichment {
  pageName: string;
  pageType: 'dashboard' | 'list' | 'detail' | 'form' | 'report' | 'settings';
  relevantMetrics: string[];
  relevantAlerts: PortfolioAlert[];
  suggestedQuestions: string[];
  availableActions: string[];
}

export interface StewardDataContextValue {
  // Portfolio data
  metrics: PortfolioMetrics | null;
  alerts: PortfolioAlert[];
  insights: ProactiveInsight[];

  // Page context
  currentPageContext: PageContextEnrichment | null;

  // Loading states
  isLoadingMetrics: boolean;
  isLoadingAlerts: boolean;

  // Actions
  refreshMetrics: () => Promise<void>;
  refreshAlerts: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Data accessors for specific pages
  getContextForPage: (pathname: string) => PageContextEnrichment;
  getRelevantInsights: (category?: string) => ProactiveInsight[];

  // Last update timestamps
  lastMetricsUpdate: Date | null;
  lastAlertsUpdate: Date | null;
}

// ============================================================================
// Page Context Mappings
// ============================================================================

const PAGE_CONTEXT_MAP: Record<string, Omit<PageContextEnrichment, 'relevantAlerts'>> = {
  '/dashboard': {
    pageName: 'Dashboard',
    pageType: 'dashboard',
    relevantMetrics: ['occupancyRate', 'collectionRate', 'netOperatingIncome', 'pendingMaintenance'],
    suggestedQuestions: [
      'What are my key priorities today?',
      'How is my portfolio performing this month?',
      'Are there any urgent issues I should address?',
      'Show me a summary of rent collection status',
    ],
    availableActions: ['view_reports', 'check_payments', 'review_maintenance', 'send_reminder'],
  },
  '/dashboard/properties': {
    pageName: 'Properties',
    pageType: 'list',
    relevantMetrics: ['totalProperties', 'totalUnits', 'occupancyRate', 'vacantUnits'],
    suggestedQuestions: [
      'Which properties have the highest vacancy?',
      'What is the average rent across my portfolio?',
      'Which property needs the most attention?',
      'Help me list a vacant unit',
    ],
    availableActions: ['add_property', 'list_unit', 'view_performance', 'generate_report'],
  },
  '/dashboard/tenants': {
    pageName: 'Tenants',
    pageType: 'list',
    relevantMetrics: ['totalTenants', 'collectionRate', 'overduePayments'],
    suggestedQuestions: [
      'Which tenants have overdue rent?',
      'Are any leases expiring soon?',
      'Draft a late rent notice',
      'Show me tenant payment history',
    ],
    availableActions: ['send_message', 'record_payment', 'view_lease', 'send_reminder'],
  },
  '/dashboard/payments': {
    pageName: 'Payments',
    pageType: 'list',
    relevantMetrics: ['totalRevenue', 'collectionRate', 'overduePayments', 'netOperatingIncome'],
    suggestedQuestions: [
      'What is my collection rate this month?',
      'Who has outstanding balances?',
      'Send payment reminders to late tenants',
      'Generate a rent roll report',
    ],
    availableActions: ['record_payment', 'send_reminder', 'generate_report', 'view_transactions'],
  },
  '/dashboard/maintenance': {
    pageName: 'Maintenance',
    pageType: 'list',
    relevantMetrics: ['pendingMaintenance', 'totalExpenses'],
    suggestedQuestions: [
      'What maintenance requests are urgent?',
      'Find a plumber for a leak repair',
      'What is my maintenance spend this month?',
      'Create a new maintenance request',
    ],
    availableActions: ['create_request', 'assign_vendor', 'update_status', 'view_history'],
  },
  '/dashboard/applications': {
    pageName: 'Applications',
    pageType: 'list',
    relevantMetrics: ['activeApplications', 'vacantUnits'],
    suggestedQuestions: [
      'Which applications need review?',
      'Score this applicant for me',
      'What screening criteria should I use?',
      'Help me approve this application',
    ],
    availableActions: ['review_application', 'run_screening', 'approve', 'reject', 'convert_to_tenant'],
  },
  '/dashboard/messages': {
    pageName: 'Messages',
    pageType: 'list',
    relevantMetrics: ['unreadMessages'],
    suggestedQuestions: [
      'Summarize my unread messages',
      'Draft a response to this tenant',
      'Are there any urgent messages?',
      'Send a mass announcement',
    ],
    availableActions: ['send_message', 'draft_response', 'mark_read', 'archive'],
  },
  '/dashboard/reports': {
    pageName: 'Reports',
    pageType: 'report',
    relevantMetrics: ['totalRevenue', 'totalExpenses', 'netOperatingIncome', 'occupancyRate'],
    suggestedQuestions: [
      'Generate a profit & loss statement',
      'What are my biggest expenses?',
      'Compare this month to last month',
      'Export my financial data',
    ],
    availableActions: ['generate_report', 'export_data', 'schedule_report', 'view_trends'],
  },
  '/dashboard/insights': {
    pageName: 'Insights',
    pageType: 'report',
    relevantMetrics: ['netOperatingIncome', 'occupancyRate', 'collectionRate', 'totalExpenses'],
    suggestedQuestions: [
      'What trends should I be aware of?',
      'How can I improve my NOI?',
      'Forecast my cash flow',
      'Identify cost-saving opportunities',
    ],
    availableActions: ['view_forecast', 'analyze_trends', 'set_goals', 'compare_properties'],
  },
  '/dashboard/intelligence': {
    pageName: 'Intelligence',
    pageType: 'report',
    relevantMetrics: ['totalProperties', 'occupancyRate', 'netOperatingIncome'],
    suggestedQuestions: [
      'What market trends affect my properties?',
      'Are there regulatory changes I should know about?',
      'How does my portfolio compare to the market?',
      'What economic indicators should I watch?',
    ],
    availableActions: ['view_market_data', 'check_regulations', 'analyze_competition'],
  },
};

const DEFAULT_PAGE_CONTEXT: Omit<PageContextEnrichment, 'relevantAlerts'> = {
  pageName: 'Happy Tenant',
  pageType: 'dashboard',
  relevantMetrics: ['occupancyRate', 'collectionRate', 'pendingMaintenance'],
  suggestedQuestions: [
    'How can I help you today?',
    'Show me a summary of my portfolio',
    'What tasks need my attention?',
  ],
  availableActions: ['navigate', 'search', 'help'],
};

// ============================================================================
// Mock Data Generator (Replace with real API calls)
// ============================================================================

function generateMockMetrics(): PortfolioMetrics {
  return {
    totalProperties: 5,
    totalUnits: 19,
    occupiedUnits: 17,
    vacantUnits: 2,
    occupancyRate: 89.5,
    totalTenants: 17,
    totalRevenue: 28500,
    totalExpenses: 9200,
    netOperatingIncome: 19300,
    collectionRate: 94,
    pendingMaintenance: 4,
    overduePayments: 3,
    activeApplications: 2,
    unreadMessages: 5,
  };
}

function generateMockAlerts(metrics: PortfolioMetrics): PortfolioAlert[] {
  const alerts: PortfolioAlert[] = [];

  if (metrics.overduePayments > 0) {
    alerts.push({
      id: 'overdue-rent',
      type: 'warning',
      category: 'payments',
      title: `${metrics.overduePayments} overdue payments`,
      description: `You have ${metrics.overduePayments} tenant(s) with overdue rent totaling approximately $${(metrics.overduePayments * 1500).toLocaleString()}`,
      actionLabel: 'Send Reminders',
      actionPath: '/dashboard/payments?filter=overdue',
      timestamp: new Date(),
      priority: 1,
    });
  }

  if (metrics.pendingMaintenance > 2) {
    alerts.push({
      id: 'pending-maintenance',
      type: 'info',
      category: 'maintenance',
      title: `${metrics.pendingMaintenance} maintenance requests pending`,
      description: 'Review and assign vendors to pending maintenance requests',
      actionLabel: 'Review Requests',
      actionPath: '/dashboard/maintenance?status=pending',
      timestamp: new Date(),
      priority: 2,
    });
  }

  if (metrics.vacantUnits > 0) {
    alerts.push({
      id: 'vacant-units',
      type: 'info',
      category: 'leases',
      title: `${metrics.vacantUnits} vacant unit(s)`,
      description: 'Consider listing these units or reviewing pricing',
      actionLabel: 'View Vacancies',
      actionPath: '/dashboard/properties?filter=vacant',
      timestamp: new Date(),
      priority: 3,
    });
  }

  if (metrics.activeApplications > 0) {
    alerts.push({
      id: 'pending-applications',
      type: 'success',
      category: 'applications',
      title: `${metrics.activeApplications} application(s) pending review`,
      description: 'New tenant applications are waiting for your review',
      actionLabel: 'Review Applications',
      actionPath: '/dashboard/applications?status=pending',
      timestamp: new Date(),
      priority: 2,
    });
  }

  return alerts.sort((a, b) => a.priority - b.priority);
}

function generateMockInsights(metrics: PortfolioMetrics): ProactiveInsight[] {
  const insights: ProactiveInsight[] = [];

  if (metrics.occupancyRate < 90) {
    insights.push({
      id: 'low-occupancy',
      type: 'risk',
      title: 'Occupancy below target',
      description: `Your current occupancy rate of ${metrics.occupancyRate}% is below the 90% target. Consider adjusting rental prices or increasing marketing.`,
      impact: 'high',
      suggestedAction: 'Review vacant unit pricing',
    });
  }

  if (metrics.collectionRate < 95) {
    insights.push({
      id: 'collection-rate',
      type: 'risk',
      title: 'Collection rate needs attention',
      description: `Your collection rate of ${metrics.collectionRate}% indicates some payment issues. Consider implementing auto-pay incentives.`,
      impact: 'medium',
      suggestedAction: 'Set up payment reminders',
    });
  }

  if (metrics.netOperatingIncome > 15000) {
    insights.push({
      id: 'strong-noi',
      type: 'opportunity',
      title: 'Strong cash flow this month',
      description: `Your NOI of $${metrics.netOperatingIncome.toLocaleString()} is performing well. Consider reinvesting in property improvements.`,
      impact: 'medium',
      suggestedAction: 'View investment opportunities',
    });
  }

  return insights;
}

// ============================================================================
// Context
// ============================================================================

const StewardDataContext = createContext<StewardDataContextValue | null>(null);

interface StewardDataProviderProps {
  children: ReactNode;
}

export function StewardDataProvider({ children }: StewardDataProviderProps) {
  const pathname = usePathname();

  // State
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [alerts, setAlerts] = useState<PortfolioAlert[]>([]);
  const [insights, setInsights] = useState<ProactiveInsight[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const [lastMetricsUpdate, setLastMetricsUpdate] = useState<Date | null>(null);
  const [lastAlertsUpdate, setLastAlertsUpdate] = useState<Date | null>(null);

  // Fetch metrics
  const refreshMetrics = useCallback(async () => {
    setIsLoadingMetrics(true);
    try {
      // Fetch from real dashboard API
      const response = await fetch('/api/dashboard');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const dashboardData = await response.json();
      const stats = dashboardData.stats;

      // Map dashboard stats to PortfolioMetrics
      const data: PortfolioMetrics = {
        totalProperties: stats.totalProperties || 0,
        totalUnits: stats.totalUnits || 0,
        occupiedUnits: stats.occupiedUnits || 0,
        vacantUnits: (stats.totalUnits || 0) - (stats.occupiedUnits || 0),
        occupancyRate: stats.totalUnits > 0
          ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100 * 10) / 10
          : 0,
        totalTenants: stats.activeTenants || 0,
        totalRevenue: stats.collectedRent || 0,
        totalExpenses: 0, // TODO: Add expenses to dashboard API
        netOperatingIncome: stats.collectedRent || 0,
        collectionRate: stats.collectionRate || 0,
        pendingMaintenance: stats.openMaintenanceRequests || 0,
        overduePayments: stats.overduePayments || 0,
        activeApplications: stats.activeApplications || 0,
        unreadMessages: stats.unreadMessages || 0,
      };

      setMetrics(data);
      setLastMetricsUpdate(new Date());

      // Generate insights based on real metrics
      setInsights(generateMockInsights(data));
    } catch (error) {
      console.error('Failed to fetch portfolio metrics:', error);
      // Fallback to mock data if API fails
      const data = generateMockMetrics();
      setMetrics(data);
      setInsights(generateMockInsights(data));
    } finally {
      setIsLoadingMetrics(false);
    }
  }, []);

  // Fetch alerts
  const refreshAlerts = useCallback(async () => {
    setIsLoadingAlerts(true);
    try {
      // TODO: Replace with real API call
      // const response = await fetch('/api/steward/alerts');
      // const data = await response.json();

      await new Promise(resolve => setTimeout(resolve, 300));
      const data = generateMockAlerts(metrics || generateMockMetrics());

      setAlerts(data);
      setLastAlertsUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setIsLoadingAlerts(false);
    }
  }, [metrics]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([refreshMetrics(), refreshAlerts()]);
  }, [refreshMetrics, refreshAlerts]);

  // Get context for a specific page
  const getContextForPage = useCallback((path: string): PageContextEnrichment => {
    // Find the best matching page context
    const normalizedPath = path.split('?')[0]; // Remove query params

    // Try exact match first
    let pageContext = PAGE_CONTEXT_MAP[normalizedPath];

    // If no exact match, try to find parent path
    if (!pageContext) {
      const pathParts = normalizedPath.split('/').filter(Boolean);
      while (pathParts.length > 0 && !pageContext) {
        const tryPath = '/' + pathParts.join('/');
        pageContext = PAGE_CONTEXT_MAP[tryPath];
        pathParts.pop();
      }
    }

    // Use default if still no match
    const context = pageContext || DEFAULT_PAGE_CONTEXT;

    // Filter relevant alerts for this page
    const relevantAlerts = alerts.filter(alert => {
      if (normalizedPath.includes('payment')) return alert.category === 'payments';
      if (normalizedPath.includes('maintenance')) return alert.category === 'maintenance';
      if (normalizedPath.includes('application')) return alert.category === 'applications';
      if (normalizedPath.includes('tenant') || normalizedPath.includes('lease')) return alert.category === 'leases';
      return true; // Dashboard sees all alerts
    });

    return {
      ...context,
      relevantAlerts,
    };
  }, [alerts]);

  // Get relevant insights for a category
  const getRelevantInsights = useCallback((category?: string): ProactiveInsight[] => {
    if (!category) return insights;

    return insights.filter(insight => {
      const categoryMap: Record<string, string[]> = {
        'payments': ['collection-rate', 'payment'],
        'properties': ['occupancy', 'vacancy', 'noi'],
        'maintenance': ['maintenance', 'expense'],
        'tenants': ['lease', 'tenant'],
      };

      const keywords = categoryMap[category] || [];
      return keywords.some(keyword =>
        insight.id.includes(keyword) ||
        insight.title.toLowerCase().includes(keyword) ||
        insight.description.toLowerCase().includes(keyword)
      );
    });
  }, [insights]);

  // Current page context
  const currentPageContext = getContextForPage(pathname);

  // Initial data fetch
  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics]);

  // Refresh alerts when metrics change
  useEffect(() => {
    if (metrics) {
      refreshAlerts();
    }
  }, [metrics, refreshAlerts]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAll();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshAll]);

  const value: StewardDataContextValue = {
    metrics,
    alerts,
    insights,
    currentPageContext,
    isLoadingMetrics,
    isLoadingAlerts,
    refreshMetrics,
    refreshAlerts,
    refreshAll,
    getContextForPage,
    getRelevantInsights,
    lastMetricsUpdate,
    lastAlertsUpdate,
  };

  return (
    <StewardDataContext.Provider value={value}>
      {children}
    </StewardDataContext.Provider>
  );
}

export function useStewardData() {
  const context = useContext(StewardDataContext);
  // Return a default empty context if provider isn't available (SSR/prerendering)
  if (!context) {
    return {
      metrics: null,
      alerts: [],
      insights: [],
      currentPageContext: null,
      isLoadingMetrics: false,
      isLoadingAlerts: false,
      refreshMetrics: async () => {},
      refreshAlerts: async () => {},
      refreshAll: async () => {},
      getContextForPage: () => ({
        pageName: 'Happy Tenant',
        pageType: 'dashboard' as const,
        relevantMetrics: [],
        relevantAlerts: [],
        suggestedQuestions: [],
        availableActions: [],
      }),
      getRelevantInsights: () => [],
      lastMetricsUpdate: null,
      lastAlertsUpdate: null,
    };
  }
  return context;
}

// ============================================================================
// Helper hook for building rich context
// ============================================================================

export function useStewardRichContext() {
  const { metrics, currentPageContext, alerts, insights } = useStewardData();

  // Build a rich context object that can be sent to the AI
  const buildRichContext = useCallback(() => {
    return {
      page: currentPageContext,
      portfolio: {
        metrics,
        summary: metrics ? {
          occupancy: `${metrics.occupancyRate}% (${metrics.occupiedUnits}/${metrics.totalUnits} units)`,
          collection: `${metrics.collectionRate}% collected`,
          noi: `$${metrics.netOperatingIncome.toLocaleString()} NOI`,
          properties: `${metrics.totalProperties} properties`,
        } : null,
      },
      alerts: alerts.slice(0, 5), // Top 5 alerts
      insights: insights.slice(0, 3), // Top 3 insights
      timestamp: new Date().toISOString(),
    };
  }, [currentPageContext, metrics, alerts, insights]);

  return {
    buildRichContext,
    currentPageContext,
    suggestedQuestions: currentPageContext?.suggestedQuestions || [],
    availableActions: currentPageContext?.availableActions || [],
  };
}
