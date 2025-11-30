import { Metadata } from 'next';
import { ACHDisclosure } from '@/components/payments/disclosures/ACHDisclosure';
import { FinancialConnectionsDisclosure } from '@/components/payments/disclosures/FinancialConnectionsDisclosure';
import { PaymentTerms } from '@/components/payments/disclosures/PaymentTerms';

export const metadata: Metadata = {
  title: 'Payment Policies | Happy Tenant',
  description: 'ACH authorization, bank connection privacy, and payment terms of service.',
};

export default function PaymentPoliciesPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-3">
            Payment Policies & Disclosures
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Important information about how we process payments, protect your financial
            data, and the terms governing our payment services.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Quick Navigation */}
        <nav className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
            On this page
          </h2>
          <ul className="space-y-2">
            <li>
              <a
                href="#payment-terms"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Payment Terms of Service
              </a>
            </li>
            <li>
              <a
                href="#ach-authorization"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                ACH Authorization & Disclosure
              </a>
            </li>
            <li>
              <a
                href="#bank-connection"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Bank Connection Privacy Notice
              </a>
            </li>
          </ul>
        </nav>

        {/* Payment Terms */}
        <section id="payment-terms">
          <PaymentTerms variant="full" />
        </section>

        {/* ACH Authorization */}
        <section id="ach-authorization">
          <ACHDisclosure landlordName="[Your Property Manager]" variant="full" />
        </section>

        {/* Bank Connection Privacy */}
        <section id="bank-connection">
          <FinancialConnectionsDisclosure variant="full" />
        </section>

        {/* Contact Section */}
        <section className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            Questions About Payments?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-zinc-900 dark:text-white mb-1">Email</p>
              <a
                href="mailto:payments@happytenant.com"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                payments@happytenant.com
              </a>
            </div>
            <div>
              <p className="font-medium text-zinc-900 dark:text-white mb-1">Phone</p>
              <a
                href="tel:1-800-427-7982"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                1-800-HAPPY-TENANT
              </a>
            </div>
            <div>
              <p className="font-medium text-zinc-900 dark:text-white mb-1">Hours</p>
              <p className="text-zinc-600 dark:text-zinc-400">Mon-Fri, 9am-6pm ET</p>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <p className="text-xs text-center text-zinc-400 dark:text-zinc-500 py-4">
          Last updated: November 2024. These policies are subject to change. Material
          changes will be communicated via email.
        </p>
      </div>
    </div>
  );
}
