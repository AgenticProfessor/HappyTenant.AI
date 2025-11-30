'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Bell,
  Camera,
  Eye,
  EyeOff,
  Check,
  Copy,
  Smartphone,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Mock user data
const mockUser = {
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah.johnson@example.com',
  phone: '(555) 123-4567',
  avatarUrl: null,
  twoFactorEnabled: false,
};

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

export function AccountTab() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(mockUser.twoFactorEnabled);
  const [backupCodesCopied, setBackupCodesCopied] = useState(false);

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    emailRentPayments: true,
    emailPaymentReminders: true,
    emailMaintenanceRequests: true,
    emailLeaseExpirations: true,
    emailMessagesFromTenants: true,
    smsEnabled: false,
    smsEmergencyMaintenance: true,
    smsCriticalAlerts: true,
    pushEnabled: true,
  });

  // Mock backup codes
  const backupCodes = [
    'ABCD-1234-EFGH',
    'IJKL-5678-MNOP',
    'QRST-9012-UVWX',
    'YZAB-3456-CDEF',
    'GHIJ-7890-KLMN',
    'OPQR-1234-STUV',
    'WXYZ-5678-ABCD',
    'EFGH-9012-IJKL',
  ];

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setBackupCodesCopied(true);
    setTimeout(() => setBackupCodesCopied(false), 2000);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Profile Information */}
      <motion.section
        variants={itemVariants}
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <User className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Profile Information
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Update your personal details and contact information
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-white dark:border-zinc-800 shadow-lg">
                  <AvatarImage src={mockUser.avatarUrl || ''} />
                  <AvatarFallback className="text-xl font-semibold bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                    {mockUser.firstName[0]}
                    {mockUser.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </button>
              </div>
              <Button variant="outline" size="sm" className="text-sm">
                Change Photo
              </Button>
            </div>

            {/* Form Fields */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-zinc-700 dark:text-zinc-300">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    id="firstName"
                    defaultValue={mockUser.firstName}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-zinc-700 dark:text-zinc-300">
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    id="lastName"
                    defaultValue={mockUser.lastName}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    id="email"
                    type="email"
                    defaultValue={mockUser.email}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-zinc-700 dark:text-zinc-300">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue={mockUser.phone}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Save Changes
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Password & Security */}
      <motion.section
        variants={itemVariants}
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Lock className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Password & Security
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Manage your password and security settings
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Change Password Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-zinc-700 dark:text-zinc-300">
                Current Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-zinc-700 dark:text-zinc-300">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-700 dark:text-zinc-300">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            <p className="mb-2 font-medium">Password requirements:</p>
            <ul className="grid grid-cols-2 gap-1">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                At least 8 characters
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                One uppercase letter
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                One lowercase letter
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                One number
              </li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button variant="outline">Update Password</Button>
          </div>
        </div>
      </motion.section>

      {/* Two-Factor Authentication */}
      <motion.section
        variants={itemVariants}
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Shield className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Two-Factor Authentication
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                'flex items-center justify-center h-12 w-12 rounded-xl',
                twoFactorEnabled
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-zinc-100 dark:bg-zinc-800'
              )}>
                <Smartphone className={cn(
                  'h-6 w-6',
                  twoFactorEnabled
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-zinc-400'
                )} />
              </div>
              <div>
                <p className="font-medium text-zinc-900 dark:text-white">
                  Authenticator App
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {twoFactorEnabled
                    ? 'Your account is protected with 2FA'
                    : 'Use an app like Google Authenticator or Authy'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {twoFactorEnabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShow2FAModal(true)}
                  className="text-zinc-600 dark:text-zinc-400"
                >
                  View Backup Codes
                </Button>
              )}
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setShow2FAModal(true);
                  } else {
                    setTwoFactorEnabled(false);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Notification Preferences */}
      <motion.section
        variants={itemVariants}
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <Bell className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Notification Preferences
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Choose how you want to receive notifications
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Email Notifications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-zinc-400" />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    Email Notifications
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Receive updates via email
                  </p>
                </div>
              </div>
              <Switch
                checked={notifications.emailEnabled}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, emailEnabled: checked }))
                }
              />
            </div>

            {notifications.emailEnabled && (
              <div className="ml-8 space-y-3 border-l-2 border-zinc-200 dark:border-zinc-700 pl-4">
                {[
                  { key: 'emailRentPayments', label: 'Rent payment received' },
                  { key: 'emailPaymentReminders', label: 'Payment reminders' },
                  { key: 'emailMaintenanceRequests', label: 'Maintenance requests' },
                  { key: 'emailLeaseExpirations', label: 'Lease expirations' },
                  { key: 'emailMessagesFromTenants', label: 'Messages from tenants' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {item.label}
                    </span>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications] as boolean}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SMS Notifications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-zinc-400" />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    SMS Notifications
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Get text messages for urgent updates
                  </p>
                </div>
              </div>
              <Switch
                checked={notifications.smsEnabled}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, smsEnabled: checked }))
                }
              />
            </div>

            {notifications.smsEnabled && (
              <div className="ml-8 space-y-3 border-l-2 border-zinc-200 dark:border-zinc-700 pl-4">
                {[
                  { key: 'smsEmergencyMaintenance', label: 'Emergency maintenance' },
                  { key: 'smsCriticalAlerts', label: 'Critical account alerts' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {item.label}
                    </span>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications] as boolean}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Push Notifications */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-zinc-400" />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    Push Notifications
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Receive push notifications in your browser
                  </p>
                </div>
              </div>
              <Switch
                checked={notifications.pushEnabled}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, pushEnabled: checked }))
                }
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* 2FA Setup Modal */}
      <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              {twoFactorEnabled ? 'Backup Codes' : 'Set Up Two-Factor Authentication'}
            </DialogTitle>
            <DialogDescription>
              {twoFactorEnabled
                ? 'Save these backup codes in a secure location. Each code can only be used once.'
                : 'Scan the QR code with your authenticator app, then enter the 6-digit code.'}
            </DialogDescription>
          </DialogHeader>

          {!twoFactorEnabled ? (
            <div className="space-y-6">
              {/* QR Code placeholder */}
              <div className="flex justify-center">
                <div className="h-48 w-48 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                  <div className="text-center text-zinc-500">
                    <div className="grid grid-cols-5 gap-1 p-4">
                      {[...Array(25)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'h-6 w-6 rounded-sm',
                            Math.random() > 0.5 ? 'bg-zinc-900 dark:bg-white' : 'bg-transparent'
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-xs mt-2">QR Code</p>
                  </div>
                </div>
              </div>

              {/* Manual entry key */}
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center">
                <p className="text-xs text-zinc-500 mb-1">Manual entry key</p>
                <p className="font-mono text-sm font-medium text-zinc-900 dark:text-white">
                  ABCD EFGH IJKL MNOP
                </p>
              </div>

              {/* Verification code input */}
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Enter 6-digit code</Label>
                <Input
                  id="verificationCode"
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-lg tracking-widest font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md font-mono text-sm text-center"
                  >
                    {code}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyBackupCodes}
              >
                {backupCodesCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-emerald-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All Codes
                  </>
                )}
              </Button>

              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-800 dark:text-amber-200">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  Store these codes securely. If you lose access to your authenticator app,
                  you&apos;ll need these codes to sign in.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShow2FAModal(false)}>
              Cancel
            </Button>
            {!twoFactorEnabled && (
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => {
                  setTwoFactorEnabled(true);
                }}
              >
                Enable 2FA
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
