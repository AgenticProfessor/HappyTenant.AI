/**
 * Screening Provider Interface
 * Abstract interface for tenant screening services (TransUnion, Plaid, etc.)
 */

export interface ApplicantData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: Date
  ssn?: string
  address?: {
    street: string
    city: string
    state: string
    zip: string
  }
}

export interface ScreeningSession {
  sessionId: string
  provider: string
  status: 'initiated' | 'pending' | 'completed' | 'failed' | 'expired'
  expiresAt?: Date
  reportUrl?: string
}

export type CheckStatus = 'clear' | 'review' | 'fail' | 'pending' | 'not_available'

export interface ScreeningResults {
  sessionId: string
  provider: string
  completedAt: Date

  // Credit
  creditScore?: number
  creditReportUrl?: string
  creditStatus: CheckStatus

  // Criminal
  criminalStatus: CheckStatus
  criminalDetails?: string
  criminalRecordsFound?: number

  // Eviction
  evictionStatus: CheckStatus
  evictionDetails?: string
  evictionsFound?: number

  // Income Verification
  incomeVerified?: boolean
  verifiedIncome?: number
  incomeStatus: CheckStatus

  // Overall
  overallRecommendation: 'approve' | 'review' | 'decline'
  riskScore?: number

  // Raw data (for audit)
  rawResponse?: unknown
}

export interface ScreeningProvider {
  /**
   * Provider name for display
   */
  name: string

  /**
   * Provider code for database storage
   */
  code: string

  /**
   * Whether this provider is currently configured and available
   */
  isConfigured(): Promise<boolean>

  /**
   * Initiate a screening request for an applicant
   */
  initiateScreening(
    applicationId: string,
    applicantData: ApplicantData,
    options?: {
      includeCredit?: boolean
      includeCriminal?: boolean
      includeEviction?: boolean
      includeIncome?: boolean
    }
  ): Promise<ScreeningSession>

  /**
   * Get the current status and results of a screening session
   */
  getResults(sessionId: string): Promise<ScreeningResults>

  /**
   * Cancel a pending screening request
   */
  cancelScreening(sessionId: string): Promise<void>

  /**
   * Get the URL to redirect the applicant to for consent/verification
   * (some providers require the applicant to verify their identity)
   */
  getConsentUrl?(sessionId: string): Promise<string | null>
}

/**
 * Factory to get the appropriate screening provider
 */
export interface ScreeningProviderFactory {
  getProvider(providerCode: string): ScreeningProvider
  getAvailableProviders(): Promise<Array<{ code: string; name: string; isConfigured: boolean }>>
}
