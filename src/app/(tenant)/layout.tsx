'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  CreditCard,
  Wrench,
  MessageSquare,
  FileText,
  Settings,
  HelpCircle,
  Menu,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Sparkles,
} from 'lucide-react';
import { mockTenants } from '@/data/mock-data';

const currentTenant = mockTenants[0]; // Mock current tenant

const navigation = [
  { name: 'Home', href: '/tenant', icon: Home },
  { name: 'Payments', href: '/tenant/payments', icon: CreditCard },
  { name: 'Maintenance', href: '/tenant/maintenance', icon: Wrench },
  { name: 'Messages', href: '/tenant/messages', icon: MessageSquare, badge: 1 },
  { name: 'Documents', href: '/tenant/documents', icon: FileText },
];

const secondaryNavigation = [
  { name: 'Settings', href: '/tenant/settings', icon: Settings },
  { name: 'Help', href: '/tenant/help', icon: HelpCircle },
];

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      <div className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/tenant' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
              {item.badge && (
                <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-8">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Support
        </p>
        <div className="space-y-1">
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClick}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* AI Assistant Card */}
      <div className="mt-8 mx-3 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Need Help?</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Our AI assistant can help with questions about your lease, payments, and more.
        </p>
        <Button size="sm" className="w-full" variant="outline">
          <MessageSquare className="h-4 w-4 mr-2" />
          Ask AI
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 px-6 py-4 border-b">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Home className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-primary">
                Happy<span className="text-foreground">Tenant</span>
              </span>
            </div>
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              <NavLinks onClick={() => setSidebarOpen(false)} />
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-background border-r">
          <div className="flex items-center gap-2 px-6 py-4 border-b">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Home className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-primary">
                Happy<span className="text-foreground">Tenant</span>
              </span>
            </Link>
          </div>
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <NavLinks />
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top nav */}
        <header className="sticky top-0 z-40 bg-background border-b">
          <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>

            <div className="flex-1">
              <h1 className="text-lg font-semibold">Tenant Portal</h1>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 pl-2 pr-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentTenant.avatarUrl} alt={currentTenant.name} />
                    <AvatarFallback>
                      {currentTenant.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium">
                    {currentTenant.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{currentTenant.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {currentTenant.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
