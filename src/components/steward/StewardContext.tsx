'use client';

/**
 * StewardContext - State management for Steward AI
 * Provides global access to Steward state and actions
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { StewardOrbState } from './StewardOrb';

// Message types
export interface StewardMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Context data shape
export interface StewardContextData {
  type: 'page' | 'selection' | 'object';
  name: string;
  data?: Record<string, unknown>;
  description?: string;
  id?: string;
  url?: string;
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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const router = useRouter();

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

  // Send a message to Steward
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: StewardMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    setState('thinking');

    try {
      // Call the Steward API
      const response = await fetch('/api/steward/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationId: messages.length > 0 ? messages[0].id : undefined,
          context: activeContext ? {
            module: activeContext.name, // Map context name to module if applicable
            contextType: activeContext.type,
            contextId: activeContext.name,
            metadata: activeContext.data,
          } : undefined,
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
  }, [messages, activeContext]);

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

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const fetchGreeting = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/steward/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: "Generate a brief, friendly greeting based on the current context. Mention what you see on the screen.",
              conversationId: undefined,
              context: activeContext ? {
                module: activeContext.name,
                contextType: activeContext.type,
                contextId: activeContext.name,
                metadata: activeContext.data,
              } : undefined,
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
          const fallbackMessage: StewardMessage = {
            id: 'welcome',
            role: 'assistant',
            content: "Hi! I'm Steward, your AI property management partner. How can I help you today?",
            timestamp: new Date(),
          };
          setMessages([fallbackMessage]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchGreeting();
    }
  }, [isOpen, messages.length, activeContext]);

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
    suggestions,
    actions,
    registerContext,
    unregisterContext,
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
