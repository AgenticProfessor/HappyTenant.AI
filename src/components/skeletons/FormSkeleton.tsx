import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export interface FormSkeletonProps {
  fields?: number;
  showCard?: boolean;
  showHeader?: boolean;
  columns?: 1 | 2;
}

export function FormSkeleton({
  fields = 4,
  showCard = true,
  showHeader = true,
  columns = 1,
}: FormSkeletonProps) {
  const FormContent = () => (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      )}

      <div className={columns === 2 ? 'grid gap-6 sm:grid-cols-2' : 'space-y-6'}>
        {[...Array(fields)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>

      {/* Textarea field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 w-full" />
      </div>

      {/* Submit button skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );

  if (showCard) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
        )}
        <CardContent>
          <FormContent />
        </CardContent>
      </Card>
    );
  }

  return <FormContent />;
}
