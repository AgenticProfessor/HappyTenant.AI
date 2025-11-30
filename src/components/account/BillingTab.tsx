'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Check,
  Download,
  Sparkles,
  Calendar,
  ChevronRight,
  Building2,
  FileText,
  Star,
  Zap,
  Shield,
  ArrowRight,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

// Mock data
const mockBillingMethod = {
  type: 'card',
  brand: 'Visa',
  last4: '4242',
  expMonth: 12,
  expYear: 2025,
};

const mockSubscription = {
  plan: 'PRO',
  status: 'active',
  price: 12,
  billingPeriod: 'monthly',
  nextBillingDate: '2024-12-28',
  features: [
    'Unlimited properties',
    'ACH fee waived',
    'Priority support',
    'Advanced analytics',
    'Custom branding',
  ],
};

const mockReceipts = [
  {
    id: 'inv_1',
    date: '2024-11-28',
    description: 'Pro Plan - Monthly',
    amount: 12.0,
    status: 'paid',
  },
  {
    id: 'inv_2',
    date: '2024-10-28',
    description: 'Pro Plan - Monthly',
    amount: 12.0,
    status: 'paid',
  },
  {
    id: 'inv_3',
    date: '2024-09-28',
    description: 'Pro Plan - Monthly',
    amount: 12.0,
    status: 'paid',
  },
  {
    id: 'inv_4',
    date: '2024-08-28',
    description: 'Pro Plan - Monthly',
    amount: 12.0,
    status: 'paid',
  },
  {
    id: 'inv_5',
    date: '2024-07-28',
    description: 'Pro Plan - Monthly',
    amount: 12.0,
    status: 'paid',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function BillingTab() {
  const [billingMethod] = useState(mockBillingMethod);
  const [subscription] = useState(mockSubscription);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Billing Method */}
      <motion.section
        variants={itemVariants}
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <CreditCard className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Billing Method
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Manage your payment method for subscription billing
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {billingMethod ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-14 w-20 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 dark:from-zinc-700 dark:to-zinc-800 shadow-lg">
                  <div className="text-white">
                    <div className="text-[10px] font-medium opacity-60 mb-1">
                      {billingMethod.brand.toUpperCase()}
                    </div>
                    <div className="text-xs font-medium tracking-wider">
                      •••• {billingMethod.last4}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {billingMethod.brand} ending in {billingMethod.last4}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Expires {billingMethod.expMonth}/{billingMethod.expYear}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline">Update Card</Button>
                <Button variant="ghost" className="text-red-600 dark:text-red-400">
                  Remove Card
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500 dark:text-zinc-400 mb-4">
                No payment method on file
              </p>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Add Payment Method
              </Button>
            </div>
          )}
        </div>
      </motion.section>

      {/* Subscription Plan */}
      <motion.section
        variants={itemVariants}
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Subscription Plan
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Manage your Happy Tenant subscription
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Current Plan */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm px-3 py-1">
                  <Star className="h-3.5 w-3.5 mr-1 fill-white" />
                  PRO
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                >
                  Active
                </Badge>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-zinc-900 dark:text-white">
                    ${subscription.price}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">/month</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Next billing date: {formatDate(subscription.nextBillingDate)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  What&apos;s included:
                </p>
                <ul className="space-y-2">
                  {subscription.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="lg:w-72 space-y-3">
              <Button variant="outline" className="w-full justify-between">
                Manage Plan
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                View Plan Comparison
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-between text-red-600 dark:text-red-400"
              >
                Cancel Subscription
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Accounting Add-on Upsell */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-xl border border-violet-200 dark:border-violet-800/50 bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-violet-950/20 dark:via-zinc-900 dark:to-indigo-950/20"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-400/20 to-indigo-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    Accounting Subscription
                  </h3>
                  <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                    <Zap className="h-3 w-3 mr-1" />
                    Add-on
                  </Badge>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md">
                  Full-featured accounting with bank reconciliation, expense tracking,
                  and tax-ready reports designed for property managers.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                    $15
                  </span>
                  <span className="text-sm text-zinc-500">/month</span>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/20">
                Learn More
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Receipts */}
      <motion.section
        variants={itemVariants}
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Receipt className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Receipts
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Download receipts for your records
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[140px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right w-[100px]">Amount</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReceipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">
                    {formatDate(receipt.date)}
                  </TableCell>
                  <TableCell>{receipt.description}</TableCell>
                  <TableCell className="text-right">
                    ${receipt.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'capitalize',
                        receipt.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      )}
                    >
                      {receipt.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4 text-zinc-400 hover:text-zinc-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {mockReceipts.length > 5 && (
          <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <Button variant="ghost" className="text-indigo-600 dark:text-indigo-400">
              View All Receipts
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}
