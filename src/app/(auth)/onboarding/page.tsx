'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Building2, User } from 'lucide-react';

const onboardingSchema = z.object({
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  organizationType: z.enum(['individual', 'company']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<{ first: string; last: string }>({ first: '', last: '' });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      organizationType: 'individual',
    },
  });

  const organizationType = watch('organizationType');

  // Pre-fill form with user data from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email || '');

        // Try to get name from metadata (Google OAuth provides this)
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        setUserName({ first: firstName, last: lastName });
        if (firstName) setValue('firstName', firstName);
        if (lastName) setValue('lastName', lastName);
      } else {
        // Not authenticated - redirect to sign in
        router.push('/sign-in');
      }
    };

    fetchUserData();
  }, [router, setValue]);

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Failed to complete onboarding');
        return;
      }

      // Success - redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Onboarding error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome to Happy Tenant</h1>
        <p className="text-muted-foreground mt-2">
          Let&apos;s set up your account
        </p>
        {userEmail && (
          <p className="text-sm text-muted-foreground mt-1">
            Signed in as <span className="font-medium">{userEmail}</span>
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-6">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Setup failed</p>
            <p className="text-sm text-destructive/90">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Organization Type Selection */}
        <div className="space-y-3">
          <Label>I am a...</Label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                organizationType === 'individual'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input
                type="radio"
                value="individual"
                {...register('organizationType')}
                className="sr-only"
              />
              <User className="h-8 w-8 mb-2 text-muted-foreground" />
              <span className="font-medium">Individual</span>
              <span className="text-xs text-muted-foreground text-center mt-1">
                Managing my own properties
              </span>
            </label>
            <label
              className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                organizationType === 'company'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input
                type="radio"
                value="company"
                {...register('organizationType')}
                className="sr-only"
              />
              <Building2 className="h-8 w-8 mb-2 text-muted-foreground" />
              <span className="font-medium">Company</span>
              <span className="text-xs text-muted-foreground text-center mt-1">
                Property management business
              </span>
            </label>
          </div>
        </div>

        {/* Organization Name */}
        <div className="space-y-2">
          <Label htmlFor="organizationName">
            {organizationType === 'company' ? 'Company Name' : 'Organization Name'}
          </Label>
          <Input
            id="organizationName"
            placeholder={organizationType === 'company' ? 'Acme Property Management' : 'My Properties'}
            {...register('organizationName')}
            disabled={isLoading}
            className={errors.organizationName ? 'border-destructive' : ''}
          />
          {errors.organizationName && (
            <p className="text-sm text-destructive">{errors.organizationName.message}</p>
          )}
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John"
              {...register('firstName')}
              disabled={isLoading}
              className={errors.firstName ? 'border-destructive' : ''}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              {...register('lastName')}
              disabled={isLoading}
              className={errors.lastName ? 'border-destructive' : ''}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up your account...
            </>
          ) : (
            'Complete Setup'
          )}
        </Button>
      </form>
    </div>
  );
}
