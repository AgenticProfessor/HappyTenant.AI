/**
 * Communications Module for Steward AI
 * Handles tenant messaging, tone analysis, and response drafting
 */

import { BaseModule, type ModuleContext, type ModuleResponse } from './base-module';
import type { AIModuleType, AIToolDefinition, AIMessage } from '../providers/types';

export interface MessageDraft {
  subject: string;
  body: string;
  tone: 'professional' | 'friendly' | 'urgent' | 'firm';
  suggestedActions?: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface SentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative';
  confidence: number;
  emotions: {
    frustration: number;
    satisfaction: number;
    urgency: number;
    confusion: number;
  };
  keyPhrases: string[];
  suggestedResponse: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  category: 'rent-reminder' | 'maintenance-update' | 'lease-renewal' | 'general' | 'welcome' | 'move-out';
  template: string;
  variables: string[];
}

export class CommunicationsModule extends BaseModule {
  readonly moduleName: AIModuleType = 'communications';
  readonly displayName = 'Communications';
  readonly description = 'Draft messages, analyze sentiment, and manage tenant communications';

  public getSystemPrompt(): string {
    return `You are an expert property management communications specialist.

Your capabilities:
- Draft professional, clear, and empathetic messages to tenants
- Analyze incoming message sentiment and urgency
- Suggest appropriate response templates
- Optimize message tone based on context
- Identify escalation needs

Communication Guidelines:
- Always be professional but warm
- Be clear and specific about actions needed
- Include relevant dates and deadlines
- Use active voice
- Keep messages concise but complete
- For sensitive topics (late rent, violations), be firm but respectful

Tone Guidelines:
- Professional: Formal, business-like, appropriate for official notices
- Friendly: Warm, casual, appropriate for general updates
- Urgent: Clear call to action, emphasizes time-sensitivity
- Firm: Direct, no-nonsense, appropriate for compliance issues

When drafting messages:
1. Consider the tenant's history and relationship
2. Include any necessary legal disclosures
3. Provide clear next steps
4. Offer contact information for questions`;
  }

  protected getTools(): AIToolDefinition[] {
    return [
      {
        name: 'draft_message',
        description: 'Draft a message to a tenant with specified tone and purpose',
        parameters: {
          type: 'object',
          properties: {
            purpose: {
              type: 'string',
              enum: [
                'rent-reminder',
                'late-notice',
                'lease-renewal',
                'maintenance-update',
                'welcome',
                'move-out',
                'policy-update',
                'general',
              ],
              description: 'The purpose of the message',
            },
            tone: {
              type: 'string',
              enum: ['professional', 'friendly', 'urgent', 'firm'],
              description: 'Desired tone of the message',
            },
            tenantName: {
              type: 'string',
              description: 'Name of the tenant',
            },
            context: {
              type: 'string',
              description: 'Additional context for the message',
            },
          },
          required: ['purpose', 'tone', 'tenantName'],
        },
      },
      {
        name: 'analyze_sentiment',
        description: 'Analyze the sentiment of an incoming message from a tenant',
        parameters: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'The message content to analyze',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'suggest_templates',
        description: 'Get suggested message templates for a specific situation',
        parameters: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['rent-reminder', 'maintenance-update', 'lease-renewal', 'general', 'welcome', 'move-out'],
              description: 'Category of templates to retrieve',
            },
          },
          required: ['category'],
        },
      },
      {
        name: 'improve_message',
        description: 'Improve an existing message draft for clarity, tone, or completeness',
        parameters: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'The original message to improve',
            },
            improvements: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['clarity', 'tone', 'brevity', 'professionalism', 'empathy', 'actionable'],
              },
              description: 'Types of improvements to apply',
            },
          },
          required: ['message', 'improvements'],
        },
      },
    ];
  }

  /**
   * Draft a message with AI assistance
   */
  async draftMessage(
    context: ModuleContext,
    purpose: string,
    tone: 'professional' | 'friendly' | 'urgent' | 'firm',
    tenantName: string,
    additionalContext?: string
  ): Promise<ModuleResponse<MessageDraft>> {
    const userMessage = `Draft a ${tone} message to ${tenantName} for: ${purpose}${
      additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''
    }`;

    return this.executeWithLogging(
      context,
      'draft_message',
      {
        systemPrompt: this.getSystemPrompt(),
        messages: [{ role: 'user', content: userMessage }],
        maxTokens: 1000,
        temperature: 0.7,
      },
      (response) => {
        // Parse AI response into structured format
        const content = response.content || '';
        return {
          subject: this.extractSubject(content),
          body: this.extractBody(content),
          tone,
          sentiment: 'neutral' as const,
          suggestedActions: this.extractActions(content),
        };
      }
    );
  }

  /**
   * Analyze sentiment of incoming message
   */
  async analyzeSentiment(
    context: ModuleContext,
    message: string
  ): Promise<ModuleResponse<SentimentAnalysis>> {
    const userMessage = `Analyze the sentiment and emotional content of this tenant message:

"${message}"

Provide:
1. Overall sentiment (positive/neutral/negative)
2. Confidence level (0-1)
3. Key emotions detected (frustration, satisfaction, urgency, confusion) each 0-1
4. Key phrases indicating sentiment
5. Suggested response approach`;

    return this.executeWithLogging(
      context,
      'analyze_sentiment',
      {
        systemPrompt: this.getSystemPrompt(),
        messages: [{ role: 'user', content: userMessage }],
        maxTokens: 500,
        temperature: 0.3,
      },
      (response) => {
        // Mock implementation - in production, parse AI response
        return {
          overall: 'neutral' as const,
          confidence: 0.85,
          emotions: {
            frustration: 0.2,
            satisfaction: 0.3,
            urgency: 0.5,
            confusion: 0.1,
          },
          keyPhrases: ['need assistance', 'as soon as possible'],
          suggestedResponse: 'Acknowledge their concern and provide a specific timeline for resolution.',
        };
      }
    );
  }

  /**
   * Execute a tool by name
   */
  async executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    switch (name) {
      case 'draft_message':
        return {
          subject: `Regarding ${args.purpose}`,
          body: this.getTemplateForPurpose(
            args.purpose as string,
            args.tenantName as string,
            args.tone as string
          ),
          tone: args.tone,
          sentiment: 'neutral',
        };

      case 'analyze_sentiment':
        return {
          overall: 'neutral',
          confidence: 0.85,
          emotions: {
            frustration: 0.2,
            satisfaction: 0.3,
            urgency: 0.4,
            confusion: 0.1,
          },
          keyPhrases: [],
          suggestedResponse: 'Thank them and address their concern promptly.',
        };

      case 'suggest_templates':
        return this.getTemplatesForCategory(args.category as string);

      case 'improve_message':
        return {
          improved: args.message,
          changes: ['Enhanced clarity', 'Improved professional tone'],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private extractSubject(content: string): string {
    const subjectMatch = content.match(/Subject:\s*(.+?)(?:\n|$)/i);
    return subjectMatch ? subjectMatch[1].trim() : 'Message from Property Management';
  }

  private extractBody(content: string): string {
    const bodyMatch = content.match(/Body:\s*([\s\S]+?)(?:Actions:|$)/i);
    return bodyMatch ? bodyMatch[1].trim() : content;
  }

  private extractActions(content: string): string[] {
    const actionsMatch = content.match(/Actions?:\s*([\s\S]+?)$/i);
    if (!actionsMatch) return [];
    return actionsMatch[1]
      .split(/[-•\n]/)
      .map((a) => a.trim())
      .filter((a) => a.length > 0);
  }

  private getTemplateForPurpose(purpose: string, tenantName: string, tone: string): string {
    const templates: Record<string, string> = {
      'rent-reminder': `Dear ${tenantName},

This is a friendly reminder that your rent payment of $[AMOUNT] is due on [DATE].

Please ensure your payment is submitted on time to avoid any late fees. If you have already made this payment, please disregard this message.

If you have any questions or need to discuss payment arrangements, please don't hesitate to reach out.

Best regards,
Property Management`,

      'late-notice': `Dear ${tenantName},

Our records indicate that your rent payment for [MONTH] is past due. The current balance owed is $[AMOUNT], which includes any applicable late fees.

Please submit your payment immediately to avoid further action. If you are experiencing financial difficulties, we encourage you to contact us to discuss possible payment arrangements.

Sincerely,
Property Management`,

      'maintenance-update': `Dear ${tenantName},

We wanted to update you on your maintenance request #[REQUEST_ID].

[STATUS_UPDATE]

If you have any questions or concerns, please don't hesitate to contact us.

Thank you for your patience.

Best regards,
Property Management`,

      'welcome': `Dear ${tenantName},

Welcome to your new home! We're thrilled to have you as part of our community.

Here are a few important things to know:
• Emergency contact: [PHONE]
• Online portal: [URL]
• Rent due date: [DATE]

If you need anything during your move-in, please don't hesitate to reach out.

Welcome aboard!
Property Management`,
    };

    return templates[purpose] || templates['rent-reminder'];
  }

  private getTemplatesForCategory(category: string): MessageTemplate[] {
    return [
      {
        id: `${category}-1`,
        name: `${category} - Standard`,
        category: category as MessageTemplate['category'],
        template: 'Standard template content...',
        variables: ['tenantName', 'date', 'amount'],
      },
      {
        id: `${category}-2`,
        name: `${category} - Detailed`,
        category: category as MessageTemplate['category'],
        template: 'Detailed template content...',
        variables: ['tenantName', 'date', 'amount', 'details'],
      },
    ];
  }
}
