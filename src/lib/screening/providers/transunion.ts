/**
 * TransUnion SmartMove Screening Provider (STUB)
 *
 * This is a stub implementation for future integration with TransUnion SmartMove API.
 * Documentation: https://www.transunion.com/product/smartmove
 *
 * To implement:
 * 1. Sign up for TransUnion SmartMove API access
 * 2. Get API credentials (Client ID, Client Secret)
 * 3. Set environment variables: TRANSUNION_CLIENT_ID, TRANSUNION_CLIENT_SECRET
 * 4. Implement the actual API calls below
 */

import type {
  ScreeningProvider,
  ApplicantData,
  ScreeningSession,
  ScreeningResults,
} from '../types'

export class TransUnionProvider implements ScreeningProvider {
  name = 'TransUnion SmartMove'
  code = 'transunion'

  async isConfigured(): Promise<boolean> {
    // Check if API credentials are configured
    return !!(
      process.env.TRANSUNION_CLIENT_ID &&
      process.env.TRANSUNION_CLIENT_SECRET
    )
  }

  async initiateScreening(
    _applicationId: string,
    _applicantData: ApplicantData,
    _options?: {
      includeCredit?: boolean
      includeCriminal?: boolean
      includeEviction?: boolean
      includeIncome?: boolean
    }
  ): Promise<ScreeningSession> {
    const isConfigured = await this.isConfigured()

    if (!isConfigured) {
      throw new Error(
        'TransUnion SmartMove is not configured. Please set TRANSUNION_CLIENT_ID and TRANSUNION_CLIENT_SECRET environment variables.'
      )
    }

    // TODO: Implement actual TransUnion API call
    // 1. Create a screening order
    // 2. Send invitation to applicant
    // 3. Return session details

    throw new Error(
      'TransUnion SmartMove integration is not yet implemented. ' +
        'Please use manual screening entry for now, or contact support to enable this integration.'
    )
  }

  async getResults(_sessionId: string): Promise<ScreeningResults> {
    const isConfigured = await this.isConfigured()

    if (!isConfigured) {
      throw new Error('TransUnion SmartMove is not configured.')
    }

    // TODO: Implement actual result fetching
    // 1. Poll for report completion
    // 2. Parse and normalize results
    // 3. Return standardized ScreeningResults

    throw new Error('TransUnion SmartMove integration is not yet implemented.')
  }

  async cancelScreening(_sessionId: string): Promise<void> {
    const isConfigured = await this.isConfigured()

    if (!isConfigured) {
      throw new Error('TransUnion SmartMove is not configured.')
    }

    // TODO: Implement cancellation
    throw new Error('TransUnion SmartMove integration is not yet implemented.')
  }

  async getConsentUrl(_sessionId: string): Promise<string | null> {
    // TransUnion SmartMove sends its own invitation email to the applicant
    // with a link to complete the screening consent
    return null
  }
}
