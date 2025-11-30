/**
 * Stripe Payment Provider Implementation
 *
 * Implements the PaymentProvider interface using Stripe Connect for rent collection.
 * Uses destination charges to route payments to landlord connected accounts.
 */

import Stripe from 'stripe';
import type {
  PaymentProvider,
  PaymentProviderType,
  CreateCustomerInput,
  CustomerResult,
  SetupSessionInput,
  SetupSessionResult,
  AttachPaymentMethodInput,
  PaymentMethodResult,
  CreatePaymentInput,
  PaymentResult,
  RefundInput,
  RefundResult,
  ConnectedAccountInput,
  ConnectedAccountResult,
  AccountStatusResult,
  BankLinkInput,
  BankLinkSessionResult,
  PayoutResult,
  WebhookEvent,
} from './types';
import {
  PaymentProviderError,
  PaymentDeclinedError,
  InsufficientFundsError,
  InvalidPaymentMethodError,
  AccountNotReadyError,
} from './types';

export class StripePaymentProvider implements PaymentProvider {
  readonly providerType: PaymentProviderType = 'stripe';
  private stripe: Stripe;
  private webhookSecret: string;
  private connectWebhookSecret?: string;

  constructor(
    secretKey: string,
    webhookSecret: string,
    connectWebhookSecret?: string
  ) {
    this.stripe = new Stripe(secretKey);
    this.webhookSecret = webhookSecret;
    this.connectWebhookSecret = connectWebhookSecret;
  }

  // ============================================================
  // CUSTOMER MANAGEMENT
  // ============================================================

  async createCustomer(input: CreateCustomerInput): Promise<CustomerResult> {
    try {
      const customer = await this.stripe.customers.create({
        email: input.email,
        name: input.name,
        phone: input.phone,
        metadata: {
          ...input.metadata,
          platform: 'happy_tenant',
        },
      });

      return {
        id: customer.id,
        providerCustomerId: customer.id,
        email: customer.email!,
        name: customer.name!,
        phone: customer.phone ?? undefined,
        defaultPaymentMethodId:
          typeof customer.invoice_settings?.default_payment_method === 'string'
            ? customer.invoice_settings.default_payment_method
            : customer.invoice_settings?.default_payment_method?.id,
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to create customer');
    }
  }

  async getCustomer(providerCustomerId: string): Promise<CustomerResult> {
    try {
      const customer = await this.stripe.customers.retrieve(providerCustomerId);

      if ('deleted' in customer && customer.deleted) {
        throw new PaymentProviderError(
          'Customer has been deleted',
          'customer_deleted',
          'stripe'
        );
      }

      // Type guard to ensure we have a non-deleted customer
      const cust = customer as Stripe.Customer;

      return {
        id: cust.id,
        providerCustomerId: cust.id,
        email: cust.email ?? '',
        name: cust.name ?? '',
        phone: cust.phone ?? undefined,
        defaultPaymentMethodId:
          typeof cust.invoice_settings?.default_payment_method === 'string'
            ? cust.invoice_settings.default_payment_method
            : (cust.invoice_settings?.default_payment_method as Stripe.PaymentMethod | null)?.id,
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to get customer');
    }
  }

  async updateCustomer(
    providerCustomerId: string,
    updates: Partial<CreateCustomerInput>
  ): Promise<CustomerResult> {
    try {
      const customer = await this.stripe.customers.update(providerCustomerId, {
        email: updates.email,
        name: updates.name,
        phone: updates.phone,
        metadata: updates.metadata,
      });

      return {
        id: customer.id,
        providerCustomerId: customer.id,
        email: customer.email!,
        name: customer.name ?? '',
        phone: customer.phone ?? undefined,
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to update customer');
    }
  }

  // ============================================================
  // PAYMENT METHODS
  // ============================================================

  async createSetupSession(input: SetupSessionInput): Promise<SetupSessionResult> {
    try {
      const paymentMethodTypes = input.paymentMethodTypes.map((t) =>
        t === 'us_bank_account' ? 'us_bank_account' : 'card'
      ) as ('us_bank_account' | 'card')[];

      const setupIntent = await this.stripe.setupIntents.create({
        customer: input.customerId,
        payment_method_types: paymentMethodTypes,
        payment_method_options: {
          us_bank_account: {
            financial_connections: {
              permissions: ['payment_method', 'balances'],
              prefetch: ['balances'],
            },
            verification_method: 'automatic',
          },
          card: {
            request_three_d_secure: 'automatic',
          },
        },
        usage: 'off_session',
        metadata: {
          ...input.metadata,
          platform: 'happy_tenant',
        },
      });

      return {
        sessionId: setupIntent.id,
        clientSecret: setupIntent.client_secret!,
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to create setup session');
    }
  }

  async attachPaymentMethod(
    input: AttachPaymentMethodInput
  ): Promise<PaymentMethodResult> {
    try {
      // Attach the payment method to the customer
      await this.stripe.paymentMethods.attach(input.paymentMethodId, {
        customer: input.customerId,
      });

      // Set as default if requested
      if (input.setAsDefault) {
        await this.stripe.customers.update(input.customerId, {
          invoice_settings: {
            default_payment_method: input.paymentMethodId,
          },
        });
      }

      return this.getPaymentMethod(input.paymentMethodId);
    } catch (error) {
      throw this.handleError(error, 'Failed to attach payment method');
    }
  }

  async listPaymentMethods(
    providerCustomerId: string
  ): Promise<PaymentMethodResult[]> {
    try {
      const [cardMethods, bankMethods] = await Promise.all([
        this.stripe.paymentMethods.list({
          customer: providerCustomerId,
          type: 'card',
        }),
        this.stripe.paymentMethods.list({
          customer: providerCustomerId,
          type: 'us_bank_account',
        }),
      ]);

      // Get customer to check default payment method
      const customer = await this.stripe.customers.retrieve(providerCustomerId);
      const defaultPmId =
        !('deleted' in customer) &&
        typeof customer.invoice_settings?.default_payment_method === 'string'
          ? customer.invoice_settings.default_payment_method
          : undefined;

      const allMethods = [...cardMethods.data, ...bankMethods.data];

      return allMethods.map((pm) => this.mapPaymentMethod(pm, pm.id === defaultPmId));
    } catch (error) {
      throw this.handleError(error, 'Failed to list payment methods');
    }
  }

  async getPaymentMethod(
    providerPaymentMethodId: string
  ): Promise<PaymentMethodResult> {
    try {
      const pm = await this.stripe.paymentMethods.retrieve(providerPaymentMethodId);
      return this.mapPaymentMethod(pm, false);
    } catch (error) {
      throw this.handleError(error, 'Failed to get payment method');
    }
  }

  async detachPaymentMethod(providerPaymentMethodId: string): Promise<void> {
    try {
      await this.stripe.paymentMethods.detach(providerPaymentMethodId);
    } catch (error) {
      throw this.handleError(error, 'Failed to detach payment method');
    }
  }

  async setDefaultPaymentMethod(
    providerCustomerId: string,
    providerPaymentMethodId: string
  ): Promise<void> {
    try {
      await this.stripe.customers.update(providerCustomerId, {
        invoice_settings: {
          default_payment_method: providerPaymentMethodId,
        },
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to set default payment method');
    }
  }

  // ============================================================
  // PAYMENTS
  // ============================================================

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    try {
      // Convert dollars to cents
      const amountInCents = Math.round(input.amount * 100);
      const feeInCents = input.applicationFeeAmount
        ? Math.round(input.applicationFeeAmount * 100)
        : undefined;

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: input.currency,
        customer: input.customerId,
        payment_method: input.paymentMethodId,
        off_session: true,
        confirm: true,
        transfer_data: {
          destination: input.destinationAccountId,
        },
        application_fee_amount: feeInCents,
        metadata: {
          ...input.metadata,
          platform: 'happy_tenant',
        },
        statement_descriptor: input.statementDescriptor?.substring(0, 22),
        description: input.description,
      });

      return this.mapPaymentIntent(paymentIntent);
    } catch (error) {
      throw this.handleError(error, 'Failed to create payment');
    }
  }

  async getPayment(providerPaymentId: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        providerPaymentId,
        {
          expand: ['latest_charge'],
        }
      );

      return this.mapPaymentIntent(paymentIntent);
    } catch (error) {
      throw this.handleError(error, 'Failed to get payment');
    }
  }

  async refundPayment(input: RefundInput): Promise<RefundResult> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: input.paymentId,
        amount: input.amount ? Math.round(input.amount * 100) : undefined,
        reason: input.reason,
        metadata: input.metadata,
        reverse_transfer: true, // Reverse the transfer to connected account
        refund_application_fee: true, // Refund the platform fee
      });

      return {
        id: refund.id,
        providerRefundId: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: this.mapRefundStatus(refund.status),
        reason: refund.reason ?? undefined,
        failureReason: refund.failure_reason ?? undefined,
        createdAt: new Date(refund.created * 1000),
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to refund payment');
    }
  }

  // ============================================================
  // CONNECTED ACCOUNTS (LANDLORDS)
  // ============================================================

  async createConnectedAccount(
    input: ConnectedAccountInput
  ): Promise<ConnectedAccountResult> {
    try {
      const businessType = input.businessType;

      const account = await this.stripe.accounts.create({
        type: 'express',
        country: input.country,
        email: input.email,
        business_type: businessType,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
          us_bank_account_ach_payments: { requested: true },
        },
        business_profile: {
          mcc: '6513', // Real Estate Agents and Managers
          name: input.businessName,
          product_description: 'Property management and rent collection',
          url: process.env.NEXT_PUBLIC_APP_URL,
        },
        settings: {
          payouts: {
            schedule: {
              delay_days: 7,
              interval: 'daily',
            },
          },
        },
        metadata: {
          ...input.metadata,
          platform: 'happy_tenant',
        },
      });

      return this.mapConnectedAccount(account);
    } catch (error) {
      throw this.handleError(error, 'Failed to create connected account');
    }
  }

  async getOnboardingUrl(
    providerAccountId: string,
    refreshUrl: string,
    returnUrl: string
  ): Promise<string> {
    try {
      const accountLink = await this.stripe.accountLinks.create({
        account: providerAccountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return accountLink.url;
    } catch (error) {
      throw this.handleError(error, 'Failed to get onboarding URL');
    }
  }

  async getExpressDashboardUrl(providerAccountId: string): Promise<string> {
    try {
      const loginLink = await this.stripe.accounts.createLoginLink(
        providerAccountId
      );

      return loginLink.url;
    } catch (error) {
      throw this.handleError(error, 'Failed to get Express Dashboard URL');
    }
  }

  async getAccountStatus(providerAccountId: string): Promise<AccountStatusResult> {
    try {
      const account = await this.stripe.accounts.retrieve(providerAccountId);

      return {
        providerAccountId: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        currentlyDue: account.requirements?.currently_due ?? [],
        eventuallyDue: account.requirements?.eventually_due ?? [],
        pastDue: account.requirements?.past_due ?? [],
        disabledReason: account.requirements?.disabled_reason ?? undefined,
        capabilities: {
          cardPayments: (account.capabilities?.card_payments ?? 'inactive') as 'inactive' | 'pending' | 'active',
          transfers: (account.capabilities?.transfers ?? 'inactive') as 'inactive' | 'pending' | 'active',
          usBankAccountAchPayments: (account.capabilities?.us_bank_account_ach_payments ?? 'inactive') as 'inactive' | 'pending' | 'active',
        },
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to get account status');
    }
  }

  async updatePayoutSchedule(
    providerAccountId: string,
    delayDays: number
  ): Promise<void> {
    try {
      await this.stripe.accounts.update(providerAccountId, {
        settings: {
          payouts: {
            schedule: {
              delay_days: delayDays,
              interval: 'daily',
            },
          },
        },
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to update payout schedule');
    }
  }

  // ============================================================
  // BANK LINKING
  // ============================================================

  async createBankLinkSession(
    input: BankLinkInput
  ): Promise<BankLinkSessionResult> {
    try {
      // Use SetupIntent with Financial Connections for bank linking
      const setupIntent = await this.stripe.setupIntents.create({
        customer: input.customerId,
        payment_method_types: ['us_bank_account'],
        payment_method_options: {
          us_bank_account: {
            financial_connections: {
              permissions: ['payment_method', 'balances'],
              prefetch: ['balances'],
            },
            verification_method: 'automatic',
          },
        },
        usage: 'off_session',
        metadata: {
          ...input.metadata,
          platform: 'happy_tenant',
        },
      });

      return {
        sessionId: setupIntent.id,
        clientSecret: setupIntent.client_secret!,
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to create bank link session');
    }
  }

  // ============================================================
  // PAYOUTS
  // ============================================================

  async getPayout(
    providerPayoutId: string,
    connectedAccountId?: string
  ): Promise<PayoutResult> {
    try {
      const payout = connectedAccountId
        ? await this.stripe.payouts.retrieve(providerPayoutId, {
            stripeAccount: connectedAccountId,
          })
        : await this.stripe.payouts.retrieve(providerPayoutId);

      return {
        id: payout.id,
        providerPayoutId: payout.id,
        amount: payout.amount / 100,
        currency: payout.currency,
        status: this.mapPayoutStatus(payout.status),
        expectedArrivalDate: new Date(payout.arrival_date * 1000),
        arrivedAt:
          payout.status === 'paid' ? new Date(payout.arrival_date * 1000) : undefined,
        failureCode: payout.failure_code ?? undefined,
        failureMessage: payout.failure_message ?? undefined,
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to get payout');
    }
  }

  // ============================================================
  // WEBHOOKS
  // ============================================================

  async verifyWebhook(payload: string, signature: string): Promise<WebhookEvent> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      return {
        id: event.id,
        type: event.type,
        data: event.data.object,
        createdAt: new Date(event.created * 1000),
      };
    } catch (error) {
      throw new PaymentProviderError(
        'Invalid webhook signature',
        'webhook_signature_invalid',
        'stripe',
        error
      );
    }
  }

  async verifyConnectWebhook(
    payload: string,
    signature: string
  ): Promise<WebhookEvent> {
    if (!this.connectWebhookSecret) {
      throw new PaymentProviderError(
        'Connect webhook secret not configured',
        'configuration_error',
        'stripe'
      );
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.connectWebhookSecret
      );

      return {
        id: event.id,
        type: event.type,
        data: event.data.object,
        createdAt: new Date(event.created * 1000),
      };
    } catch (error) {
      throw new PaymentProviderError(
        'Invalid Connect webhook signature',
        'webhook_signature_invalid',
        'stripe',
        error
      );
    }
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  private mapPaymentMethod(
    pm: Stripe.PaymentMethod,
    isDefault: boolean
  ): PaymentMethodResult {
    const base = {
      id: pm.id,
      providerPaymentMethodId: pm.id,
      isDefault,
      createdAt: new Date(pm.created * 1000),
    };

    if (pm.type === 'us_bank_account' && pm.us_bank_account) {
      return {
        ...base,
        type: 'us_bank_account',
        bankName: pm.us_bank_account.bank_name ?? undefined,
        bankAccountLast4: pm.us_bank_account.last4 ?? undefined,
        bankAccountType: pm.us_bank_account.account_type as 'checking' | 'savings' | undefined,
        verificationStatus: 'instant_verified', // Financial Connections provides instant verification
      };
    }

    if (pm.type === 'card' && pm.card) {
      const wallet = pm.card.wallet;

      return {
        ...base,
        type: wallet?.type === 'apple_pay' ? 'apple_pay' : wallet?.type === 'google_pay' ? 'google_pay' : 'card',
        cardBrand: pm.card.brand ?? undefined,
        cardLast4: pm.card.last4 ?? undefined,
        cardExpMonth: pm.card.exp_month,
        cardExpYear: pm.card.exp_year,
        cardFunding: pm.card.funding as 'credit' | 'debit' | 'prepaid' | 'unknown' | undefined,
        walletType: wallet?.type as 'apple_pay' | 'google_pay' | undefined,
      };
    }

    return {
      ...base,
      type: 'card', // Fallback
    };
  }

  private mapPaymentIntent(pi: Stripe.PaymentIntent): PaymentResult {
    const charge = pi.latest_charge as Stripe.Charge | null;

    return {
      id: pi.id,
      providerPaymentId: pi.id,
      amount: pi.amount / 100,
      currency: pi.currency,
      status: this.mapPaymentStatus(pi.status),
      stripeFee: charge?.balance_transaction
        ? undefined // Would need to fetch balance transaction for fee
        : undefined,
      platformFee: pi.application_fee_amount
        ? pi.application_fee_amount / 100
        : undefined,
      netAmount:
        pi.amount_received && pi.application_fee_amount
          ? (pi.amount_received - pi.application_fee_amount) / 100
          : undefined,
      transferId: pi.transfer_data?.destination as string | undefined,
      failureCode: pi.last_payment_error?.code ?? undefined,
      failureMessage: pi.last_payment_error?.message ?? undefined,
      receiptUrl: charge?.receipt_url ?? undefined,
      createdAt: new Date(pi.created * 1000),
    };
  }

  private mapConnectedAccount(account: Stripe.Account): ConnectedAccountResult {
    return {
      id: account.id,
      providerAccountId: account.id,
      email: account.email ?? '',
      businessType: account.business_type as 'individual' | 'company',
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      currentlyDue: account.requirements?.currently_due ?? [],
      eventuallyDue: account.requirements?.eventually_due ?? [],
      pastDue: account.requirements?.past_due ?? [],
      disabledReason: account.requirements?.disabled_reason ?? undefined,
      createdAt: new Date((account.created ?? Date.now() / 1000) * 1000),
    };
  }

  private mapPaymentStatus(
    status: Stripe.PaymentIntent.Status
  ): 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' {
    switch (status) {
      case 'succeeded':
        return 'succeeded';
      case 'processing':
        return 'processing';
      case 'canceled':
        return 'canceled';
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
      case 'requires_capture':
        return 'pending';
      default:
        return 'pending';
    }
  }

  private mapRefundStatus(
    status: string | null
  ): 'pending' | 'succeeded' | 'failed' | 'canceled' {
    switch (status) {
      case 'succeeded':
        return 'succeeded';
      case 'failed':
        return 'failed';
      case 'canceled':
        return 'canceled';
      case 'pending':
      case 'requires_action':
      default:
        return 'pending';
    }
  }

  private mapPayoutStatus(
    status: string
  ): 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled' {
    switch (status) {
      case 'paid':
        return 'paid';
      case 'pending':
        return 'pending';
      case 'in_transit':
        return 'in_transit';
      case 'failed':
        return 'failed';
      case 'canceled':
        return 'canceled';
      default:
        return 'pending';
    }
  }

  private handleError(error: unknown, context: string): PaymentProviderError {
    if (error instanceof Stripe.errors.StripeError) {
      // Handle specific Stripe errors
      switch (error.code) {
        case 'card_declined':
          return new PaymentDeclinedError(
            error.message,
            error.decline_code ?? 'unknown',
            'stripe',
            error
          );
        case 'insufficient_funds':
          return new InsufficientFundsError('stripe', error);
        case 'invalid_payment_method':
        case 'payment_method_not_available':
        case 'expired_card':
          return new InvalidPaymentMethodError('stripe', error);
        default:
          return new PaymentProviderError(
            `${context}: ${error.message}`,
            error.code ?? 'unknown',
            'stripe',
            error
          );
      }
    }

    if (error instanceof PaymentProviderError) {
      return error;
    }

    return new PaymentProviderError(
      `${context}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'unknown',
      'stripe',
      error
    );
  }
}
