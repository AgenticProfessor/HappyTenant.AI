/**
 * Steward AI - Main Entry Point
 * AI-first property management assistant
 */

// Core Steward
export {
  Steward,
  initializeSteward,
  getSteward,
  type StewardState,
  type StewardOptions,
  type ChatRequest,
  type ChatResponse,
} from './steward';

// Providers
export {
  AIProviderFactory,
  OpenAIProvider,
  AnthropicProvider,
  initializeProviders,
  getProviderFactory,
  getAIProvider,
  createProviderFromEnv,
  type AIProvider,
  type AIProviderType,
  type AIProviderConfig,
  type AIMessage,
  type AIToolDefinition,
  type AIToolCall,
  type AICompletionRequest,
  type AICompletionResponse,
  type AIStreamChunk,
  type ProviderFactoryOptions,
  type StewardMessage,
  type StewardConversation,
  type AIModuleType,
  type AutomationLevel,
  type HumanDecision,
} from './providers';

// Logging
export {
  AIActionLogger,
  withActionLogging,
  initializeActionLogger,
  getActionLogger,
  type CreateActionLogInput,
  type UpdateActionLogWithResponse,
  type UpdateActionLogDecision,
  type ActionLogEntry,
} from './logging';

// Configuration
export {
  DEFAULT_AUTOMATION_CONFIG,
  AUTOMATION_LEVEL_DESCRIPTIONS,
  AUTOMATION_RISK_LEVELS,
  getAutomationLevel,
  mergeAutomationConfig,
  validateAutomationConfig,
  requiresApproval,
  canAutoExecute,
  shouldShowForReview,
  type AutomationConfig,
  type ModuleAutomationConfig,
} from './config';

// Modules
export {
  BaseModule,
  registerModule,
  getModule,
  getAllModules,
  type ModuleContext,
  type ModuleResponse,
} from './modules';
