'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { SkipLink } from '@/components/ui/skip-link';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import {
  Building2,
  Users,
  CreditCard,
  Wrench,
  Settings,
  Menu,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Plus,
} from 'lucide-react';
import { mockUser, mockOrganization } from '@/data/mock-data';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { StewardProvider, StewardFloatingWidget } from '@/components/steward';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <StewardProvider>
    <div className="min-h-screen bg-muted/30">
      <SkipLink href="#main-content" />

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0 border-0">
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col" aria-label="Sidebar">
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top nav */}
        <header className="sticky top-0 z-40 bg-background border-b">
          <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
              <VisuallyHidden>Menu</VisuallyHidden>
            </Button>

            {/* Search */}
            <div className="flex-1 flex items-center">
              <div className="w-full max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <label htmlFor="global-search" className="sr-only">
                    Search properties, tenants, or transactions
                  </label>
                  <input
                    id="global-search"
                    type="search"
                    placeholder="Search properties, tenants, or transactions..."
                    aria-label="Search properties, tenants, or transactions"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-muted/50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="hidden sm:flex">
                    <Plus className="h-4 w-4 mr-2" />
                    Quick Add
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/properties?action=add">
                      <Building2 className="h-4 w-4 mr-2" />
                      Add Property
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/tenants?action=add">
                      <Users className="h-4 w-4 mr-2" />
                      Add Tenant
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/payments?action=record">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Record Payment
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/maintenance?action=create">
                      <Wrench className="h-4 w-4 mr-2" />
                      Create Request
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" aria-hidden="true" />
                <VisuallyHidden>You have new notifications</VisuallyHidden>
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-2 pr-3" aria-label="User menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={mockUser.avatarUrl} alt={mockUser.name} />
                      <AvatarFallback>
                        {mockUser.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium">
                      {mockUser.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{mockUser.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {mockUser.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/account?tab=account">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/account?tab=rent-payments">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Rent Payments
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/account?tab=billing">
                      <Settings className="h-4 w-4 mr-2" />
                      Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/account?tab=advanced">
                      <Settings className="h-4 w-4 mr-2" />
                      Advanced Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Building2 className="h-4 w-4 mr-2" />
                    {mockOrganization.name}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="p-4 sm:p-6 lg:p-8" tabIndex={-1}>
          {children}
        </main>
      </div>

      {/* Steward AI Assistant */}
      <StewardFloatingWidget />
    </div>
    </StewardProvider>
  );
}
