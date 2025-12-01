'use client';

/**
 * StewardContext - State management for Steward AI
 * Provides global access to Steward state and actions
 *
 * Enhanced with root-level data awareness for intelligent context
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { StewardOrbState } from './StewardOrb';
import { useStewardData, useStewardRichContext } from './StewardDataProvider';

// Message types
export interface StewardMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    contextSnapshot?: unknown;
    toolsUsed?: string[];
  };
}

// Context data shape - Enhanced with richer data
export interface StewardContextData {
  type: 'page' | 'selection' | 'object' | 'list' | 'detail';
  name: string;
  data?: Record<string, unknown>;
  description?: string;
  id?: string;
  url?: string;
  // New fields for richer context
  entityType?: string; // e.g., 'property', 'tenant', 'payment'
  entityId?: string;
  listFilters?: Record<string, string>;
  summary?: string;
  relatedEntities?: Array<{ type: string; id: string; name: string }>;
}

// Root data context - portfolio-wide data
export interface RootDataContext {
  portfolio?: {
    totalProperties: number;
    totalUnits: number;
    occupancyRate: number;
    collectionRate: number;
    pendingMaintenance: number;
    overduePayments: number;
    activeApplications: number;
    unreadMessages: number;
    netOperatingIncome: number;
  };
  alerts?: Array<{
    type: string;
    title: string;
    description: string;
    priority: number;
  }>;
  insights?: Array<{
    type: string;
    title: string;
    description: string;
    impact: string;
  }>;
}

// Context shape
interface StewardContextValue {
  // State
  isOpen: boolean;
  isMinimized: boolean;
  state: StewardOrbState;
  audioLevel: number;
  messages: StewardMessage[];
  isLoading: boolean;
  error: string | null;
  activeContext: StewardContextData | null;
  rootData: RootDataContext | null;
  suggestions: string[];
  actions: any[];

  // Actions
  open: () => void;
  close: () => void;
  toggle: () => void;
  minimize: () => void;
  maximize: () => void;
  setState: (state: StewardOrbState) => void;
  setAudioLevel: (level: number) => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
  registerContext: (context: StewardContextData) => void;
  unregisterContext: () => void;
  setRootData: (data: RootDataContext) => void;

  // New: Get full context for AI
  getFullContext: () => {
    page: StewardContextData | null;
    root: RootDataContext | null;
    path: string;
  };
}

const StewardContext = createContext<StewardContextValue | null>(null);

interface StewardProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
}

export function StewardProvider({ children, defaultOpen = false }: StewardProviderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [state, setState] = useState<StewardOrbState>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [messages, setMessages] = useState<StewardMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeContext, setActiveContext] = useState<StewardContextData | null>(null);
  const [rootData, setRootData] = useState<RootDataContext | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  // Connect to root-level data provider
  const { metrics, alerts, insights, currentPageContext } = useStewardData();
  const { suggestedQuestions } = useStewardRichContext();

  // Sync root data from StewardDataProvider
  useEffect(() => {
    if (metrics) {
      setRootData({
        portfolio: {
          totalProperties: metrics.totalProperties,
          totalUnits: metrics.totalUnits,
          occupancyRate: metrics.occupancyRate,
          collectionRate: metrics.collectionRate,
          pendingMaintenance: metrics.pendingMaintenance,
          overduePayments: metrics.overduePayments,
          activeApplications: metrics.activeApplications,
          unreadMessages: metrics.unreadMessages,
          netOperatingIncome: metrics.netOperatingIncome,
        },
        alerts: alerts.map(alert => ({
          type: alert.type,
          title: alert.title,
          description: alert.description,
          priority: alert.priority,
        })),
        insights: insights.map(insight => ({
          type: insight.type,
          title: insight.title,
          description: insight.description,
          impact: insight.impact,
        })),
      });
    }
  }, [metrics, alerts, insights]);

  // Update suggestions based on current page context
  useEffect(() => {
    if (suggestedQuestions.length > 0 && messages.length === 0) {
      setSuggestions(suggestedQuestions.slice(0, 4));
    }
  }, [suggestedQuestions, messages.length]);

  // Open the widget
  const open = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  // Close the widget
  const close = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  // Toggle open/closed
  const toggle = useCallback(() => {
    if (isOpen && !isMinimized) {
      setIsMinimized(true);
    } else if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  }, [isOpen, isMinimized]);

  // Minimize to just the orb
  const minimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  // Maximize to full chat
  const maximize = useCallback(() => {
    setIsMinimized(false);
  }, []);

  // Get full context for AI
  const getFullContext = useCallback(() => {
    return {
      page: activeContext,
      root: rootData,
      path: pathname,
    };
  }, [activeContext, rootData, pathname]);

  // Send a message to Steward
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Capture current context snapshot
    const contextSnapshot = getFullContext();

    // Add user message
    const userMessage: StewardMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content,
      timestamp: new Date(),
      metadata: { contextSnapshot },
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    setState('thinking');

    try {
      // Build rich context for the AI
      const richContext = {
        // Page-level context
        module: activeContext?.name,
        contextType: activeContext?.type,
        contextId: activeContext?.entityId || activeContext?.id || activeContext?.name,
        entityType: activeContext?.entityType,
        pageData: activeContext?.data,
        pageSummary: activeContext?.summary,
        // Portfolio-wide context
        portfolio: rootData?.portfolio,
        alerts: rootData?.alerts?.slice(0, 3), // Top 3 alerts
        insights: rootData?.insights?.slice(0, 3), // Top 3 insights
        // Navigation context
        currentPath: pathname,
        relatedEntities: activeContext?.relatedEntities,
      };

      // Call the Steward API with rich context
      const response = await fetch('/api/steward/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationId: messages.length > 0 ? messages[0].id : undefined,
          context: richContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Steward');
      }

      const data = await response.json();

      // Update suggestions and actions
      setSuggestions(data.suggestions || []);
      setActions(data.actions || []);

      // Handle auto-actions
      if (data.actions) {
        data.actions.forEach((action: any) => {
          if (action.type === 'navigate' && action.data?.path) {
            router.push(action.data.path);
          }
        });
      }

      // Add assistant message
      const assistantMessage: StewardMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setState('speaking');

      // Return to idle after a short delay
      setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      console.error('Steward error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setState('idle');

      // Add error message
      const errorMessage: StewardMessage = {
        id: `${Date.now()}-error`,
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, activeContext, rootData, pathname, getFullContext]);

  // Register context
  const registerContext = useCallback((context: StewardContextData) => {
    setActiveContext(context);
    // Optional: Visual cue that context was registered
    console.log('Steward context registered:', context);
  }, []);

  // Unregister context
  const unregisterContext = useCallback(() => {
    setActiveContext(null);
  }, []);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Welcome message on first open - with rich context awareness
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const fetchGreeting = async () => {
        setIsLoading(true);
        try {
          // Build rich context for greeting
          const richContext = {
            module: activeContext?.name,
            contextType: activeContext?.type,
            contextId: activeContext?.entityId || activeContext?.id || activeContext?.name,
            entityType: activeContext?.entityType,
            pageData: activeContext?.data,
            pageSummary: activeContext?.summary,
            portfolio: rootData?.portfolio,
            alerts: rootData?.alerts?.slice(0, 3),
            insights: rootData?.insights?.slice(0, 2),
            currentPath: pathname,
          };

          const response = await fetch('/api/steward/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: "Generate a brief, contextual greeting. Acknowledge where the user is in the app and highlight 1-2 relevant insights or alerts if any exist. Be helpful and proactive.",
              conversationId: undefined,
              context: richContext,
              isGreeting: true,
            }),
          });

          if (!response.ok) throw new Error('Failed to fetch greeting');

          const data = await response.json();

          setSuggestions(data.suggestions || []);
          setActions(data.actions || []);

          const welcomeMessage: StewardMessage = {
            id: 'welcome',
            role: 'assistant',
            content: data.message,
            timestamp: new Date(),
          };
          setMessages([welcomeMessage]);
        } catch (err) {
          console.error('Greeting error:', err);
          // Generate a smart fallback based on available context
          let fallbackContent = "Hi! I'm Steward, your AI property management partner.";

          if (rootData?.portfolio) {
            const p = rootData.portfolio;
            if (p.overduePayments > 0) {
              fallbackContent += ` I notice you have ${p.overduePayments} overdue payment(s) to follow up on.`;
            } else if (p.pendingMaintenance > 0) {
              fallbackContent += ` There are ${p.pendingMaintenance} maintenance requests awaiting attention.`;
            } else {
              fallbackContent += ` Your portfolio looks healthy with ${p.occupancyRate}% occupancy!`;
            }
          }

          fallbackContent += " How can I help you today?";

          const fallbackMessage: StewardMessage = {
            id: 'welcome',
            role: 'assistant',
            content: fallbackContent,
            timestamp: new Date(),
          };
          setMessages([fallbackMessage]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchGreeting();
    }
  }, [isOpen, messages.length, activeContext, rootData, pathname]);

  const value: StewardContextValue = {
    isOpen,
    isMinimized,
    state,
    audioLevel,
    messages,
    isLoading,
    error,
    open,
    close,
    toggle,
    minimize,
    maximize,
    setState,
    setAudioLevel,
    sendMessage,
    clearMessages,
    clearError,
    activeContext,
    rootData,
    suggestions,
    actions,
    registerContext,
    unregisterContext,
    setRootData,
    getFullContext,
  };

  return (
    <StewardContext.Provider value={value}>
      {children}
    </StewardContext.Provider>
  );
}

export function useSteward() {
  const context = useContext(StewardContext);
  if (!context) {
    throw new Error('useSteward must be used within a StewardProvider');
  }
  return context;
}
