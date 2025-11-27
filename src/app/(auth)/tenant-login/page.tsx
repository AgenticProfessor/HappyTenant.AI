'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

const invitationCodeSchema = z.object({
  invitationCode: z.string().min(8, 'Please enter a valid invitation code'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type InvitationFormData = z.infer<typeof invitationCodeSchema>;

export default function TenantLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<'email' | 'invitation'>('email');

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerInvitation,
    handleSubmit: handleInvitationSubmit,
    formState: { errors: invitationErrors },
  } = useForm<InvitationFormData>({
    resolver: zodResolver(invitationCodeSchema),
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate login delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate random error (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('Invalid email or password. Please try again.');
      }

      // Mock successful login - redirect to tenant portal
      router.push('/tenant');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  const onInvitationSubmit = async (data: InvitationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate invitation code verification
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate random error (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('Invalid invitation code. Please check and try again.');
      }

      // Mock successful login - redirect to tenant portal
      router.push('/tenant');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push('/tenant');
    } catch (err) {
      setError('Social login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Renter Login</h1>
        <p className="text-muted-foreground mt-2">
          Are you a landlord?{' '}
          <Link href="/sign-in" className="text-primary hover:underline">
            Log in as a landlord
          </Link>
          .
        </p>
      </div>

      <div className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Error</p>
              <p className="text-sm text-destructive/90">{error}</p>
            </div>
          </div>
        )}

        {/* Social login buttons */}
        <Button
          variant="outline"
          className="w-full justify-center gap-2"
          onClick={() => handleSocialLogin('google')}
          disabled={isLoading}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Log in with Google
        </Button>

        <Button
          variant="outline"
          className="w-full justify-center gap-2 bg-black text-white hover:bg-black/90 hover:text-white border-black"
          onClick={() => handleSocialLogin('apple')}
          disabled={isLoading}
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
          </svg>
          Log in with Apple
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        {/* Login Method Tabs */}
        <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as 'email' | 'invitation')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email Login</TabsTrigger>
            <TabsTrigger value="invitation">Invitation Code</TabsTrigger>
          </TabsList>

          {/* Email Login Tab */}
          <TabsContent value="email" className="mt-4">
            <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...registerLogin('email')}
                  disabled={isLoading}
                  className={loginErrors.email ? 'border-destructive' : ''}
                />
                {loginErrors.email && (
                  <p className="text-sm text-destructive">{loginErrors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...registerLogin('password')}
                    disabled={isLoading}
                    className={loginErrors.password ? 'border-destructive' : ''}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="text-sm text-destructive">{loginErrors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" {...registerLogin('rememberMe')} />
                  <Label htmlFor="remember" className="text-sm font-normal">
                    Remember Me
                  </Label>
                </div>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'LOG IN'}
              </Button>
            </form>
          </TabsContent>

          {/* Invitation Code Tab */}
          <TabsContent value="invitation" className="mt-4">
            <form onSubmit={handleInvitationSubmit(onInvitationSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invitationCode">Invitation Code</Label>
                <Input
                  id="invitationCode"
                  type="text"
                  placeholder="Enter your invitation code"
                  {...registerInvitation('invitationCode')}
                  disabled={isLoading}
                  className={invitationErrors.invitationCode ? 'border-destructive' : ''}
                />
                {invitationErrors.invitationCode && (
                  <p className="text-sm text-destructive">
                    {invitationErrors.invitationCode.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter the invitation code provided by your landlord
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'CONTINUE WITH CODE'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Need to apply for a rental?{' '}
            <Link href="/apply" className="text-primary hover:underline font-medium">
              Start your application
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
