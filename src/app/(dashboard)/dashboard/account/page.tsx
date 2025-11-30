'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Banknote,
  CreditCard,
  Settings2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccountTab } from '@/components/account/AccountTab';
import { RentPaymentsTab } from '@/components/account/RentPaymentsTab';
import { BillingTab } from '@/components/account/BillingTab';
import { AdvancedTab } from '@/components/account/AdvancedTab';

// Tab configuration
const tabs = [
  { id: 'account', label: 'ACCOUNT', icon: User },
  { id: 'rent-payments', label: 'RENT PAYMENTS', icon: Banknote },
  { id: 'billing', label: 'BILLING', icon: CreditCard },
  { id: 'advanced', label: 'ADVANCED', icon: Settings2 },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function AccountSettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = (searchParams.get('tab') as TabId) || 'account';
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    router.push(`/dashboard/account?tab=${tabId}`, { scroll: false });
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Page Header with subtle gradient */}
      <div className="relative mb-8">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50/50 via-transparent to-violet-50/30 dark:from-indigo-950/20 dark:to-violet-950/10 rounded-2xl" />

        <div className="flex items-center justify-between py-6 px-1">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                Account Settings
              </h1>
              {/* Subtle Steward AI branding */}
              <div className="group relative">
                <div className="flex items-center justify-center h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm cursor-help">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Powered by Steward AI
                  <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-zinc-900 dark:bg-zinc-100 rotate-45" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800" aria-label="Account settings tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <tab.icon className="h-4 w-4" />
                <span className="tracking-wide">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'account' && <AccountTab />}
          {activeTab === 'rent-payments' && <RentPaymentsTab />}
          {activeTab === 'billing' && <BillingTab />}
          {activeTab === 'advanced' && <AdvancedTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
