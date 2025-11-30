/**
 * Payment Provider Factory
 *
 * Provides a unified interface for payment operations across different providers.
 * Currently supports Stripe, with architecture ready for Dwolla addition.
 */

import type { PaymentProvider, PaymentProviderType } from './types';

export * from './types';

// Provider configuration
interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  connectWebhookSecret?: string;
}

interface DwollaConfig {
  key: string;
  secret: string;
  environment: 'sandbox' | 'production';
}

interface ProviderConfig {
  stripe?: StripeConfig;
  dwolla?: DwollaConfig;
}

// Singleton instance
let defaultProvider: PaymentProvider | null = null;

/**
 * Initialize the payment provider with configuration
 */
export async function initializePaymentProvider(
  providerType: PaymentProviderType,
  config: ProviderConfig
): Promise<PaymentProvider> {
  switch (providerType) {
    case 'stripe': {
      if (!config.stripe) {
        throw new Error('Stripe configuration required');
      }

      // Dynamic import to avoid loading stripe unless needed
      const { StripePaymentProvider } = await import('./stripe');
      defaultProvider = new StripePaymentProvider(
        config.stripe.secretKey,
        config.stripe.webhookSecret,
        config.stripe.connectWebhookSecret
      );
      break;
    }

    case 'dwolla': {
      // Future implementation
      throw new Error('Dwolla provider not yet implemented. Use Stripe for now.');
    }

    default:
      throw new Error(`Unknown provider type: ${providerType}`);
  }

  return defaultProvider;
}

/**
 * Get the current payment provider instance
 * Auto-initializes from environment variables if not already initialized
 */
export function getPaymentProvider(): PaymentProvider {
  if (defaultProvider) {
    return defaultProvider;
  }

  // Auto-initialize from environment
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeConnectWebhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;

  if (!stripeSecretKey || !stripeWebhookSecret) {
    throw new Error(
      'Payment provider not configured. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET environment variables.'
    );
  }

  // Synchronous initialization for getPaymentProvider
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { StripePaymentProvider } = require('./stripe');
  const provider = new StripePaymentProvider(
    stripeSecretKey,
    stripeWebhookSecret,
    stripeConnectWebhookSecret
  );
  defaultProvider = provider;

  return provider;
}

/**
 * Reset the provider (useful for testing)
 */
export function resetPaymentProvider(): void {
  defaultProvider = null;
}

/**
 * Check if a provider is initialized
 */
export function isProviderInitialized(): boolean {
  return defaultProvider !== null;
}

/**
 * Get the current provider type
 */
export function getProviderType(): PaymentProviderType | null {
  return defaultProvider?.providerType ?? null;
}
