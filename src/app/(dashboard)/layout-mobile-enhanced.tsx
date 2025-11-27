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
  Building2,
  Users,
  CreditCard,
  Wrench,
  MessageSquare,
  FileText,
  Settings,
  HelpCircle,
  Menu,
  Bell,
  Search,
  Sparkles,
  ChevronDown,
  LogOut,
  User,
  Plus,
} from 'lucide-react';
import { mockUser, mockOrganization } from '@/data/mock-data';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Properties', href: '/dashboard/properties', icon: Building2 },
  { name: 'Tenants', href: '/dashboard/tenants', icon: Users },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare, badge: 3 },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
  { name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Sparkles },
];

const secondaryNavigation = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Help & Support', href: '/dashboard/help', icon: HelpCircle },
];

export default function DashboardLayout({
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
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation min-h-[44px]',
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
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation min-h-[44px]',
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
          <span className="font-semibold text-sm">AI Assistant</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Get help with tenant screening, rent collection, and more.
        </p>
        <Button size="sm" className="w-full touch-manipulation min-h-[44px]" variant="outline">
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
          <div className="flex h-16 items-center gap-2 sm:gap-4 px-4 sm:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden touch-manipulation min-h-[44px] min-w-[44px]"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>

            {/* Search - responsive */}
            <div className="flex-1 flex items-center min-w-0">
              <div className="w-full max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 text-sm bg-muted/50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            {/* Quick actions - responsive */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="hidden sm:flex touch-manipulation">
                    <Plus className="h-4 w-4 mr-2" />
                    Quick Add
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Building2 className="h-4 w-4 mr-2" />
                    Add Property
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Users className="h-4 w-4 mr-2" />
                    Add Tenant
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Record Payment
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Wrench className="h-4 w-4 mr-2" />
                    Create Request
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative touch-manipulation min-h-[44px] min-w-[44px]">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-2 pr-3 touch-manipulation min-h-[44px]">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={mockUser.avatarUrl} alt={mockUser.name} />
                      <AvatarFallback>
                        {mockUser.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium truncate max-w-[100px]">
                      {mockUser.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
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
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
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
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
