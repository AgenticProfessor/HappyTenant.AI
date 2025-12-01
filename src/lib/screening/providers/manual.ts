/**
 * Manual Screening Provider
 * Allows landlords to enter screening results manually
 * (from their own screening service or in-person verification)
 */

import type {
  ScreeningProvider,
  ApplicantData,
  ScreeningSession,
  ScreeningResults,
} from '../types'

export class ManualScreeningProvider implements ScreeningProvider {
  name = 'Manual Entry'
  code = 'manual'

  async isConfigured(): Promise<boolean> {
    // Manual entry is always available
    return true
  }

  async initiateScreening(
    applicationId: string,
    _applicantData: ApplicantData
  ): Promise<ScreeningSession> {
    // For manual entry, we just create a "pending" session
    // that the landlord will fill in manually
    return {
      sessionId: `manual_${applicationId}_${Date.now()}`,
      provider: this.code,
      status: 'pending',
    }
  }

  async getResults(_sessionId: string): Promise<ScreeningResults> {
    // Manual results are stored in the database, not fetched from provider
    throw new Error(
      'Manual screening results should be retrieved from the database, not from this provider'
    )
  }

  async cancelScreening(_sessionId: string): Promise<void> {
    // Nothing to cancel for manual entry
  }
}
