/**
 * AI Modules Index
 * Export all module classes and utilities
 */

export {
  BaseModule,
  registerModule,
  getModule,
  getAllModules,
  type ModuleContext,
  type ModuleResponse,
} from './base-module';

// Module scaffolding - will be implemented in later phases
// export { CommunicationsModule } from './communications';
// export { MaintenanceTriageModule } from './maintenance-triage';
// export { OnboardingOCRModule } from './onboarding-ocr';
// export { LeasingModule } from './leasing';
// export { ComplianceModule } from './compliance';
export { AccountingModule } from './accounting';
