'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentMethodSchema, type PaymentMethodFormValues } from '@/lib/schemas/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Check, Loader2, Building2, CreditCard, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PaymentMethodFormProps {
  defaultValues?: Partial<PaymentMethodFormValues>;
  onSubmit?: (data: PaymentMethodFormValues) => Promise<void> | void;
}

export function PaymentMethodForm({
  defaultValues,
  onSubmit,
}: PaymentMethodFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      paymentType: defaultValues?.paymentType || 'bank_account',
      accountHolderName: defaultValues?.accountHolderName || '',
      routingNumber: defaultValues?.routingNumber || '',
      accountNumber: defaultValues?.accountNumber || '',
      confirmAccountNumber: defaultValues?.confirmAccountNumber || '',
      cardNumber: defaultValues?.cardNumber || '',
      expiryDate: defaultValues?.expiryDate || '',
      cvv: defaultValues?.cvv || '',
    },
  });

  const paymentType = form.watch('paymentType');

  const handleSubmit = async (data: PaymentMethodFormValues) => {
    try {
      setIsLoading(true);

      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('Payment method data:', {
          ...data,
          accountNumber: '[REDACTED]',
          confirmAccountNumber: '[REDACTED]',
          cardNumber: '[REDACTED]',
          cvv: '[REDACTED]',
        });
      }

      toast.success('Payment method saved successfully');
      form.reset(data);
    } catch (error) {
      toast.error('Failed to save payment method');
      console.error('Payment method error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  return (
    <div className="space-y-6">
      {/* Security notice */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Secure Payment Processing</p>
          <p className="text-xs text-muted-foreground">
            All payment information is securely processed and encrypted by Stripe.
            We never store your full account or card numbers on our servers.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Payment type selection */}
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => form.setValue('paymentType', 'bank_account', { shouldDirty: true })}
              className={cn(
                'flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all',
                paymentType === 'bank_account'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <Building2 className={cn(
                'h-8 w-8',
                paymentType === 'bank_account' ? 'text-primary' : 'text-muted-foreground'
              )} />
              <div className="text-center">
                <p className="font-medium">Bank Account</p>
                <p className="text-xs text-muted-foreground">Direct deposit (1-2 days)</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => form.setValue('paymentType', 'debit_card', { shouldDirty: true })}
              className={cn(
                'flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all',
                paymentType === 'debit_card'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <CreditCard className={cn(
                'h-8 w-8',
                paymentType === 'debit_card' ? 'text-primary' : 'text-muted-foreground'
              )} />
              <div className="text-center">
                <p className="font-medium">Debit Card</p>
                <p className="text-xs text-muted-foreground">Instant payouts (small fee)</p>
              </div>
            </button>
          </div>

          <Separator />

          {/* Bank account fields */}
          {paymentType === 'bank_account' && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="accountHolderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Holder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormDescription>
                      Name as it appears on your bank account
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="routingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Routing Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123456789"
                          maxLength={9}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••••"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="confirmAccountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Account Number</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••••"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Debit card fields */}
          {paymentType === 'debit_card' && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          field.onChange(value);
                          e.target.value = formatCardNumber(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="MM/YY"
                          maxLength={5}
                          {...field}
                          onChange={(e) => {
                            const formatted = formatExpiryDate(e.target.value);
                            field.onChange(formatted);
                            e.target.value = formatted;
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Payment Method
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
