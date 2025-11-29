/**
 * Automation Level Configuration
 * Defines per-action automation settings for Steward AI
 */

import type { AutomationLevel, AIModuleType } from '../providers/types';

// Per-action automation configuration
export interface ModuleAutomationConfig {
  [actionType: string]: AutomationLevel;
}

// Full automation configuration
export interface AutomationConfig {
  communications: {
    draftMessage: AutomationLevel;
    sendMessage: AutomationLevel;
    translateMessage: AutomationLevel;
    suggestResponse: AutomationLevel;
    analyzeIntent: AutomationLevel;
  };
  maintenance: {
    categorize: AutomationLevel;
    prioritize: AutomationLevel;
    assignVendor: AutomationLevel;
    scheduleAppointment: AutomationLevel;
    troubleshoot: AutomationLevel;
    estimateCost: AutomationLevel;
  };
  onboarding: {
    parseDocument: AutomationLevel;
    extractData: AutomationLevel;
    populateFields: AutomationLevel;
    validateData: AutomationLevel;
  };
  leasing: {
    generateListing: AutomationLevel;
    respondToInquiry: AutomationLevel;
    preScreenApplicant: AutomationLevel;
    scheduleTour: AutomationLevel;
  };
  compliance: {
    auditLease: AutomationLevel;
    checkDisclosures: AutomationLevel;
    suggestFixes: AutomationLevel;
  };
  accounting: {
    categorizeTransaction: AutomationLevel;
    extractInvoiceData: AutomationLevel;
    generateReport: AutomationLevel;
  };
}

// Default configuration with conservative defaults
export const DEFAULT_AUTOMATION_CONFIG: AutomationConfig = {
  communications: {
    draftMessage: 'suggest',
    sendMessage: 'manual',
    translateMessage: 'auto_with_review',
    suggestResponse: 'suggest',
    analyzeIntent: 'fully_auto',
  },
  maintenance: {
    categorize: 'auto_with_review',
    prioritize: 'suggest',
    assignVendor: 'suggest',
    scheduleAppointment: 'manual',
    troubleshoot: 'suggest',
    estimateCost: 'suggest',
  },
  onboarding: {
    parseDocument: 'fully_auto',
    extractData: 'auto_with_review',
    populateFields: 'suggest',
    validateData: 'fully_auto',
  },
  leasing: {
    generateListing: 'suggest',
    respondToInquiry: 'suggest',
    preScreenApplicant: 'auto_with_review',
    scheduleTour: 'manual',
  },
  compliance: {
    auditLease: 'fully_auto',
    checkDisclosures: 'fully_auto',
    suggestFixes: 'suggest',
  },
  accounting: {
    categorizeTransaction: 'auto_with_review',
    extractInvoiceData: 'auto_with_review',
    generateReport: 'suggest',
  },
};

// Descriptions for UI
export const AUTOMATION_LEVEL_DESCRIPTIONS: Record<AutomationLevel, string> = {
  manual: 'AI suggests actions, but you must initiate everything',
  suggest: 'AI drafts responses/actions for your approval before sending',
  auto_with_review: 'AI acts automatically, but you can review and undo',
  fully_auto: 'AI acts completely autonomously without approval needed',
};

// Risk levels for each automation level
export const AUTOMATION_RISK_LEVELS: Record<AutomationLevel, 'low' | 'medium' | 'high'> = {
  manual: 'low',
  suggest: 'low',
  auto_with_review: 'medium',
  fully_auto: 'high',
};

/**
 * Get automation level for a specific action
 */
export function getAutomationLevel(
  config: AutomationConfig,
  module: AIModuleType,
  actionType: string
): AutomationLevel {
  const moduleConfig = config[module];
  if (!moduleConfig) {
    return 'manual'; // Default to safest option
  }

  return (moduleConfig as Record<string, AutomationLevel>)[actionType] || 'manual';
}

/**
 * Merge user config with defaults
 */
export function mergeAutomationConfig(
  userConfig: Partial<AutomationConfig>
): AutomationConfig {
  const merged = { ...DEFAULT_AUTOMATION_CONFIG };

  for (const [module, moduleConfig] of Object.entries(userConfig)) {
    const moduleKey = module as keyof AutomationConfig;
    if (moduleConfig && merged[moduleKey]) {
      // Use type assertion for the spread operation
      (merged as Record<string, unknown>)[moduleKey] = {
        ...(merged[moduleKey] as Record<string, unknown>),
        ...(moduleConfig as Record<string, unknown>),
      };
    }
  }

  return merged;
}

/**
 * Validate automation config
 */
export function validateAutomationConfig(config: unknown): config is AutomationConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }

  const validLevels: AutomationLevel[] = ['manual', 'suggest', 'auto_with_review', 'fully_auto'];

  for (const moduleConfig of Object.values(config)) {
    if (!moduleConfig || typeof moduleConfig !== 'object') {
      continue; // Allow partial configs
    }

    for (const level of Object.values(moduleConfig)) {
      if (!validLevels.includes(level as AutomationLevel)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Check if action should require human approval
 */
export function requiresApproval(level: AutomationLevel): boolean {
  return level === 'manual' || level === 'suggest';
}

/**
 * Check if action can be auto-executed
 */
export function canAutoExecute(level: AutomationLevel): boolean {
  return level === 'auto_with_review' || level === 'fully_auto';
}

/**
 * Check if action result should be shown for review
 */
export function shouldShowForReview(level: AutomationLevel): boolean {
  return level !== 'fully_auto';
}
