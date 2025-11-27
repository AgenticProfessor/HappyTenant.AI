'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notificationSchema, type NotificationFormValues } from '@/lib/schemas/settings';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Form } from '@/components/ui/form';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationPreferencesFormProps {
  defaultValues?: Partial<NotificationFormValues>;
  onSubmit?: (data: NotificationFormValues) => Promise<void> | void;
}

export function NotificationPreferencesForm({
  defaultValues,
  onSubmit,
}: NotificationPreferencesFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      // Email notifications
      emailEnabled: defaultValues?.emailEnabled ?? true,
      emailRentPayments: defaultValues?.emailRentPayments ?? true,
      emailPaymentReminders: defaultValues?.emailPaymentReminders ?? true,
      emailMaintenanceRequests: defaultValues?.emailMaintenanceRequests ?? true,
      emailLeaseExpirations: defaultValues?.emailLeaseExpirations ?? true,
      emailMessagesFromTenants: defaultValues?.emailMessagesFromTenants ?? true,

      // SMS notifications
      smsEnabled: defaultValues?.smsEnabled ?? false,
      smsEmergencyMaintenance: defaultValues?.smsEmergencyMaintenance ?? true,
      smsPaymentReceived: defaultValues?.smsPaymentReceived ?? false,
      smsCriticalAlerts: defaultValues?.smsCriticalAlerts ?? true,

      // Push notifications
      pushEnabled: defaultValues?.pushEnabled ?? true,
      pushAllActivity: defaultValues?.pushAllActivity ?? false,
      pushMessagesOnly: defaultValues?.pushMessagesOnly ?? true,
      pushOff: defaultValues?.pushOff ?? false,
    },
  });

  const handleSubmit = async (data: NotificationFormValues) => {
    try {
      setIsLoading(true);

      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('Notification preferences:', data);
      }

      toast.success('Notification preferences updated successfully');
      form.reset(data);
    } catch (error) {
      toast.error('Failed to update notification preferences');
      console.error('Notification update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const emailEnabled = form.watch('emailEnabled');
  const smsEnabled = form.watch('smsEnabled');
  const pushEnabled = form.watch('pushEnabled');

  const handleMasterToggle = (channel: 'email' | 'sms' | 'push', enabled: boolean) => {
    if (channel === 'email') {
      form.setValue('emailEnabled', enabled, { shouldDirty: true });
    } else if (channel === 'sms') {
      form.setValue('smsEnabled', enabled, { shouldDirty: true });
    } else if (channel === 'push') {
      form.setValue('pushEnabled', enabled, { shouldDirty: true });
    }
  };

  const handlePushPreferenceChange = (preference: 'all' | 'messages' | 'off') => {
    form.setValue('pushAllActivity', preference === 'all', { shouldDirty: true });
    form.setValue('pushMessagesOnly', preference === 'messages', { shouldDirty: true });
    form.setValue('pushOff', preference === 'off', { shouldDirty: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Email Notifications</h3>
              <p className="text-xs text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={emailEnabled}
              onCheckedChange={(checked) => handleMasterToggle('email', checked)}
            />
          </div>

          {emailEnabled && (
            <div className="ml-4 space-y-3 border-l-2 pl-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rent Payments</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when rent is paid or overdue
                  </p>
                </div>
                <Switch
                  checked={form.watch('emailRentPayments')}
                  onCheckedChange={(checked) =>
                    form.setValue('emailRentPayments', checked, { shouldDirty: true })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Reminders</Label>
                  <p className="text-xs text-muted-foreground">
                    Send automatic payment reminders to tenants
                  </p>
                </div>
                <Switch
                  checked={form.watch('emailPaymentReminders')}
                  onCheckedChange={(checked) =>
                    form.setValue('emailPaymentReminders', checked, { shouldDirty: true })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Requests</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified about new maintenance requests
                  </p>
                </div>
                <Switch
                  checked={form.watch('emailMaintenanceRequests')}
                  onCheckedChange={(checked) =>
                    form.setValue('emailMaintenanceRequests', checked, { shouldDirty: true })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Lease Expirations</Label>
                  <p className="text-xs text-muted-foreground">
                    Get reminded about upcoming lease expirations
                  </p>
                </div>
                <Switch
                  checked={form.watch('emailLeaseExpirations')}
                  onCheckedChange={(checked) =>
                    form.setValue('emailLeaseExpirations', checked, { shouldDirty: true })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Messages from Tenants</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified about new messages from tenants
                  </p>
                </div>
                <Switch
                  checked={form.watch('emailMessagesFromTenants')}
                  onCheckedChange={(checked) =>
                    form.setValue('emailMessagesFromTenants', checked, { shouldDirty: true })
                  }
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* SMS Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">SMS Notifications</h3>
              <p className="text-xs text-muted-foreground">
                Receive text message alerts for critical events
              </p>
            </div>
            <Switch
              checked={smsEnabled}
              onCheckedChange={(checked) => handleMasterToggle('sms', checked)}
            />
          </div>

          {smsEnabled && (
            <div className="ml-4 space-y-3 border-l-2 pl-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Emergency Maintenance</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive text alerts for urgent maintenance issues
                  </p>
                </div>
                <Switch
                  checked={form.watch('smsEmergencyMaintenance')}
                  onCheckedChange={(checked) =>
                    form.setValue('smsEmergencyMaintenance', checked, { shouldDirty: true })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Received</Label>
                  <p className="text-xs text-muted-foreground">
                    Get text alerts when payments are received
                  </p>
                </div>
                <Switch
                  checked={form.watch('smsPaymentReceived')}
                  onCheckedChange={(checked) =>
                    form.setValue('smsPaymentReceived', checked, { shouldDirty: true })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Critical Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive text alerts for critical system events
                  </p>
                </div>
                <Switch
                  checked={form.watch('smsCriticalAlerts')}
                  onCheckedChange={(checked) =>
                    form.setValue('smsCriticalAlerts', checked, { shouldDirty: true })
                  }
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Push Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Push Notifications (In-App)</h3>
              <p className="text-xs text-muted-foreground">
                Control browser and in-app notifications
              </p>
            </div>
            <Switch
              checked={pushEnabled}
              onCheckedChange={(checked) => handleMasterToggle('push', checked)}
            />
          </div>

          {pushEnabled && (
            <div className="ml-4 space-y-3 border-l-2 pl-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>All Activity</Label>
                  <p className="text-xs text-muted-foreground">
                    Get push notifications for all activities
                  </p>
                </div>
                <Switch
                  checked={form.watch('pushAllActivity')}
                  onCheckedChange={(checked) => {
                    if (checked) handlePushPreferenceChange('all');
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Messages Only</Label>
                  <p className="text-xs text-muted-foreground">
                    Only get notified about new messages
                  </p>
                </div>
                <Switch
                  checked={form.watch('pushMessagesOnly')}
                  onCheckedChange={(checked) => {
                    if (checked) handlePushPreferenceChange('messages');
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Off</Label>
                  <p className="text-xs text-muted-foreground">
                    Disable all push notifications
                  </p>
                </div>
                <Switch
                  checked={form.watch('pushOff')}
                  onCheckedChange={(checked) => {
                    if (checked) handlePushPreferenceChange('off');
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
