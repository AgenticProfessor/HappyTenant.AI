/**
 * Screening Provider Factory
 * Central point for accessing tenant screening services
 */

import type { ScreeningProvider, ScreeningProviderFactory } from './types'
import { ManualScreeningProvider } from './providers/manual'
import { TransUnionProvider } from './providers/transunion'
import { PlaidIncomeProvider } from './providers/plaid'

// Initialize all providers
const providers: Record<string, ScreeningProvider> = {
  manual: new ManualScreeningProvider(),
  transunion: new TransUnionProvider(),
  plaid: new PlaidIncomeProvider(),
}

export const screeningFactory: ScreeningProviderFactory = {
  getProvider(providerCode: string): ScreeningProvider {
    const provider = providers[providerCode]
    if (!provider) {
      throw new Error(`Unknown screening provider: ${providerCode}`)
    }
    return provider
  },

  async getAvailableProviders(): Promise<
    Array<{ code: string; name: string; isConfigured: boolean }>
  > {
    const results = await Promise.all(
      Object.entries(providers).map(async ([code, provider]) => ({
        code,
        name: provider.name,
        isConfigured: await provider.isConfigured(),
      }))
    )
    return results
  },
}

// Export types
export * from './types'

// Export individual providers for direct use
export { ManualScreeningProvider } from './providers/manual'
export { TransUnionProvider } from './providers/transunion'
export { PlaidIncomeProvider } from './providers/plaid'
