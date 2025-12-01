/**
 * Anthropic Provider Implementation
 * Handles all interactions with Anthropic Claude API
 */

import type {
  AIProvider,
  AIProviderConfig,
  AICompletionRequest,
  AICompletionResponse,
  AIStreamChunk,
  AIMessage,
  AIToolDefinition,
} from './types';

// Default configuration
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_TIMEOUT = 30000;

// Anthropic API types
interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'tool_use' | 'tool_result';
    text?: string;
    id?: string;
    name?: string;
    input?: Record<string, unknown>;
    tool_use_id?: string;
    content?: string;
  }>;
}

interface AnthropicTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

interface AnthropicCompletionResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: 'text' | 'tool_use';
    text?: string;
    id?: string;
    name?: string;
    input?: Record<string, unknown>;
  }>;
  model: string;
  stop_reason: 'end_turn' | 'tool_use' | 'max_tokens' | 'stop_sequence';
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface AnthropicStreamEvent {
  type: string;
  index?: number;
  delta?: {
    type: string;
    text?: string;
    partial_json?: string;
  };
  content_block?: {
    type: string;
    id?: string;
    name?: string;
    text?: string;
  };
  message?: AnthropicCompletionResponse;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AnthropicProvider implements AIProvider {
  readonly providerType = 'anthropic' as const;

  private apiKey: string;
  private model: string;
  private baseUrl: string;
  private defaultMaxTokens: number;
  private defaultTemperature: number;
  private timeout: number;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || DEFAULT_MODEL;
    this.baseUrl = config.baseUrl || 'https://api.anthropic.com/v1';
    this.defaultMaxTokens = config.defaultMaxTokens || DEFAULT_MAX_TOKENS;
    this.defaultTemperature = config.defaultTemperature || DEFAULT_TEMPERATURE;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const startTime = Date.now();

    const { messages, systemPrompt } = this.formatMessages(
      request.messages,
      request.systemPrompt
    );
    const tools = request.tools ? this.formatTools(request.tools) : undefined;

    const body: Record<string, unknown> = {
      model: this.model,
      messages,
      max_tokens: request.maxTokens || this.defaultMaxTokens,
      temperature: request.temperature ?? this.defaultTemperature,
    };

    if (systemPrompt) {
      body.system = systemPrompt;
    }

    if (tools && tools.length > 0) {
      body.tools = tools;
      if (request.toolChoice) {
        if (request.toolChoice === 'auto') {
          body.tool_choice = { type: 'auto' };
        } else if (request.toolChoice === 'none') {
          body.tool_choice = { type: 'none' };
        } else if (typeof request.toolChoice === 'object') {
          body.tool_choice = {
            type: 'tool',
            name: request.toolChoice.function.name,
          };
        }
      }
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Anthropic API error: ${response.status} - ${error.error?.message || response.statusText}`
      );
    }

    const data: AnthropicCompletionResponse = await response.json();
    const latencyMs = Date.now() - startTime;

    // Extract content and tool calls
    let content = '';
    const toolCalls: AICompletionResponse['toolCalls'] = [];

    for (const block of data.content) {
      if (block.type === 'text') {
        content += block.text || '';
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id || '',
          name: block.name || '',
          arguments: block.input || {},
        });
      }
    }

    // Map finish reason
    let finishReason: AICompletionResponse['finishReason'] = 'stop';
    if (data.stop_reason === 'tool_use') {
      finishReason = 'tool_calls';
    } else if (data.stop_reason === 'max_tokens') {
      finishReason = 'length';
    }

    return {
      content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      finishReason,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
      model: data.model,
      provider: 'anthropic',
    };
  }

  async *streamComplete(
    request: AICompletionRequest
  ): AsyncGenerator<AIStreamChunk, void, unknown> {
    const { messages, systemPrompt } = this.formatMessages(
      request.messages,
      request.systemPrompt
    );
    const tools = request.tools ? this.formatTools(request.tools) : undefined;

    const body: Record<string, unknown> = {
      model: this.model,
      messages,
      max_tokens: request.maxTokens || this.defaultMaxTokens,
      temperature: request.temperature ?? this.defaultTemperature,
      stream: true,
    };

    if (systemPrompt) {
      body.system = systemPrompt;
    }

    if (tools && tools.length > 0) {
      body.tools = tools;
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeout * 3),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Anthropic API error: ${response.status} - ${error.error?.message || response.statusText}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let currentToolCall: Partial<{ id: string; name: string; arguments: string }> | null = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          try {
            const event: AnthropicStreamEvent = JSON.parse(trimmed.slice(6));

            switch (event.type) {
              case 'content_block_start':
                if (event.content_block?.type === 'tool_use') {
                  currentToolCall = {
                    id: event.content_block.id,
                    name: event.content_block.name,
                    arguments: '',
                  };
                }
                break;

              case 'content_block_delta':
                if (event.delta?.type === 'text_delta') {
                  yield {
                    content: event.delta.text,
                    done: false,
                  };
                } else if (event.delta?.type === 'input_json_delta' && currentToolCall) {
                  currentToolCall.arguments =
                    (currentToolCall.arguments || '') + (event.delta.partial_json || '');
                }
                break;

              case 'content_block_stop':
                if (currentToolCall && currentToolCall.id && currentToolCall.name) {
                  yield {
                    toolCalls: [
                      {
                        id: currentToolCall.id,
                        name: currentToolCall.name,
                        arguments: currentToolCall.arguments
                          ? JSON.parse(currentToolCall.arguments)
                          : {},
                      },
                    ],
                    done: false,
                  };
                  currentToolCall = null;
                }
                break;

              case 'message_stop':
                yield { done: true };
                return;
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    yield { done: true };
  }

  async embedText(_text: string): Promise<number[]> {
    // Anthropic doesn't have a native embedding API
    // Would need to use a different service or implement via Claude
    throw new Error(
      'Anthropic does not have a native embedding API. Use OpenAI embeddings instead.'
    );
  }

  private formatMessages(
    messages: AIMessage[],
    systemPrompt?: string
  ): { messages: AnthropicMessage[]; systemPrompt?: string } {
    const formatted: AnthropicMessage[] = [];
    let extractedSystemPrompt = systemPrompt;

    for (const msg of messages) {
      if (msg.role === 'system') {
        // Anthropic handles system messages differently - combine them
        const content = msg.content ?? '';
        extractedSystemPrompt = extractedSystemPrompt
          ? `${extractedSystemPrompt}\n\n${content}`
          : content || undefined;
        continue;
      }

      // Anthropic requires alternating user/assistant messages
      const lastMsg = formatted[formatted.length - 1];
      const msgContent = msg.content ?? '';

      if (msg.role === 'user') {
        if (lastMsg?.role === 'user') {
          // Combine consecutive user messages
          if (typeof lastMsg.content === 'string') {
            lastMsg.content = `${lastMsg.content}\n\n${msgContent}`;
          }
        } else {
          formatted.push({
            role: 'user',
            content: msgContent,
          });
        }
      } else if (msg.role === 'assistant') {
        if (lastMsg?.role === 'assistant') {
          // Combine consecutive assistant messages
          if (typeof lastMsg.content === 'string') {
            lastMsg.content = `${lastMsg.content}\n\n${msgContent}`;
          }
        } else {
          formatted.push({
            role: 'assistant',
            content: msgContent,
          });
        }
      }
    }

    // Ensure conversation starts with user message
    if (formatted.length === 0 || formatted[0].role !== 'user') {
      formatted.unshift({
        role: 'user',
        content: 'Hello',
      });
    }

    return { messages: formatted, systemPrompt: extractedSystemPrompt };
  }

  private formatTools(tools: AIToolDefinition[]): AnthropicTool[] {
    return tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters,
    }));
  }
}
