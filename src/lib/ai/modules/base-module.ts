/**
 * Base Module for Steward AI
 * Abstract class that all AI modules extend
 */

import type {
  AIModuleType,
  AICompletionRequest,
  AICompletionResponse,
  AIMessage,
  AIToolDefinition,
} from '../providers/types';
import { getProviderFactory, type AIProviderFactory } from '../providers';
import { getActionLogger, type AIActionLogger, withActionLogging } from '../logging';
import { getAutomationLevel, type AutomationConfig, DEFAULT_AUTOMATION_CONFIG } from '../config';

export interface ModuleContext {
  organizationId: string;
  userId?: string;
  sessionId: string;
  automationConfig?: AutomationConfig;
}

export interface ModuleResponse<T> {
  data: T;
  logId: string;
  requiresApproval: boolean;
  automationLevel: string;
}

export abstract class BaseModule {
  abstract readonly moduleName: AIModuleType;
  abstract readonly displayName: string;
  abstract readonly description: string;

  protected providerFactory: AIProviderFactory;
  protected actionLogger: AIActionLogger;
  protected automationConfig: AutomationConfig;

  constructor(
    providerFactory?: AIProviderFactory,
    actionLogger?: AIActionLogger,
    automationConfig?: AutomationConfig
  ) {
    this.providerFactory = providerFactory || getProviderFactory();
    this.actionLogger = actionLogger || getActionLogger();
    this.automationConfig = automationConfig || DEFAULT_AUTOMATION_CONFIG;
  }

  /**
   * Get automation level for an action
   */
  protected getAutomationLevel(actionType: string): string {
    return getAutomationLevel(this.automationConfig, this.moduleName, actionType);
  }

  /**
   * Check if action requires approval
   */
  protected requiresApproval(actionType: string): boolean {
    const level = this.getAutomationLevel(actionType);
    return level === 'manual' || level === 'suggest';
  }

  /**
   * Execute an AI completion with logging
   */
  protected async executeWithLogging<T>(
    context: ModuleContext,
    actionType: string,
    request: AICompletionRequest,
    transformResponse: (response: AICompletionResponse) => T
  ): Promise<ModuleResponse<T>> {
    const automationLevel = getAutomationLevel(
      context.automationConfig || this.automationConfig,
      this.moduleName,
      actionType
    );

    const { response, logId } = await withActionLogging(
      this.actionLogger,
      {
        organizationId: context.organizationId,
        userId: context.userId,
        sessionId: context.sessionId,
        module: this.moduleName,
        actionType,
        input: {
          prompt: request.messages.map((m) => m.content).join('\n'),
          context: { systemPrompt: request.systemPrompt },
        },
        automationLevel: automationLevel as any,
      },
      async () => {
        const completion = await this.providerFactory.complete(request);
        return {
          response: transformResponse(completion),
          completion,
        };
      }
    );

    return {
      data: response,
      logId,
      requiresApproval: this.requiresApproval(actionType),
      automationLevel,
    };
  }

  /**
   * Build messages array with system prompt
   */
  protected buildMessages(
    systemPrompt: string,
    conversationHistory: AIMessage[],
    userMessage: string
  ): AIMessage[] {
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];
    return messages;
  }

  /**
   * Get system prompt for this module
   */
  abstract getSystemPrompt(): string;

  /**
   * Get available tools for this module
   */
  protected abstract getTools(): AIToolDefinition[];

  /**
   * Check if module is enabled
   */
  isEnabled(): boolean {
    return this.providerFactory.isAvailable();
  }
}

/**
 * Module registry for dependency injection
 */
const moduleRegistry: Map<AIModuleType, BaseModule> = new Map();

export function registerModule(module: BaseModule): void {
  moduleRegistry.set(module.moduleName, module);
}

export function getModule<T extends BaseModule>(moduleName: AIModuleType): T | undefined {
  return moduleRegistry.get(moduleName) as T | undefined;
}

export function getAllModules(): BaseModule[] {
  return Array.from(moduleRegistry.values());
}
