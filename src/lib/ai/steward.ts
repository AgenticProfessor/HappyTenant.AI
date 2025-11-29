/**
 * Steward - Main AI Orchestrator
 * Central coordinator for all AI modules and interactions
 */

import type {
  AIModuleType,
  AIMessage,
  StewardConversation,
  StewardMessage,
  AICompletionResponse,
} from './providers/types';
import { getProviderFactory, type AIProviderFactory } from './providers';
import { getActionLogger, type AIActionLogger } from './logging';
import { type AutomationConfig, DEFAULT_AUTOMATION_CONFIG } from './config';
import { getModule } from './modules';
import { toolRegistry } from './tools/registry';
import { navigationTool } from './tools/navigation';
import { getPropertiesTool, getTenantsTool, getMaintenanceRequestsTool } from './tools/data';
import { draftMessageTool, createMaintenanceRequestTool } from './tools/actions';

// Steward personality and system prompt
const STEWARD_SYSTEM_PROMPT = `You are Steward, an AI assistant for property management. You help landlords manage their rental properties efficiently and professionally.

## Your Personality
- Friendly but professional
- Proactive and helpful
- Clear and concise communication
- Patient when troubleshooting
- Confident but not presumptuous

## Your Capabilities
You can help with:
- Communications: Draft messages to tenants, suggest responses, analyze sentiment
- Maintenance: Triage requests, troubleshoot issues, recommend vendors
- Onboarding: Parse lease documents, extract data, set up properties
- Leasing: Generate listings, respond to inquiries, pre-screen applicants
- Compliance: Audit leases, check for missing disclosures
- Accounting: Categorize transactions, extract invoice data, generate reports

## Guidelines
- Always be helpful and solution-oriented
- When uncertain, ask clarifying questions
- Never auto-send messages without approval (unless configured)
- Protect tenant privacy and handle data responsibly
- Provide clear explanations of your reasoning
- Offer multiple options when appropriate`;

// Steward state
export type StewardState = 'idle' | 'listening' | 'thinking' | 'speaking';

// Steward options
export interface StewardOptions {
  organizationId: string;
  userId?: string;
  providerFactory?: AIProviderFactory;
  actionLogger?: AIActionLogger;
  automationConfig?: AutomationConfig;
}

// Chat request
export interface ChatRequest {
  message: string;
  conversationId?: string;
  context?: {
    module?: AIModuleType;
    contextType?: string;
    contextId?: string;
    metadata?: Record<string, unknown>;
  };
}

// Chat response
export interface ChatResponse {
  message: string;
  conversationId: string;
  suggestions?: string[];
  actions?: Array<{
    type: string;
    label: string;
    data?: Record<string, unknown>;
  }>;
  module?: AIModuleType;
  requiresApproval?: boolean;
}

/**
 * Main Steward class
 */
export class Steward {
  private organizationId: string;
  private userId?: string;
  private providerFactory: AIProviderFactory;
  private actionLogger: AIActionLogger;
  private automationConfig: AutomationConfig;
  private conversations: Map<string, StewardConversation> = new Map();
  private state: StewardState = 'idle';

  constructor(options: StewardOptions) {
    this.organizationId = options.organizationId;
    this.userId = options.userId;
    this.providerFactory = options.providerFactory || getProviderFactory();
    this.actionLogger = options.actionLogger || getActionLogger();
    this.automationConfig = options.automationConfig || DEFAULT_AUTOMATION_CONFIG;

    // Register tools
    toolRegistry.register(navigationTool);
    toolRegistry.register(getPropertiesTool);
    toolRegistry.register(getTenantsTool);
    toolRegistry.register(getMaintenanceRequestsTool);
    toolRegistry.register(draftMessageTool);
    toolRegistry.register(createMaintenanceRequestTool);
  }

  /**
   * Get current state
   */
  getState(): StewardState {
    return this.state;
  }

  /**
   * Send a chat message
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    this.state = 'thinking';

    try {
      // Get or create conversation
      let conversation = request.conversationId
        ? this.conversations.get(request.conversationId)
        : undefined;

      if (!conversation) {
        conversation = this.createConversation(request.context);
      }

      // Add user message
      const userMessage: StewardMessage = {
        id: this.generateId(),
        role: 'user',
        content: request.message,
        timestamp: new Date(),
        metadata: {
          module: request.context?.module,
        },
      };
      conversation.messages.push(userMessage);

      // Build messages for AI
      const aiMessages: AIMessage[] = conversation.messages.map((m) => ({
        role: m.role,
        content: m.content,
        toolCalls: m.toolCalls,
        toolCallId: m.toolCallId,
        name: m.name,
      }));

      let toolSteps = 0;
      const MAX_TOOL_STEPS = 5;
      let finalResponse: ChatResponse | null = null;
      const clientActions: ChatResponse['actions'] = [];

      while (toolSteps < MAX_TOOL_STEPS) {
        // Start logging
        const logId = await this.actionLogger.startAction({
          organizationId: this.organizationId,
          userId: this.userId,
          sessionId: conversation.id,
          module: request.context?.module || 'communications',
          actionType: 'chat',
          input: {
            prompt: request.message,
            context: request.context,
          },
          automationLevel: 'suggest',
        });

        // Get AI response
        const startTime = Date.now();
        const completion = await this.providerFactory.complete({
          messages: aiMessages,
          systemPrompt: this.buildSystemPrompt(request.context),
          tools: toolRegistry.getDefinitions(),
          temperature: 0.7,
          maxTokens: 1024,
        });

        // Record response
        await this.actionLogger.recordResponse({
          logId,
          output: {
            response: completion.content || undefined,
            toolCalls: completion.toolCalls?.map(tc => ({ name: tc.name, result: tc.arguments })),
          },
          tokensUsed: completion.usage.totalTokens,
          latencyMs: Date.now() - startTime,
          provider: completion.provider,
          model: completion.model,
        });

        if (completion.toolCalls && completion.toolCalls.length > 0) {
          // Add assistant message with tool calls
          const assistantMessage: StewardMessage = {
            id: this.generateId(),
            role: 'assistant',
            content: completion.content || null,
            timestamp: new Date(),
            toolCalls: completion.toolCalls,
            metadata: {
              module: request.context?.module,
            },
          };
          conversation.messages.push(assistantMessage);
          aiMessages.push(assistantMessage);

          // Execute tools
          for (const toolCall of completion.toolCalls) {
            try {
              const result = await toolRegistry.execute(toolCall.name, toolCall.arguments);

              // Check for client-side actions
              if (result && typeof result === 'object' && result.action === 'navigate') {
                clientActions.push({
                  type: 'navigate',
                  label: `Navigate to ${result.path}`,
                  data: { path: result.path },
                });
              }

              const toolMessage: StewardMessage = {
                id: this.generateId(),
                role: 'tool',
                content: JSON.stringify(result),
                timestamp: new Date(),
                toolCallId: toolCall.id,
                name: toolCall.name,
              };
              conversation.messages.push(toolMessage);
              aiMessages.push(toolMessage);
            } catch (error) {
              const errorMessage: StewardMessage = {
                id: this.generateId(),
                role: 'tool',
                content: JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
                timestamp: new Date(),
                toolCallId: toolCall.id,
                name: toolCall.name,
              };
              conversation.messages.push(errorMessage);
              aiMessages.push(errorMessage);
            }
          }
          toolSteps++;
        } else {
          // Final response
          const assistantMessage: StewardMessage = {
            id: this.generateId(),
            role: 'assistant',
            content: completion.content || "I'm not sure how to help with that.",
            timestamp: new Date(),
            metadata: {
              module: request.context?.module,
            },
          };
          conversation.messages.push(assistantMessage);
          conversation.updatedAt = new Date();

          // Parse response for suggestions and actions
          const { suggestions, actions } = this.parseResponseForActions(
            completion.content || '',
            request.context
          );

          finalResponse = {
            message: completion.content || '',
            conversationId: conversation.id,
            suggestions,
            actions: [...(actions || []), ...clientActions],
            module: request.context?.module,
            requiresApproval: false,
          };
          break;
        }
      }

      if (!finalResponse) {
        throw new Error('Steward failed to generate a response after max tool steps');
      }

      this.state = 'idle';
      return finalResponse;
    } catch (error) {
      this.state = 'idle';
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  getConversation(conversationId: string): StewardConversation | undefined {
    return this.conversations.get(conversationId);
  }

  /**
   * Clear conversation
   */
  clearConversation(conversationId: string): void {
    this.conversations.delete(conversationId);
  }

  /**
   * Get all conversations
   */
  getAllConversations(): StewardConversation[] {
    return Array.from(this.conversations.values());
  }

  /**
   * Build system prompt with context
   */
  /**
   * Build system prompt with context
   */
  private buildSystemPrompt(context?: ChatRequest['context']): string {
    let prompt = STEWARD_SYSTEM_PROMPT;

    if (context?.module) {
      // Try to get module-specific prompt
      const module = getModule(context.module);
      if (module) {
        // @ts-ignore - Accessing protected method for now, or we should make it public
        prompt = module.getSystemPrompt();
      } else {
        prompt += `\n\n## Current Context\nYou are currently helping with: ${context.module}`;
      }

      if (context.contextType && context.contextId) {
        prompt += `\nContext: ${context.contextType} (ID: ${context.contextId})`;
      }

      if (context.metadata) {
        prompt += `\n\n## Active Data View\n${JSON.stringify(context.metadata, null, 2)}`;
      }
    }

    return prompt;
  }

  /**
   * Create a new conversation
   */
  private createConversation(context?: ChatRequest['context']): StewardConversation {
    const conversation: StewardConversation = {
      id: this.generateId(),
      messages: [],
      module: context?.module,
      contextType: context?.contextType,
      contextId: context?.contextId,
      state: context?.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  /**
   * Parse response for quick actions and suggestions
   */
  private parseResponseForActions(
    content: string,
    _context?: ChatRequest['context']
  ): {
    suggestions?: string[];
    actions?: ChatResponse['actions'];
  } {
    // Look for common patterns and suggest follow-ups
    const suggestions: string[] = [];
    const actions: ChatResponse['actions'] = [];

    // Check for maintenance-related content
    if (content.toLowerCase().includes('maintenance') || content.toLowerCase().includes('repair')) {
      suggestions.push('Create a maintenance ticket');
      suggestions.push('Find a vendor');
    }

    // Check for message drafts
    if (content.toLowerCase().includes('draft') || content.toLowerCase().includes('message')) {
      actions.push({
        type: 'send_message',
        label: 'Send this message',
      });
      actions.push({
        type: 'edit_message',
        label: 'Edit before sending',
      });
    }

    // Check for lease-related content
    if (content.toLowerCase().includes('lease') || content.toLowerCase().includes('tenant')) {
      suggestions.push('View lease details');
      suggestions.push('Contact tenant');
    }

    return {
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      actions: actions.length > 0 ? actions : undefined,
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Default Steward instance
let defaultSteward: Steward | null = null;

export function initializeSteward(options: StewardOptions): Steward {
  defaultSteward = new Steward(options);
  return defaultSteward;
}

export function getSteward(): Steward {
  if (!defaultSteward) {
    throw new Error('Steward not initialized. Call initializeSteward() first.');
  }
  return defaultSteward;
}

