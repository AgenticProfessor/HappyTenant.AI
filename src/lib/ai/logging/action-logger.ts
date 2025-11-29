/**
 * AI Action Logger
 * Logs all AI actions for audit trail, compliance, and analytics
 */

import type {
  AIModuleType,
  AutomationLevel,
  HumanDecision,
  AIProviderType,
  AICompletionResponse,
} from '../providers/types';

// Log entry for creating a new action log
export interface CreateActionLogInput {
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
  automationLevel: AutomationLevel;
}

// Log entry for updating with AI response
export interface UpdateActionLogWithResponse {
  logId: string;
  output: {
    response?: string;
    toolCalls?: Array<{ name: string; result: unknown }>;
    generatedContent?: string;
  };
  tokensUsed: number;
  latencyMs: number;
  provider: AIProviderType;
  model: string;
}

// Log entry for human decision
export interface UpdateActionLogDecision {
  logId: string;
  humanDecision: HumanDecision;
  modifiedContent?: string;
  decidedByUserId?: string;
}

// Full action log entry
export interface ActionLogEntry {
  id: string;
  organizationId: string;
  userId?: string;
  sessionId: string;
  module: AIModuleType;
  actionType: string;
  inputPrompt?: string;
  inputContext?: Record<string, unknown>;
  inputFiles?: string[];
  outputResponse?: string;
  outputToolCalls?: Array<{ name: string; result: unknown }>;
  outputContent?: string;
  humanDecision: HumanDecision;
  modifiedContent?: string;
  decidedByUserId?: string;
  decidedAt?: Date;
  automationLevel: AutomationLevel;
  tokensUsed: number;
  latencyMs: number;
  provider: string;
  model: string;
  createdAt: Date;
}

// Action logger class
export class AIActionLogger {
  private prisma: any; // Type will be PrismaClient when integrated

  constructor(prismaClient?: any) {
    this.prisma = prismaClient;
  }

  /**
   * Start logging an AI action (before the AI call)
   */
  async startAction(input: CreateActionLogInput): Promise<string> {
    if (!this.prisma) {
      // Return a mock ID if no database connection
      return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    const log = await this.prisma.aIActionLog.create({
      data: {
        organizationId: input.organizationId,
        userId: input.userId,
        sessionId: input.sessionId,
        module: input.module.toUpperCase(),
        actionType: input.actionType,
        inputPrompt: input.input.prompt,
        inputContext: input.input.context,
        inputFiles: input.input.files || [],
        automationLevel: input.automationLevel.toUpperCase().replace('_', '_'),
        humanDecision: 'PENDING',
        tokensUsed: 0,
        latencyMs: 0,
        provider: '',
        model: '',
      },
    });

    return log.id;
  }

  /**
   * Update the log with AI response
   */
  async recordResponse(update: UpdateActionLogWithResponse): Promise<void> {
    if (!this.prisma) {
      console.log('[AIActionLogger] Response recorded (mock):', update.logId);
      return;
    }

    await this.prisma.aIActionLog.update({
      where: { id: update.logId },
      data: {
        outputResponse: update.output.response,
        outputToolCalls: update.output.toolCalls,
        outputContent: update.output.generatedContent,
        tokensUsed: update.tokensUsed,
        latencyMs: update.latencyMs,
        provider: update.provider,
        model: update.model,
      },
    });
  }

  /**
   * Record human decision on AI action
   */
  async recordDecision(update: UpdateActionLogDecision): Promise<void> {
    if (!this.prisma) {
      console.log('[AIActionLogger] Decision recorded (mock):', update.logId, update.humanDecision);
      return;
    }

    await this.prisma.aIActionLog.update({
      where: { id: update.logId },
      data: {
        humanDecision: update.humanDecision.toUpperCase(),
        modifiedContent: update.modifiedContent,
        decidedByUserId: update.decidedByUserId,
        decidedAt: new Date(),
      },
    });
  }

  /**
   * Get action logs for an organization
   */
  async getActionLogs(params: {
    organizationId: string;
    module?: AIModuleType;
    limit?: number;
    offset?: number;
  }): Promise<ActionLogEntry[]> {
    if (!this.prisma) {
      return [];
    }

    const logs = await this.prisma.aIActionLog.findMany({
      where: {
        organizationId: params.organizationId,
        ...(params.module && { module: params.module.toUpperCase() }),
      },
      orderBy: { createdAt: 'desc' },
      take: params.limit || 50,
      skip: params.offset || 0,
    });

    return logs.map(this.mapLogEntry);
  }

  /**
   * Get action log by ID
   */
  async getActionLog(logId: string): Promise<ActionLogEntry | null> {
    if (!this.prisma) {
      return null;
    }

    const log = await this.prisma.aIActionLog.findUnique({
      where: { id: logId },
    });

    return log ? this.mapLogEntry(log) : null;
  }

  /**
   * Get usage statistics for an organization
   */
  async getUsageStats(params: {
    organizationId: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalActions: number;
    totalTokens: number;
    byModule: Record<string, { actions: number; tokens: number }>;
    byDecision: Record<string, number>;
  }> {
    if (!this.prisma) {
      return {
        totalActions: 0,
        totalTokens: 0,
        byModule: {},
        byDecision: {},
      };
    }

    const whereClause: Record<string, unknown> = {
      organizationId: params.organizationId,
    };

    if (params.startDate || params.endDate) {
      whereClause.createdAt = {};
      if (params.startDate) {
        (whereClause.createdAt as Record<string, Date>).gte = params.startDate;
      }
      if (params.endDate) {
        (whereClause.createdAt as Record<string, Date>).lte = params.endDate;
      }
    }

    const logs = await this.prisma.aIActionLog.findMany({
      where: whereClause,
      select: {
        module: true,
        tokensUsed: true,
        humanDecision: true,
      },
    });

    const stats = {
      totalActions: logs.length,
      totalTokens: 0,
      byModule: {} as Record<string, { actions: number; tokens: number }>,
      byDecision: {} as Record<string, number>,
    };

    for (const log of logs) {
      stats.totalTokens += log.tokensUsed || 0;

      // By module
      const module = log.module.toLowerCase();
      if (!stats.byModule[module]) {
        stats.byModule[module] = { actions: 0, tokens: 0 };
      }
      stats.byModule[module].actions++;
      stats.byModule[module].tokens += log.tokensUsed || 0;

      // By decision
      const decision = log.humanDecision.toLowerCase();
      stats.byDecision[decision] = (stats.byDecision[decision] || 0) + 1;
    }

    return stats;
  }

  /**
   * Map database entry to ActionLogEntry
   */
  private mapLogEntry(log: any): ActionLogEntry {
    return {
      id: log.id,
      organizationId: log.organizationId,
      userId: log.userId,
      sessionId: log.sessionId,
      module: log.module.toLowerCase() as AIModuleType,
      actionType: log.actionType,
      inputPrompt: log.inputPrompt,
      inputContext: log.inputContext,
      inputFiles: log.inputFiles,
      outputResponse: log.outputResponse,
      outputToolCalls: log.outputToolCalls,
      outputContent: log.outputContent,
      humanDecision: log.humanDecision.toLowerCase() as HumanDecision,
      modifiedContent: log.modifiedContent,
      decidedByUserId: log.decidedByUserId,
      decidedAt: log.decidedAt,
      automationLevel: log.automationLevel.toLowerCase().replace('_', '_') as AutomationLevel,
      tokensUsed: log.tokensUsed,
      latencyMs: log.latencyMs,
      provider: log.provider,
      model: log.model,
      createdAt: log.createdAt,
    };
  }
}

/**
 * Helper to create a logged AI completion
 */
export async function withActionLogging<T>(
  logger: AIActionLogger,
  input: CreateActionLogInput,
  action: () => Promise<{ response: T; completion: AICompletionResponse }>
): Promise<{ response: T; logId: string }> {
  const startTime = Date.now();
  const logId = await logger.startAction(input);

  try {
    const { response, completion } = await action();
    const latencyMs = Date.now() - startTime;

    await logger.recordResponse({
      logId,
      output: {
        response: completion.content,
        toolCalls: completion.toolCalls?.map((tc) => ({
          name: tc.name,
          result: tc.arguments,
        })),
      },
      tokensUsed: completion.usage.totalTokens,
      latencyMs,
      provider: completion.provider,
      model: completion.model,
    });

    // Auto-execute if fully automatic
    if (input.automationLevel === 'fully_auto') {
      await logger.recordDecision({
        logId,
        humanDecision: 'auto_executed',
      });
    }

    return { response, logId };
  } catch (error) {
    // Log the error
    await logger.recordResponse({
      logId,
      output: {
        response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      tokensUsed: 0,
      latencyMs: Date.now() - startTime,
      provider: 'unknown' as AIProviderType,
      model: 'unknown',
    });

    throw error;
  }
}

// Default logger instance
let defaultLogger: AIActionLogger | null = null;

export function initializeActionLogger(prismaClient?: any): AIActionLogger {
  defaultLogger = new AIActionLogger(prismaClient);
  return defaultLogger;
}

export function getActionLogger(): AIActionLogger {
  if (!defaultLogger) {
    defaultLogger = new AIActionLogger();
  }
  return defaultLogger;
}
