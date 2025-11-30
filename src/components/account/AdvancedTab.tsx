'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plug,
  Key,
  Download,
  Trash2,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Check,
  AlertTriangle,
  RefreshCw,
  Settings2,
  FileJson,
  FileSpreadsheet,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Mock data
const mockIntegrations = [
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync transactions and accounting data',
    icon: '/integrations/quickbooks.svg',
    connected: true,
    lastSynced: '2024-11-28T10:30:00Z',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and payouts',
    icon: '/integrations/stripe.svg',
    connected: true,
    lastSynced: '2024-11-28T14:00:00Z',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync maintenance schedules and showings',
    icon: '/integrations/google.svg',
    connected: false,
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect to 5,000+ apps',
    icon: '/integrations/zapier.svg',
    connected: false,
  },
];

const mockApiKeys = [
  {
    id: 'key_1',
    name: 'Production API Key',
    prefix: 'pk_live_',
    last4: 'x7Kn',
    createdAt: '2024-10-15T08:00:00Z',
    lastUsed: '2024-11-28T12:30:00Z',
    expiresAt: null,
  },
  {
    id: 'key_2',
    name: 'Development Key',
    prefix: 'pk_test_',
    last4: 'a9Bc',
    createdAt: '2024-11-01T14:00:00Z',
    lastUsed: '2024-11-20T09:00:00Z',
    expiresAt: '2025-02-01T00:00:00Z',
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

export function AdvancedTab() {
  const [integrations] = useState(mockIntegrations);
  const [apiKeys] = useState(mockApiKeys);
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyKey = (keyId: string) => {
    navigator.clipboard.writeText(`pk_live_xxxxxxxxxxxxxxxxxxxx${keyId}`);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Integrations */}
      <motion.section
        variants={itemVariants}
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <Plug className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Integrations
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Connect Happy Tenant with your favorite tools
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className={cn(
                  'flex items-center justify-between p-4 rounded-xl border-2 transition-all',
                  integration.connected
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <Settings2 className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-zinc-900 dark:text-white">
                        {integration.name}
                      </h3>
                      {integration.connected && (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">
                          Connected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {integration.description}
                    </p>
                    {integration.connected && integration.lastSynced && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        Last synced: {formatRelativeTime(integration.lastSynced)}
                      </p>
                    )}
                  </div>
                </div>

                {integration.connected ? (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Connect
                    <ExternalLink className="h-3.5 w-3.5 ml-2" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* API Keys */}
      <motion.section
        variants={itemVariants}
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Key className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  API Keys
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Manage your API keys for programmatic access
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => setShowCreateKeyModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Key
            </Button>
          </div>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {apiKeys.map((key) => (
            <div key={key.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <Key className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-zinc-900 dark:text-white">
                        {key.name}
                      </h3>
                      {key.prefix === 'pk_test_' && (
                        <Badge variant="secondary" className="text-xs">
                          Test
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                          {showApiKey === key.id
                            ? `${key.prefix}xxxxxxxxxxxxxxxxxxxx${key.last4}`
                            : `${key.prefix}••••••••••••${key.last4}`}
                        </code>
                        <button
                          onClick={() =>
                            setShowApiKey(showApiKey === key.id ? null : key.id)
                          }
                          className="text-zinc-400 hover:text-zinc-600"
                        >
                          {showApiKey === key.id ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopyKey(key.id)}
                          className="text-zinc-400 hover:text-zinc-600"
                        >
                          {copiedKey === key.id ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                      <span>Created: {formatDate(key.createdAt)}</span>
                      {key.lastUsed && (
                        <span>Last used: {formatRelativeTime(key.lastUsed)}</span>
                      )}
                      {key.expiresAt && (
                        <span className="text-amber-600 dark:text-amber-400">
                          Expires: {formatDate(key.expiresAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Revoke
                </Button>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Data Export */}
      <motion.section
        variants={itemVariants}
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Download className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Data Export
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Download your data in various formats
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all group">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                <FileSpreadsheet className="h-6 w-6 text-zinc-600 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
              </div>
              <div className="text-left">
                <p className="font-medium text-zinc-900 dark:text-white">
                  Export as CSV
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Spreadsheet format
                </p>
              </div>
            </button>

            <button className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all group">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                <FileJson className="h-6 w-6 text-zinc-600 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
              </div>
              <div className="text-left">
                <p className="font-medium text-zinc-900 dark:text-white">
                  Export as JSON
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Developer format
                </p>
              </div>
            </button>

            <button className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all group">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                <Download className="h-6 w-6 text-zinc-600 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
              </div>
              <div className="text-left">
                <p className="font-medium text-zinc-900 dark:text-white">
                  Full Data Export
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  All data as ZIP
                </p>
              </div>
            </button>
          </div>
        </div>
      </motion.section>

      {/* Danger Zone */}
      <motion.section
        variants={itemVariants}
        className="bg-white dark:bg-zinc-900 rounded-xl border-2 border-red-200 dark:border-red-900/50 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-4.5 w-4.5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
                Danger Zone
              </h2>
              <p className="text-sm text-red-600 dark:text-red-400">
                Irreversible and destructive actions
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-white">
                Delete Account
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
                Permanently delete your account and all associated data.
                This action cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
              onClick={() => setShowDeleteAccountModal(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Create API Key Modal */}
      <Dialog open={showCreateKeyModal} onOpenChange={setShowCreateKeyModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-600" />
              Create API Key
            </DialogTitle>
            <DialogDescription>
              Generate a new API key for programmatic access to your account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="keyName">Key Name</Label>
              <Input id="keyName" placeholder="e.g., Production API Key" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyExpiry">Expiration</Label>
              <Select defaultValue="90d">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="90d">90 days</SelectItem>
                  <SelectItem value="1y">1 year</SelectItem>
                  <SelectItem value="never">Never expires</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateKeyModal(false)}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Create Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal */}
      <Dialog
        open={showDeleteAccountModal}
        onOpenChange={setShowDeleteAccountModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data,
              including properties, tenants, payments, and documents will be
              permanently deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900 mb-4">
              <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  All properties and units will be deleted
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  All tenant records and leases will be removed
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  Payment history will be permanently erased
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  This cannot be recovered once deleted
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deleteConfirmation">
                Type <span className="font-mono font-bold">DELETE MY ACCOUNT</span> to confirm
              </Label>
              <Input
                id="deleteConfirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="font-mono"
              />
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="deletePassword">
                <Lock className="h-3.5 w-3.5 inline mr-1" />
                Enter your password
              </Label>
              <Input id="deletePassword" type="password" placeholder="Your password" />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteAccountModal(false);
                setDeleteConfirmation('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmation !== 'DELETE MY ACCOUNT'}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
