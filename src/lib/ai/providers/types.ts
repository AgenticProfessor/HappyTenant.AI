/**
 * AI Provider Types
 * Shared interfaces for AI provider abstraction layer
 */

// Provider identification
export type AIProviderType = 'openai' | 'anthropic';

// Message roles
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

// AI Message structure
export interface AIMessage {
  role: MessageRole;
  content: string | null;
  name?: string;
  toolCalls?: AIToolCall[];
  toolCallId?: string;
}

// Tool/Function definition for AI
export interface AIToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
      enum?: string[];
      items?: { type: string };
    }>;
    required?: string[];
  };
}

// Tool call from AI response
export interface AIToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

// Completion request
export interface AICompletionRequest {
  messages: AIMessage[];
  tools?: AIToolDefinition[];
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  systemPrompt?: string;
}

// Completion response
export interface AICompletionResponse {
  content: string;
  toolCalls?: AIToolCall[];
  finishReason: 'stop' | 'tool_calls' | 'length' | 'content_filter';
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: AIProviderType;
}

// Streaming chunk
export interface AIStreamChunk {
  content?: string;
  toolCalls?: Partial<AIToolCall>[];
  done: boolean;
}

// Provider configuration
export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  defaultMaxTokens?: number;
  defaultTemperature?: number;
  timeout?: number;
}

// Provider interface
export interface AIProvider {
  readonly providerType: AIProviderType;

  /**
   * Generate a completion
   */
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;

  /**
   * Stream a completion
   */
  streamComplete(request: AICompletionRequest): AsyncGenerator<AIStreamChunk, void, unknown>;

  /**
   * Generate text embeddings
   */
  embedText(text: string): Promise<number[]>;

  /**
   * Check if provider is available/configured
   */
  isAvailable(): boolean;
}

// Provider factory options
export interface ProviderFactoryOptions {
  primaryProvider: AIProviderType;
  fallbackProvider?: AIProviderType;
  openaiConfig?: AIProviderConfig;
  anthropicConfig?: AIProviderConfig;
}

// Steward-specific types
export interface StewardMessage extends AIMessage {
  id: string;
  timestamp: Date;
  metadata?: {
    module?: string;
    actionType?: string;
    confidence?: number;
  };
}

export interface StewardConversation {
  id: string;
  messages: StewardMessage[];
  module?: string;
  contextType?: string;
  contextId?: string;
  state?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Module types
export type AIModuleType =
  | 'communications'
  | 'maintenance'
  | 'onboarding'
  | 'leasing'
  | 'compliance'
  | 'accounting';

// Automation levels
export type AutomationLevel =
  | 'manual'          // AI suggests, human must initiate
  | 'suggest'         // AI drafts, human must approve
  | 'auto_with_review' // AI acts, human can review/undo
  | 'fully_auto';     // AI acts autonomously

// Human decision on AI action
export type HumanDecision =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'modified'
  | 'auto_executed';

// AI Action log entry
export interface AIActionLogEntry {
  id: string;
  organizationId: string;
  userId?: string;
  sessionId: string;
  module: AIModuleType;
  actionType: string;
  input: {
    prompt?: string;
    context?: Record<string, unknown>;
    files?: string[];
  };
  output: {
    response?: string;
    toolCalls?: Array<{ name: string; result: unknown }>;
    generatedContent?: string;
  };
  humanDecision: HumanDecision;
  modifiedContent?: string;
  decidedByUserId?: string;
  decidedAt?: Date;
  automationLevel: AutomationLevel;
  tokensUsed: number;
  latencyMs: number;
  provider: AIProviderType;
  model: string;
  createdAt: Date;
}
