/**
 * Steward Chat API Route
 * Handles chat messages for the Steward AI assistant
 */

import { NextRequest, NextResponse } from 'next/server';
import { Steward } from '@/lib/ai/steward';

// In-memory session storage (replace with Redis/DB in production)
const sessions = new Map<string, { messages: Array<{ role: 'user' | 'assistant'; content: string }> }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationId } = body;

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

    // Get response from Steward
    const response = await steward.chat({
      message,
      conversationId: sessionId,
      context: {
        module: 'communications',
        metadata: {
          conversationHistory: session.messages.slice(0, -1), // Exclude the message we just added
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
