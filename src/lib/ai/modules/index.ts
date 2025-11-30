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

// Core Modules - Fully Implemented
export { AccountingModule } from './accounting';
export { CommunicationsModule, type MessageDraft, type SentimentAnalysis, type MessageTemplate } from './communications';
export { MaintenanceTriageModule, type TriageResult, type UrgencyAssessment, type VendorRecommendation } from './maintenance-triage';
export { LeasingModule, type PropertyListing, type ApplicantScreening, type RentAnalysis, type LeaseRenewalStrategy } from './leasing';

// Future modules - to be implemented
// export { OnboardingOCRModule } from './onboarding-ocr';
// export { ComplianceModule } from './compliance';
