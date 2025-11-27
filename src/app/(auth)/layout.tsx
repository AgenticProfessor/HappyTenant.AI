import Link from 'next/link';
import { Home } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">
              Happy<span className="text-foreground">Tenant</span>
            </span>
          </Link>
          {children}
        </div>
      </div>

      {/* Right side - Feature showcase */}
      <div className="hidden lg:flex lg:flex-1 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <p className="text-sm font-medium uppercase tracking-wider text-white/70 mb-4">
            Manage the Rental Process
          </p>
          <h2 className="text-3xl xl:text-4xl font-bold mb-6">
            Get back to finding & managing great tenants
          </h2>

          {/* Preview cards */}
          <div className="space-y-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70">NEW LEAD</p>
                  <p className="font-semibold">Mackenzie Johnson</p>
                  <p className="text-sm text-white/70">1234 Broadway St.</p>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">✉️</div>
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">📞</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-4 transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-300">INVITED TO APPLY</p>
                  <p className="font-semibold">Lamar Durant</p>
                  <p className="text-sm text-white/70">1234 Broadway St.</p>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">✉️</div>
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">📞</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 text-foreground transform hover:scale-105 transition-transform">
              <p className="text-xs text-blue-600 font-medium">CURRENT LEASE</p>
              <p className="font-bold text-lg">Lopez - Washington</p>
              <p className="text-sm text-muted-foreground">1234 Broadway St. #102</p>
              <div className="flex justify-between mt-3 pt-3 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">UNPAID CHARGES</p>
                  <p className="font-bold text-blue-600">$1,200</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">PAST DUE</p>
                  <p className="font-bold text-red-500">$50</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-white/60 text-sm">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
              AI Assistant ready to help
            </span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 right-10 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      </div>
    </div>
  );
}
