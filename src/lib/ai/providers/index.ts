/**
 * AI Provider Factory
 * Creates and manages AI providers with automatic fallback
 */

import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import type {
  AIProvider,
  AIProviderType,
  ProviderFactoryOptions,
  AICompletionRequest,
  AICompletionResponse,
  AIStreamChunk,
} from './types';

export * from './types';
export { OpenAIProvider } from './openai';
export { AnthropicProvider } from './anthropic';

/**
 * Provider factory with automatic fallback
 */
export class AIProviderFactory {
  private primaryProvider: AIProvider | null = null;
  private fallbackProvider: AIProvider | null = null;
  private primaryType: AIProviderType;
  private fallbackType?: AIProviderType;

  constructor(options: ProviderFactoryOptions) {
    this.primaryType = options.primaryProvider;
    this.fallbackType = options.fallbackProvider;

    // Create primary provider
    if (options.primaryProvider === 'openai' && options.openaiConfig?.apiKey) {
      this.primaryProvider = new OpenAIProvider(options.openaiConfig);
    } else if (options.primaryProvider === 'anthropic' && options.anthropicConfig?.apiKey) {
      this.primaryProvider = new AnthropicProvider(options.anthropicConfig);
    }

    // Create fallback provider
    if (options.fallbackProvider) {
      if (options.fallbackProvider === 'openai' && options.openaiConfig?.apiKey) {
        this.fallbackProvider = new OpenAIProvider(options.openaiConfig);
      } else if (options.fallbackProvider === 'anthropic' && options.anthropicConfig?.apiKey) {
        this.fallbackProvider = new AnthropicProvider(options.anthropicConfig);
      }
    }
  }

  /**
   * Get the primary provider
   */
  getPrimary(): AIProvider | null {
    return this.primaryProvider;
  }

  /**
   * Get the fallback provider
   */
  getFallback(): AIProvider | null {
    return this.fallbackProvider;
  }

  /**
   * Check if any provider is available
   */
  isAvailable(): boolean {
    return (
      (this.primaryProvider?.isAvailable() ?? false) ||
      (this.fallbackProvider?.isAvailable() ?? false)
    );
  }

  /**
   * Get an available provider (primary preferred)
   */
  getProvider(): AIProvider {
    if (this.primaryProvider?.isAvailable()) {
      return this.primaryProvider;
    }
    if (this.fallbackProvider?.isAvailable()) {
      return this.fallbackProvider;
    }
    throw new Error('No AI provider is available. Please configure API keys.');
  }

  /**
   * Complete with automatic fallback
   */
  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    // Try primary provider first
    if (this.primaryProvider?.isAvailable()) {
      try {
        return await this.primaryProvider.complete(request);
      } catch (error) {
        console.error(`Primary provider (${this.primaryType}) failed:`, error);

        // Fall back to secondary
        if (this.fallbackProvider?.isAvailable()) {
          console.log(`Falling back to ${this.fallbackType}`);
          return await this.fallbackProvider.complete(request);
        }
        throw error;
      }
    }

    // Try fallback directly if primary not available
    if (this.fallbackProvider?.isAvailable()) {
      return await this.fallbackProvider.complete(request);
    }

    throw new Error('No AI provider is available');
  }

  /**
   * Stream complete with automatic fallback
   */
  async *streamComplete(
    request: AICompletionRequest
  ): AsyncGenerator<AIStreamChunk, void, unknown> {
    const provider = this.getProvider();
    yield* provider.streamComplete(request);
  }

  /**
   * Get embeddings (OpenAI only)
   */
  async embedText(text: string): Promise<number[]> {
    // Prefer OpenAI for embeddings since Anthropic doesn't have native support
    if (this.primaryType === 'openai' && this.primaryProvider?.isAvailable()) {
      return await this.primaryProvider.embedText(text);
    }
    if (this.fallbackType === 'openai' && this.fallbackProvider?.isAvailable()) {
      return await this.fallbackProvider.embedText(text);
    }

    // Try primary anyway (will throw if Anthropic)
    const provider = this.getProvider();
    return await provider.embedText(text);
  }
}

// Singleton instance for server-side usage
let defaultFactory: AIProviderFactory | null = null;

/**
 * Initialize the default provider factory
 */
export function initializeProviders(options: ProviderFactoryOptions): AIProviderFactory {
  defaultFactory = new AIProviderFactory(options);
  return defaultFactory;
}

/**
 * Get the default provider factory
 */
export function getProviderFactory(): AIProviderFactory {
  if (!defaultFactory) {
    // Try to initialize with environment variables
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!openaiKey && !anthropicKey) {
      throw new Error(
        'AI providers not initialized. Call initializeProviders() or set API key environment variables.'
      );
    }

    defaultFactory = new AIProviderFactory({
      primaryProvider: openaiKey ? 'openai' : 'anthropic',
      fallbackProvider: openaiKey && anthropicKey ? 'anthropic' : undefined,
      openaiConfig: openaiKey ? { apiKey: openaiKey } : undefined,
      anthropicConfig: anthropicKey ? { apiKey: anthropicKey } : undefined,
    });
  }

  return defaultFactory;
}

/**
 * Helper to get a provider directly
 */
export function getAIProvider(): AIProvider {
  return getProviderFactory().getProvider();
}

/**
 * Create a provider factory from environment variables
 */
export function createProviderFromEnv(): AIProviderFactory {
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const preferredProvider = (process.env.PREFERRED_AI_PROVIDER as AIProviderType) || 'openai';

  return new AIProviderFactory({
    primaryProvider: preferredProvider,
    fallbackProvider: preferredProvider === 'openai' ? 'anthropic' : 'openai',
    openaiConfig: openaiKey ? { apiKey: openaiKey } : undefined,
    anthropicConfig: anthropicKey ? { apiKey: anthropicKey } : undefined,
  });
}
