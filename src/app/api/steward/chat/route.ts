/**
 * Steward Chat API Route
 * Handles chat messages for the Steward AI assistant
 *
 * Enhanced with root-level context awareness for intelligent responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { Steward } from '@/lib/ai/steward';

// In-memory session storage (replace with Redis/DB in production)
const sessions = new Map<string, { messages: Array<{ role: 'user' | 'assistant'; content: string }> }>();

// Type for rich context from client
interface RichContext {
  module?: string;
  contextType?: string;
  contextId?: string;
  entityType?: string;
  pageData?: Record<string, unknown>;
  pageSummary?: string;
  portfolio?: {
    totalProperties?: number;
    totalUnits?: number;
    occupancyRate?: number;
    collectionRate?: number;
    pendingMaintenance?: number;
    overduePayments?: number;
    activeApplications?: number;
    unreadMessages?: number;
    netOperatingIncome?: number;
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
  currentPath?: string;
  relatedEntities?: Array<{ type: string; id: string; name: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationId, context, isGreeting } = body as {
      message: string;
      conversationId?: string;
      context?: RichContext;
      isGreeting?: boolean;
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get or create session
    const sessionId = conversationId || `session-${Date.now()}`;
    let session = sessions.get(sessionId);

    if (!session) {
      session = { messages: [] };
      sessions.set(sessionId, session);
    }

    // Add user message to history
    session.messages.push({ role: 'user', content: message });

    // Initialize Steward
    const steward = new Steward({
      // In production, these would come from user's org settings
      organizationId: 'demo-org',
      userId: 'demo-user',
    });

    // Determine the module from context path or fallback
    const moduleFromPath = context?.currentPath?.split('/')[2] || 'dashboard';
    const moduleMap: Record<string, string> = {
      'properties': 'onboarding',
      'tenants': 'leasing',
      'payments': 'accounting',
      'maintenance': 'maintenance',
      'applications': 'leasing',
      'messages': 'communications',
      'reports': 'accounting',
      'insights': 'accounting',
      'intelligence': 'communications',
    };
    const module = moduleMap[moduleFromPath] || 'communications';

    // Get response from Steward with rich context
    const response = await steward.chat({
      message,
      conversationId: sessionId,
      context: {
        module: module as any,
        contextType: context?.contextType,
        contextId: context?.contextId,
        metadata: {
          conversationHistory: session.messages.slice(0, -1),
          isGreeting,
          // Portfolio-wide context
          portfolio: context?.portfolio,
          alerts: context?.alerts,
          insights: context?.insights,
          // Page-specific context
          entityType: context?.entityType,
          pageData: context?.pageData,
          pageSummary: context?.pageSummary,
          currentPath: context?.currentPath,
          relatedEntities: context?.relatedEntities,
        },
      },
    });

    // Add assistant response to history
    session.messages.push({ role: 'assistant', content: response.message });

    // Clean up old sessions (keep last 100)
    if (sessions.size > 100) {
      const oldestKey = sessions.keys().next().value;
      if (oldestKey) {
        sessions.delete(oldestKey);
      }
    }

    return NextResponse.json({
      message: response.message,
      sessionId,
      suggestions: response.suggestions,
      actions: response.actions,
    });
  } catch (error) {
    console.error('Steward chat error:', error);

    // Check if it's a configuration error
    if (error instanceof Error && error.message.includes('No AI provider')) {
      return NextResponse.json(
        {
          error: 'AI service not configured',
          message: "I apologize, but I'm not fully configured yet. Please ensure your AI provider API keys are set up in the environment variables (OPENAI_API_KEY or ANTHROPIC_API_KEY)."
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to process message',
        message: "I'm sorry, I encountered an error processing your request. Please try again."
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'steward-chat',
    timestamp: new Date().toISOString(),
  });
}
