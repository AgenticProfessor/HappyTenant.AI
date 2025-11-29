/**
 * OpenAI Provider Implementation
 * Handles all interactions with OpenAI API
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
const DEFAULT_MODEL = 'gpt-4-turbo-preview';
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_TIMEOUT = 30000;

// OpenAI API types
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  name?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
}

interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface OpenAICompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    finish_reason: 'stop' | 'tool_calls' | 'length' | 'content_filter';
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIEmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    index: number;
    embedding: number[];
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIProvider implements AIProvider {
  readonly providerType = 'openai' as const;

  private apiKey: string;
  private model: string;
  private baseUrl: string;
  private defaultMaxTokens: number;
  private defaultTemperature: number;
  private timeout: number;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || DEFAULT_MODEL;
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    this.defaultMaxTokens = config.defaultMaxTokens || DEFAULT_MAX_TOKENS;
    this.defaultTemperature = config.defaultTemperature || DEFAULT_TEMPERATURE;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const startTime = Date.now();

    const messages = this.formatMessages(request.messages, request.systemPrompt);
    const tools = request.tools ? this.formatTools(request.tools) : undefined;

    const body: Record<string, unknown> = {
      model: this.model,
      messages,
      max_tokens: request.maxTokens || this.defaultMaxTokens,
      temperature: request.temperature ?? this.defaultTemperature,
    };

    if (tools && tools.length > 0) {
      body.tools = tools;
      if (request.toolChoice) {
        body.tool_choice = request.toolChoice;
      }
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} - ${error.error?.message || response.statusText}`
      );
    }

    const data: OpenAICompletionResponse = await response.json();
    const choice = data.choices[0];
    const latencyMs = Date.now() - startTime;

    return {
      content: choice.message.content || '',
      toolCalls: choice.message.tool_calls?.map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments),
      })),
      finishReason: choice.finish_reason,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
      model: data.model,
      provider: 'openai',
    };
  }

  async *streamComplete(
    request: AICompletionRequest
  ): AsyncGenerator<AIStreamChunk, void, unknown> {
    const messages = this.formatMessages(request.messages, request.systemPrompt);
    const tools = request.tools ? this.formatTools(request.tools) : undefined;

    const body: Record<string, unknown> = {
      model: this.model,
      messages,
      max_tokens: request.maxTokens || this.defaultMaxTokens,
      temperature: request.temperature ?? this.defaultTemperature,
      stream: true,
    };

    if (tools && tools.length > 0) {
      body.tools = tools;
      if (request.toolChoice) {
        body.tool_choice = request.toolChoice;
      }
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeout * 3), // Longer timeout for streaming
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} - ${error.error?.message || response.statusText}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') {
            if (trimmed === 'data: [DONE]') {
              yield { done: true };
              return;
            }
            continue;
          }

          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const delta = data.choices?.[0]?.delta;

              if (delta) {
                yield {
                  content: delta.content || undefined,
                  toolCalls: delta.tool_calls?.map((tc: { id?: string; function?: { name?: string; arguments?: string } }) => ({
                    id: tc.id,
                    name: tc.function?.name,
                    arguments: tc.function?.arguments
                      ? JSON.parse(tc.function.arguments)
                      : undefined,
                  })),
                  done: false,
                };
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    yield { done: true };
  }

  async embedText(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_EMBEDDING_MODEL,
        input: text,
      }),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI Embedding API error: ${response.status} - ${error.error?.message || response.statusText}`
      );
    }

    const data: OpenAIEmbeddingResponse = await response.json();
    return data.data[0].embedding;
  }

  private formatMessages(
    messages: AIMessage[],
    systemPrompt?: string
  ): OpenAIMessage[] {
    const formatted: OpenAIMessage[] = [];

    if (systemPrompt) {
      formatted.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    for (const msg of messages) {
      formatted.push({
        role: msg.role,
        content: msg.content,
        name: msg.name,
      });
    }

    return formatted;
  }

  private formatTools(tools: AIToolDefinition[]): OpenAITool[] {
    return tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }
}
