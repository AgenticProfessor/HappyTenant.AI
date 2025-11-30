'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Plus,
  MoreVertical,
  FileText,
  Settings,
  Clock,
  AlertTriangle,
  Banknote,
  Check,
  Trash2,
  Star,
  Zap,
  Shield,
  DollarSign,
  Users,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

// Mock data
const mockEntities = [
  {
    id: '1',
    name: 'Lekadora LLC',
    entityType: 'LLC',
    isDefault: true,
    bankAccounts: [
      {
        id: 'ba1',
        bankName: 'Chase Bank',
        accountHolderName: 'Lekadora LLC',
        last4: '4567',
        accountType: 'CHECKING',
        isDefault: true,
        isVerified: true,
      },
      {
        id: 'ba2',
        bankName: 'Bank of America',
        accountHolderName: 'Lekadora LLC',
        last4: '8901',
        accountType: 'SAVINGS',
        isDefault: false,
        isVerified: true,
      },
    ],
  },
  {
    id: '2',
    name: 'Johnson Properties',
    entityType: 'INDIVIDUAL',
    isDefault: false,
    bankAccounts: [
      {
        id: 'ba3',
        bankName: 'Wells Fargo',
        accountHolderName: 'Sarah Johnson',
        last4: '2345',
        accountType: 'CHECKING',
        isDefault: true,
        isVerified: true,
      },
    ],
  },
];

const mockPayoutSpeed = 'STANDARD';
const mockFeeConfiguration = 'LANDLORD_ABSORBS';

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

export function RentPaymentsTab() {
  const [entities] = useState(mockEntities);
  const [payoutSpeed, setPayoutSpeed] = useState(mockPayoutSpeed);
  const [feeConfiguration, setFeeConfiguration] = useState(mockFeeConfiguration);
  const [showPayoutSpeedModal, setShowPayoutSpeedModal] = useState(false);
  const [showAddEntityModal, setShowAddEntityModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [expeditedAcknowledged, setExpeditedAcknowledged] = useState(false);
  const [tempPayoutSpeed, setTempPayoutSpeed] = useState(payoutSpeed);

  const handleSavePayoutSpeed = () => {
    setPayoutSpeed(tempPayoutSpeed);
    setShowPayoutSpeedModal(false);
    setExpeditedAcknowledged(false);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Bank Accounts Section */}
      <motion.section
        variants={itemVariants}
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <Building2 className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Bank Accounts
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Manage your business entities and payout accounts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddEntityModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Entity
              </Button>
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => {
                  setSelectedEntityId(entities[0]?.id || null);
                  setShowAddBankModal(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Bank Account
              </Button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {entities.map((entity) => (
            <div key={entity.id} className="p-6">
              {/* Entity Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold text-sm">
                    {entity.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-zinc-900 dark:text-white">
                        {entity.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {entity.entityType}
                      </Badge>
                      {entity.isDefault && (
                        <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400">
                    <FileText className="h-4 w-4 mr-2" />
                    Tax Forms
                  </Button>
                  <Button variant="ghost" size="sm" className="text-zinc-600 dark:text-zinc-400">
                    <Settings className="h-4 w-4 mr-2" />
                    Entity Settings
                  </Button>
                </div>
              </div>

              {/* Bank Accounts List */}
              <div className="space-y-3 ml-4 border-l-2 border-zinc-200 dark:border-zinc-700 pl-6">
                {entity.bankAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                        <Banknote className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-zinc-900 dark:text-white">
                            {account.bankName}
                          </p>
                          {account.isDefault && (
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          )}
                          {account.isVerified && (
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <Shield className="h-3.5 w-3.5" />
                              <span className="text-xs font-medium">Verified</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {account.accountType.charAt(0) + account.accountType.slice(1).toLowerCase()} ****{account.last4}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!account.isDefault && (
                          <DropdownMenuItem>
                            <Star className="h-4 w-4 mr-2" />
                            Set as Default
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Nickname
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 dark:text-red-400">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-indigo-600 dark:text-indigo-400 ml-4"
                  onClick={() => {
                    setSelectedEntityId(entity.id);
                    setShowAddBankModal(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add bank account to {entity.name}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ACH Payout Speed */}
      <motion.section
        variants={itemVariants}
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                ACH Payout Speed
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Configure how quickly you receive rent payments
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                'flex items-center justify-center h-14 w-14 rounded-xl',
                payoutSpeed === 'EXPEDITED'
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                  : 'bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700'
              )}>
                {payoutSpeed === 'EXPEDITED' ? (
                  <Zap className="h-7 w-7 text-white" />
                ) : (
                  <Clock className="h-7 w-7 text-zinc-600 dark:text-zinc-400" />
                )}
              </div>
              <div>
                <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {payoutSpeed === 'EXPEDITED'
                    ? 'Expedited Payout Time'
                    : 'Standard Payout Time'}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {payoutSpeed === 'EXPEDITED'
                    ? '2-4 business days'
                    : '5-7 business days'}
                </p>
                {payoutSpeed === 'EXPEDITED' && (
                  <div className="flex items-center gap-1 mt-1 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span className="text-xs">Faster payouts may be withdrawn if payments bounce</span>
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setTempPayoutSpeed(payoutSpeed);
                setShowPayoutSpeedModal(true);
              }}
            >
              Change Payout Speed
            </Button>
          </div>
        </div>
      </motion.section>

      {/* ACH Fee */}
      <motion.section
        variants={itemVariants}
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <DollarSign className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                ACH Fee
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Processing fee for ACH bank transfers
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                  0.8%
                </p>
                <span className="text-zinc-500 dark:text-zinc-400">
                  ($5.00 cap per transaction)
                </span>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Waived
                </Badge>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Your Pro subscription includes waived ACH fees
              </p>
            </div>

            <Button variant="outline" asChild>
              <a href="/dashboard/account?tab=billing">
                Manage Subscription
                <ChevronRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Fee Configuration */}
      <motion.section
        variants={itemVariants}
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <Users className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Fee Configuration
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Choose who pays the processing fees
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <RadioGroup
            value={feeConfiguration}
            onValueChange={setFeeConfiguration}
            className="space-y-3"
          >
            <label
              className={cn(
                'flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all',
                feeConfiguration === 'LANDLORD_ABSORBS'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              )}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="LANDLORD_ABSORBS" id="landlord" />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    I&apos;ll absorb the fees
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Fees are deducted from your payout
                  </p>
                </div>
              </div>
              {feeConfiguration === 'LANDLORD_ABSORBS' && (
                <Check className="h-5 w-5 text-indigo-600" />
              )}
            </label>

            <label
              className={cn(
                'flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all',
                feeConfiguration === 'TENANT_PAYS'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              )}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="TENANT_PAYS" id="tenant" />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    Tenant pays the fees
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Fees are added to tenant&apos;s payment
                  </p>
                </div>
              </div>
              {feeConfiguration === 'TENANT_PAYS' && (
                <Check className="h-5 w-5 text-indigo-600" />
              )}
            </label>

            <label
              className={cn(
                'flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all',
                feeConfiguration === 'SPLIT_FEES'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              )}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="SPLIT_FEES" id="split" />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    Split the fees
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    You and tenant each pay 50% of fees
                  </p>
                </div>
              </div>
              {feeConfiguration === 'SPLIT_FEES' && (
                <Check className="h-5 w-5 text-indigo-600" />
              )}
            </label>
          </RadioGroup>
        </div>
      </motion.section>

      {/* ACH Payout Speed Modal */}
      <Dialog open={showPayoutSpeedModal} onOpenChange={setShowPayoutSpeedModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              Choose ACH Payout Speed
            </DialogTitle>
            <DialogDescription>
              Select how quickly you want to receive rent payments in your bank account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <RadioGroup
              value={tempPayoutSpeed}
              onValueChange={setTempPayoutSpeed}
              className="space-y-3"
            >
              <label
                className={cn(
                  'flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                  tempPayoutSpeed === 'STANDARD'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-zinc-200 dark:border-zinc-700'
                )}
              >
                <RadioGroupItem value="STANDARD" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-zinc-900 dark:text-white">
                      Standard Payout Time
                    </p>
                    <Badge variant="secondary">5-7 business days</Badge>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Payments are deposited into your bank account after they clear
                    a tenant&apos;s bank account.
                  </p>
                </div>
              </label>

              <label
                className={cn(
                  'flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                  tempPayoutSpeed === 'EXPEDITED'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-zinc-200 dark:border-zinc-700'
                )}
              >
                <RadioGroupItem value="EXPEDITED" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-zinc-900 dark:text-white">
                      Expedited Payout Time
                    </p>
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      2-4 business days
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Payments may be deposited into your bank account before they clear.
                    Not recommended if tenants have a history of bounced payments.
                  </p>
                </div>
              </label>
            </RadioGroup>

            {tempPayoutSpeed === 'EXPEDITED' && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Important Notice
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      If a tenant&apos;s payment bounces after being deposited into your account,
                      the funds may be withdrawn from your account.{' '}
                      <a href="#" className="underline font-medium">
                        Learn more
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
                  <Checkbox
                    id="acknowledge"
                    checked={expeditedAcknowledged}
                    onCheckedChange={(checked) => setExpeditedAcknowledged(!!checked)}
                  />
                  <label
                    htmlFor="acknowledge"
                    className="text-sm text-amber-800 dark:text-amber-200 cursor-pointer"
                  >
                    I understand and agree to the above
                  </label>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutSpeedModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={tempPayoutSpeed === 'EXPEDITED' && !expeditedAcknowledged}
              onClick={handleSavePayoutSpeed}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Entity Modal */}
      <Dialog open={showAddEntityModal} onOpenChange={setShowAddEntityModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              Add Business Entity
            </DialogTitle>
            <DialogDescription>
              Create a new business entity to receive rent payments.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="entityName">Entity Name</Label>
              <Input id="entityName" placeholder="e.g., Johnson Properties LLC" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entityType">Entity Type</Label>
              <Select defaultValue="LLC">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                  <SelectItem value="LLC">LLC</SelectItem>
                  <SelectItem value="LP">LP (Limited Partnership)</SelectItem>
                  <SelectItem value="S_CORP">S Corporation</SelectItem>
                  <SelectItem value="C_CORP">C Corporation</SelectItem>
                  <SelectItem value="TRUST">Trust</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ein">EIN (Employer Identification Number)</Label>
              <Input id="ein" placeholder="XX-XXXXXXX" />
              <p className="text-xs text-zinc-500">
                Required for tax purposes. For individuals, SSN will be used instead.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entityCity">City</Label>
                <Input id="entityCity" placeholder="City" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entityState">State</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEntityModal(false)}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Create Entity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bank Account Modal */}
      <Dialog open={showAddBankModal} onOpenChange={setShowAddBankModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-indigo-600" />
              Add Bank Account
            </DialogTitle>
            <DialogDescription>
              Link a new bank account for receiving rent payments.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bankEntity">Business Entity</Label>
              <Select value={selectedEntityId || undefined} onValueChange={setSelectedEntityId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent>
                  {entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountHolder">Account Holder Name</Label>
              <Input id="accountHolder" placeholder="Name on the bank account" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="routingNumber">Routing Number</Label>
              <Input id="routingNumber" placeholder="9 digits" maxLength={9} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input id="accountNumber" placeholder="Account number" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmAccount">Confirm Account Number</Label>
              <Input id="confirmAccount" placeholder="Re-enter account number" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type</Label>
              <Select defaultValue="CHECKING">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHECKING">Checking</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname (optional)</Label>
              <Input id="nickname" placeholder="e.g., Main Business Account" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBankModal(false)}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Add Bank Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
