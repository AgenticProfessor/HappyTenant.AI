import { FileQuestion, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-md w-full">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <FileQuestion className="h-10 w-10 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <Link href="/dashboard/properties">
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Browse Properties
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Looking for something specific? Try searching from the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
