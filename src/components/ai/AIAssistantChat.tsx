'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Sparkles,
  User,
  Loader2,
  Lightbulb,
  FileText,
  DollarSign,
  Wrench,
  MessageSquare,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const quickActions = [
  { icon: DollarSign, label: 'Rent collection tips', prompt: 'How can I improve my rent collection rate?' },
  { icon: FileText, label: 'Lease questions', prompt: 'What should I include in a lease agreement?' },
  { icon: Wrench, label: 'Maintenance help', prompt: 'How do I prioritize maintenance requests?' },
  { icon: MessageSquare, label: 'Tenant communication', prompt: 'Draft a late rent reminder message' },
];

const simulatedResponses: Record<string, string> = {
  default: "I'd be happy to help! As your AI property management assistant, I can help with tenant screening, rent collection, lease management, maintenance coordination, and more. What would you like to know?",
  rent: "Here are some proven strategies to improve rent collection:\n\n1. **Set up AutoPay** - Encourage tenants to enroll in automatic payments. Offer a small discount as an incentive.\n\n2. **Send timely reminders** - I can automatically send payment reminders 5 days before, on the due date, and after missed payments.\n\n3. **Multiple payment options** - Accept credit cards, bank transfers, and mobile payments to make it easy.\n\n4. **Clear late fee policy** - Ensure your lease has clear late fee terms and enforce them consistently.\n\nWould you like me to draft a rent reminder message for your tenants?",
  lease: "A comprehensive lease agreement should include:\n\n**Essential Terms:**\n- Names of all tenants and landlord\n- Property address and description\n- Lease term (start/end dates)\n- Rent amount and due date\n- Security deposit amount and terms\n\n**Important Clauses:**\n- Pet policy\n- Maintenance responsibilities\n- Guest and subletting rules\n- Entry notice requirements\n- Termination procedures\n\nI can help you review your current lease or suggest improvements. Would you like me to analyze a specific clause?",
  maintenance: "Here's how I recommend prioritizing maintenance requests:\n\n**Urgent (24-48 hours):**\n- No heat in winter\n- Water leaks/flooding\n- Gas leaks or electrical hazards\n- Broken locks or security issues\n\n**High Priority (3-5 days):**\n- HVAC issues (non-emergency)\n- Appliance failures\n- Plumbing backups\n\n**Normal (1-2 weeks):**\n- Minor repairs\n- Cosmetic issues\n- Non-essential improvements\n\nI automatically triage incoming requests based on these criteria. Would you like me to review your current open requests?",
  draft: "Here's a professional late rent reminder:\n\n---\n\n**Subject: Friendly Rent Reminder - Payment Due**\n\nDear [Tenant Name],\n\nI hope this message finds you well. This is a friendly reminder that your rent payment of $[amount] for [month] is now due.\n\nIf you've already submitted payment, please disregard this message. If you're experiencing any difficulties, please don't hesitate to reach out so we can discuss options.\n\n**Payment Options:**\n- Online portal: [link]\n- Bank transfer\n- Check\n\nThank you for your prompt attention to this matter.\n\nBest regards,\n[Your Name]\n\n---\n\nWould you like me to customize this message for a specific tenant?",
};

export function AIAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI property management assistant. I can help you with tenant screening, rent collection, lease management, maintenance requests, and more. What can I help you with today?",
      timestamp: new Date(),
      suggestions: ['How can I improve rent collection?', 'Help me screen a tenant', 'Draft a lease renewal notice'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getSimulatedResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('rent') && (lowerMessage.includes('collection') || lowerMessage.includes('improve'))) {
      return simulatedResponses.rent;
    }
    if (lowerMessage.includes('lease') || lowerMessage.includes('agreement')) {
      return simulatedResponses.lease;
    }
    if (lowerMessage.includes('maintenance') || lowerMessage.includes('prioritize')) {
      return simulatedResponses.maintenance;
    }
    if (lowerMessage.includes('draft') || lowerMessage.includes('reminder') || lowerMessage.includes('message')) {
      return simulatedResponses.draft;
    }
    return simulatedResponses.default;
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: getSimulatedResponse(text),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                {message.suggestions && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {message.suggestions.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        variant="secondary"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => handleSend(suggestion)}
                      >
                        <Lightbulb className="h-3 w-3 mr-1" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick actions */}
      <div className="px-4 py-2 border-t bg-muted/30">
        <div className="flex gap-2 overflow-x-auto pb-2 max-w-3xl mx-auto">
          {quickActions.map((action, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              className="flex-shrink-0 text-xs"
              onClick={() => handleSend(action.prompt)}
            >
              <action.icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="p-4 border-t">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Input
            placeholder="Ask me anything about property management..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2 max-w-3xl mx-auto">
          AI responses are simulated for demo purposes
        </p>
      </div>
    </div>
  );
}
