'use client';

import { AlertTriangle, RefreshCw, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type ErrorDisplayVariant = 'full-page' | 'inline' | 'card';

export interface ErrorDisplayProps {
  title?: string;
  message?: string;
  variant?: ErrorDisplayVariant;
  onRetry?: () => void;
  showGoBack?: boolean;
  showGoHome?: boolean;
  className?: string;
}

export function ErrorDisplay({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  variant = 'inline',
  onRetry,
  showGoBack = false,
  showGoHome = false,
  className,
}: ErrorDisplayProps) {
  const ErrorContent = () => (
    <div className="flex flex-col items-center justify-center text-center space-y-4">
      <div
        className={cn(
          'rounded-full bg-destructive/10 flex items-center justify-center',
          variant === 'full-page' ? 'h-16 w-16' : 'h-12 w-12'
        )}
      >
        <AlertTriangle
          className={cn(
            'text-destructive',
            variant === 'full-page' ? 'h-8 w-8' : 'h-6 w-6'
          )}
        />
      </div>

      <div className="space-y-2">
        <h3
          className={cn(
            'font-semibold',
            variant === 'full-page' ? 'text-2xl' : 'text-lg'
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            'text-muted-foreground',
            variant === 'full-page' ? 'text-base' : 'text-sm'
          )}
        >
          {message}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {onRetry && (
          <Button onClick={onRetry} size={variant === 'full-page' ? 'default' : 'sm'}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}

        {showGoBack && (
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            size={variant === 'full-page' ? 'default' : 'sm'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        )}

        {showGoHome && (
          <Link href="/dashboard">
            <Button variant="outline" size={variant === 'full-page' ? 'default' : 'sm'}>
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
        )}
      </div>
    </div>
  );

  if (variant === 'full-page') {
    return (
      <div className={cn('flex min-h-screen items-center justify-center p-8', className)}>
        <div className="max-w-md w-full">
          <ErrorContent />
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{message}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {onRetry && (
              <Button onClick={onRetry} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            {showGoBack && (
              <Button variant="outline" onClick={() => window.history.back()} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // inline variant
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <div className="max-w-md w-full">
        <ErrorContent />
      </div>
    </div>
  );
}
