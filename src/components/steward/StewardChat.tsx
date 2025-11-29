'use client';

/**
 * StewardChat - Chat interface for Steward AI
 * Full conversation interface with message history
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles, X, Minus, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSteward, type StewardMessage } from './StewardContext';
import { StewardAvatar } from './StewardAvatar';

interface StewardChatProps {
  className?: string;
}

export function StewardChat({ className }: StewardChatProps) {
  const {
    messages,
    isLoading,
    state,
    sendMessage,
    close,
    minimize,
    suggestions,
  } = useSteward();

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // Voice integration will be added later
  };

  return (
    <div
      className={cn(
        'flex flex-col bg-background rounded-2xl shadow-2xl border border-border overflow-hidden',
        'w-[380px] h-[600px] max-h-[80vh]',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-violet-500/10 to-blue-500/10">
        <div className="flex items-center gap-3">
          <StewardAvatar size="xs" state={state} interactive={false} showSparkles={false} />
          <div>
            <h3 className="font-semibold text-sm">Steward</h3>
            <p className="text-xs text-muted-foreground">
              {state === 'idle' ? 'Ready to help' :
                state === 'thinking' ? 'Thinking...' :
                  state === 'speaking' ? 'Speaking...' :
                    'Listening...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={minimize}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={close}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm">Steward is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <div className="px-4 py-2 border-t border-border">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <QuickAction key={index} label={suggestion} onClick={() => setInput(suggestion)} />
            ))
          ) : (
            <>
              <QuickAction label="Draft a message" onClick={() => setInput('Help me draft a message to ')} />
              <QuickAction label="Maintenance help" onClick={() => setInput("I have a maintenance issue: ")} />
              <QuickAction label="Rent reminder" onClick={() => setInput("Draft a rent reminder for ")} />
            </>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Steward anything..."
              disabled={isLoading}
              className={cn(
                'w-full px-4 py-2 pr-10 rounded-full',
                'bg-muted border border-border',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/50',
                'placeholder:text-muted-foreground',
                'disabled:opacity-50'
              )}
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={toggleListening}
              disabled={isLoading}
            >
              {isListening ? (
                <MicOff className="h-4 w-4 text-red-500" />
              ) : (
                <Mic className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-violet-500 hover:bg-violet-600 text-white rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Message bubble component
function MessageBubble({ message }: { message: StewardMessage }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2',
          isUser
            ? 'bg-violet-500 text-white rounded-br-sm'
            : 'bg-muted rounded-bl-sm'
        )}
      >
        {!isUser && (
          <div className="flex items-center gap-1 mb-1">
            <Sparkles className="h-3 w-3 text-violet-500" />
            <span className="text-xs font-medium text-violet-500">Steward</span>
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className={cn(
          'text-[10px] mt-1',
          isUser ? 'text-white/70' : 'text-muted-foreground'
        )}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

// Quick action button
function QuickAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-shrink-0 px-3 py-1 rounded-full text-xs',
        'bg-violet-500/10 text-violet-600 hover:bg-violet-500/20',
        'transition-colors'
      )}
    >
      {label}
    </button>
  );
}

// Format time helper
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}
