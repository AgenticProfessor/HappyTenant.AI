/**
 * Payment Provider Abstraction Layer
 *
 * This module defines the interface for payment providers (Stripe, Dwolla, etc.)
 * allowing the platform to switch providers or add redundancy without changing
 * business logic.
 */

export type PaymentProviderType = 'stripe' | 'dwolla';

// ============================================================
// INPUT TYPES
// ============================================================

export interface CreateCustomerInput {
  email: string;
  name: string;
  phone?: string;
  metadata?: Record<string, string>;
}

export interface SetupSessionInput {
  customerId: string;
  paymentMethodTypes: ('card' | 'us_bank_account')[];
  returnUrl?: string;
  metadata?: Record<string, string>;
}

export interface AttachPaymentMethodInput {
  customerId: string;
  paymentMethodId: string;
  setAsDefault?: boolean;
}

export interface CreatePaymentInput {
  amount: number; // In dollars (not cents)
  currency: string;
  customerId: string;
  paymentMethodId: string;
  destinationAccountId: string; // Connected account for destination charges
  applicationFeeAmount?: number; // Platform fee in dollars
  metadata?: Record<string, string>;
  statementDescriptor?: string;
  description?: string;
}

export interface RefundInput {
  paymentId: string;
  amount?: number; // Partial refund amount in dollars (omit for full refund)
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  metadata?: Record<string, string>;
}

export interface ConnectedAccountInput {
  email: string;
  businessType: 'individual' | 'company';
  businessStructure?: 'llc' | 'limited_partnership' | 's_corporation' | 'corporation' | 'trust';
  country: string;
  businessName?: string;
  metadata?: Record<string, string>;
}

export interface BankLinkInput {
  customerId: string;
  returnUrl: string;
  metadata?: Record<string, string>;
}

// ============================================================
// RESULT TYPES
// ============================================================

export interface CustomerResult {
  id: string;
  providerCustomerId: string;
  email: string;
  name: string;
  phone?: string;
  defaultPaymentMethodId?: string;
}

export interface SetupSessionResult {
  sessionId: string;
  clientSecret: string;
  expiresAt?: Date;
}

export interface PaymentMethodResult {
  id: string;
  providerPaymentMethodId: string;
  type: 'us_bank_account' | 'card' | 'apple_pay' | 'google_pay';

  // Bank account details
  bankName?: string;
  bankAccountLast4?: string;
  bankAccountType?: 'checking' | 'savings';
  verificationStatus?: 'pending' | 'verified' | 'failed' | 'instant_verified';

  // Card details
  cardBrand?: string;
  cardLast4?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  cardFunding?: 'credit' | 'debit' | 'prepaid' | 'unknown';

  // Wallet details
  walletType?: 'apple_pay' | 'google_pay';

  isDefault: boolean;
  createdAt: Date;
}

export interface PaymentResult {
  id: string;
  providerPaymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';

  // Fee breakdown
  stripeFee?: number;
  platformFee?: number;
  netAmount?: number;

  // Transfer details
  transferId?: string;
  transferredAt?: Date;

  // Failure details
  failureCode?: string;
  failureMessage?: string;

  // Receipt
  receiptUrl?: string;

  createdAt: Date;
}

export interface RefundResult {
  id: string;
  providerRefundId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  reason?: string;
  failureReason?: string;
  createdAt: Date;
}

export interface ConnectedAccountResult {
  id: string;
  providerAccountId: string;
  email: string;
  businessType: 'individual' | 'company';

  // Capabilities
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;

  // Requirements
  currentlyDue: string[];
  eventuallyDue: string[];
  pastDue: string[];
  disabledReason?: string;

  // Default bank account
  defaultBankAccountId?: string;
  defaultBankAccountLast4?: string;
  defaultBankAccountBankName?: string;

  createdAt: Date;
}

export interface AccountStatusResult {
  providerAccountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  currentlyDue: string[];
  eventuallyDue: string[];
  pastDue: string[];
  disabledReason?: string;
  capabilities: {
    cardPayments: 'inactive' | 'pending' | 'active';
    transfers: 'inactive' | 'pending' | 'active';
    usBankAccountAchPayments: 'inactive' | 'pending' | 'active';
  };
}

export interface BankLinkSessionResult {
  sessionId: string;
  clientSecret: string;
  expiresAt?: Date;
}

export interface PayoutResult {
  id: string;
  providerPayoutId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled';
  expectedArrivalDate?: Date;
  arrivedAt?: Date;
  failureCode?: string;
  failureMessage?: string;
  destinationBankLast4?: string;
  destinationBankName?: string;
}

// ============================================================
// WEBHOOK TYPES
// ============================================================

export interface WebhookEvent {
  id: string;
  type: string;
  data: unknown;
  createdAt: Date;
}

export type WebhookEventType =
  // Payment lifecycle
  | 'payment.succeeded'
  | 'payment.failed'
  | 'payment.processing'
  | 'payment.canceled'
  | 'payment.refunded'

  // Setup intents
  | 'setup_intent.succeeded'
  | 'setup_intent.failed'

  // Disputes
  | 'dispute.created'
  | 'dispute.closed'

  // Payouts
  | 'payout.created'
  | 'payout.paid'
  | 'payout.failed'

  // Connected accounts
  | 'account.updated'
  | 'account.deauthorized'

  // Financial connections
  | 'financial_connections.account.created'
  | 'financial_connections.account.deactivated';

// ============================================================
// PROVIDER INTERFACE
// ============================================================

export interface PaymentProvider {
  readonly providerType: PaymentProviderType;

  // ============================================================
  // CUSTOMER MANAGEMENT
  // ============================================================

  /**
   * Create a new customer in the payment provider
   */
  createCustomer(input: CreateCustomerInput): Promise<CustomerResult>;

  /**
   * Retrieve customer details from the payment provider
   */
  getCustomer(providerCustomerId: string): Promise<CustomerResult>;

  /**
   * Update customer details
   */
  updateCustomer(
    providerCustomerId: string,
    updates: Partial<CreateCustomerInput>
  ): Promise<CustomerResult>;

  // ============================================================
  // PAYMENT METHODS
  // ============================================================

  /**
   * Create a setup session for adding a new payment method
   * Returns a client secret for the frontend to complete setup
   */
  createSetupSession(input: SetupSessionInput): Promise<SetupSessionResult>;

  /**
   * Attach a payment method to a customer
   */
  attachPaymentMethod(input: AttachPaymentMethodInput): Promise<PaymentMethodResult>;

  /**
   * List all payment methods for a customer
   */
  listPaymentMethods(providerCustomerId: string): Promise<PaymentMethodResult[]>;

  /**
   * Get details of a specific payment method
   */
  getPaymentMethod(providerPaymentMethodId: string): Promise<PaymentMethodResult>;

  /**
   * Remove a payment method from a customer
   */
  detachPaymentMethod(providerPaymentMethodId: string): Promise<void>;

  /**
   * Set a payment method as the default for a customer
   */
  setDefaultPaymentMethod(
    providerCustomerId: string,
    providerPaymentMethodId: string
  ): Promise<void>;

  // ============================================================
  // PAYMENTS
  // ============================================================

  /**
   * Create and confirm a payment (destination charge to connected account)
   */
  createPayment(input: CreatePaymentInput): Promise<PaymentResult>;

  /**
   * Retrieve payment details
   */
  getPayment(providerPaymentId: string): Promise<PaymentResult>;

  /**
   * Refund a payment (full or partial)
   */
  refundPayment(input: RefundInput): Promise<RefundResult>;

  // ============================================================
  // CONNECTED ACCOUNTS (LANDLORDS)
  // ============================================================

  /**
   * Create a new connected account for a landlord/organization
   */
  createConnectedAccount(input: ConnectedAccountInput): Promise<ConnectedAccountResult>;

  /**
   * Get the onboarding URL for a connected account
   */
  getOnboardingUrl(
    providerAccountId: string,
    refreshUrl: string,
    returnUrl: string
  ): Promise<string>;

  /**
   * Get the login link for Express Dashboard
   */
  getExpressDashboardUrl(providerAccountId: string): Promise<string>;

  /**
   * Retrieve connected account status and requirements
   */
  getAccountStatus(providerAccountId: string): Promise<AccountStatusResult>;

  /**
   * Update connected account payout schedule
   */
  updatePayoutSchedule(
    providerAccountId: string,
    delayDays: number
  ): Promise<void>;

  // ============================================================
  // BANK LINKING
  // ============================================================

  /**
   * Create a bank link session for instant account verification
   */
  createBankLinkSession(input: BankLinkInput): Promise<BankLinkSessionResult>;

  // ============================================================
  // PAYOUTS
  // ============================================================

  /**
   * Get payout details
   */
  getPayout(providerPayoutId: string, connectedAccountId?: string): Promise<PayoutResult>;

  // ============================================================
  // WEBHOOKS
  // ============================================================

  /**
   * Verify and parse a webhook payload
   */
  verifyWebhook(payload: string, signature: string): Promise<WebhookEvent>;

  /**
   * Verify webhook specifically for connected account events
   */
  verifyConnectWebhook?(payload: string, signature: string): Promise<WebhookEvent>;
}

// ============================================================
// PROVIDER ERRORS
// ============================================================

export class PaymentProviderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly providerType: PaymentProviderType,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'PaymentProviderError';
  }
}

export class PaymentDeclinedError extends PaymentProviderError {
  constructor(
    message: string,
    public readonly declineCode: string,
    providerType: PaymentProviderType,
    originalError?: unknown
  ) {
    super(message, 'payment_declined', providerType, originalError);
    this.name = 'PaymentDeclinedError';
  }
}

export class InsufficientFundsError extends PaymentProviderError {
  constructor(providerType: PaymentProviderType, originalError?: unknown) {
    super('Insufficient funds in account', 'insufficient_funds', providerType, originalError);
    this.name = 'InsufficientFundsError';
  }
}

export class InvalidPaymentMethodError extends PaymentProviderError {
  constructor(providerType: PaymentProviderType, originalError?: unknown) {
    super('Payment method is invalid or expired', 'invalid_payment_method', providerType, originalError);
    this.name = 'InvalidPaymentMethodError';
  }
}

export class AccountNotReadyError extends PaymentProviderError {
  constructor(
    message: string,
    public readonly requirements: string[],
    providerType: PaymentProviderType,
    originalError?: unknown
  ) {
    super(message, 'account_not_ready', providerType, originalError);
    this.name = 'AccountNotReadyError';
  }
}
