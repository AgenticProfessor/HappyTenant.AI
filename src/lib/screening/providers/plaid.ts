/**
 * Plaid Income Verification Provider (STUB)
 *
 * This is a stub implementation for future integration with Plaid Income API.
 * Documentation: https://plaid.com/products/income/
 *
 * To implement:
 * 1. Sign up for Plaid and enable Income product
 * 2. Get API credentials (Client ID, Secret)
 * 3. Set environment variables: PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV
 * 4. Implement the actual API calls below
 */

import type {
  ScreeningProvider,
  ApplicantData,
  ScreeningSession,
  ScreeningResults,
} from '../types'

export class PlaidIncomeProvider implements ScreeningProvider {
  name = 'Plaid Income Verification'
  code = 'plaid'

  async isConfigured(): Promise<boolean> {
    // Check if Plaid API credentials are configured
    return !!(
      process.env.PLAID_CLIENT_ID &&
      process.env.PLAID_SECRET &&
      process.env.PLAID_ENV
    )
  }

  async initiateScreening(
    _applicationId: string,
    _applicantData: ApplicantData
  ): Promise<ScreeningSession> {
    const isConfigured = await this.isConfigured()

    if (!isConfigured) {
      throw new Error(
        'Plaid is not configured. Please set PLAID_CLIENT_ID, PLAID_SECRET, and PLAID_ENV environment variables.'
      )
    }

    // TODO: Implement actual Plaid API call
    // 1. Create Link token for Income verification
    // 2. Return session with link URL for applicant to complete

    throw new Error(
      'Plaid Income Verification is not yet implemented. ' +
        'Please use manual screening entry for now, or contact support to enable this integration.'
    )
  }

  async getResults(_sessionId: string): Promise<ScreeningResults> {
    const isConfigured = await this.isConfigured()

    if (!isConfigured) {
      throw new Error('Plaid is not configured.')
    }

    // TODO: Implement actual result fetching
    // 1. Exchange public token for access token
    // 2. Fetch income verification data
    // 3. Return standardized ScreeningResults (income-focused)

    throw new Error('Plaid Income Verification is not yet implemented.')
  }

  async cancelScreening(_sessionId: string): Promise<void> {
    const isConfigured = await this.isConfigured()

    if (!isConfigured) {
      throw new Error('Plaid is not configured.')
    }

    // TODO: Implement cancellation
    throw new Error('Plaid Income Verification is not yet implemented.')
  }

  async getConsentUrl(sessionId: string): Promise<string | null> {
    // TODO: Return the Plaid Link URL for the applicant to complete
    // This would be generated when initiating screening
    console.log(`getConsentUrl called for session: ${sessionId}`)
    return null
  }
}
