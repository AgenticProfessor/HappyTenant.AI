'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import {
  Home,
  Building2,
  Users,
  CreditCard,
  Wrench,
  MessageSquare,
  FileText,
  PenTool,
  UserPlus,
  ClipboardList,
  BarChart3,
  Receipt,
  Calculator,
  Users2,
  HelpCircle,
  Gift,
  Settings,
  TrendingUp,
  ChevronRight,
  FileBarChart,
} from 'lucide-react';

// Navigation structure matching TurboTenant
const mainNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare, badge: 3 },
  { name: 'Properties', href: '/dashboard/properties', icon: Building2 },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
  { name: 'Lease Profiles', href: '/dashboard/lease-profiles', icon: FileText },
  { name: 'Documents & E-Sign', href: '/dashboard/documents', icon: PenTool },
];

const rentersNavigation = [
  { name: 'Leads', href: '/dashboard/leads', icon: UserPlus },
  { name: 'Applicants', href: '/dashboard/applicants', icon: ClipboardList },
  { name: 'Tenants', href: '/dashboard/tenants', icon: Users },
];

const accountingNavigation = [
  { name: 'Insights', href: '/dashboard/insights', icon: BarChart3 },
  { name: 'Reports', href: '/dashboard/reports', icon: FileBarChart },
];

const resourcesNavigation = [
  { name: 'Toolbox', href: '/dashboard/toolbox', icon: Calculator },
  { name: 'Intelligence', href: '/dashboard/intelligence', icon: Users2 },
  { name: 'Need Help?', href: '/dashboard/help', icon: HelpCircle },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const NavItem = ({
    item,
    onClick,
  }: {
    item: { name: string; href: string; icon: React.ComponentType<{ className?: string }>; badge?: number };
    onClick?: () => void;
  }) => {
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        onClick={onClick}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200',
          active
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
        <span className="flex-1">{item.name}</span>
        {item.badge && (
          <Badge className="bg-red-500 hover:bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
            <VisuallyHidden>{item.badge} unread</VisuallyHidden>
            <span aria-hidden="true">{item.badge}</span>
          </Badge>
        )}
      </Link>
    );
  };

  const SectionHeader = ({ children }: { children: React.ReactNode }) => (
    <p className="px-3 py-2 text-[11px] font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
      {children}
    </p>
  );

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2" aria-label="Happy Tenant home">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary" aria-hidden="true">
            <Home className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">
            Happy<span className="text-sidebar-primary">Tenant</span>
          </span>
        </Link>
      </div>

      {/* Unlock Insights CTA */}
      <div className="px-3 py-3">
        <Button
          className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground font-medium justify-start gap-2"
          size="sm"
        >
          <TrendingUp className="h-4 w-4" />
          Unlock Insights
          <ChevronRight className="h-4 w-4 ml-auto" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Main navigation">
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainNavigation.map((item) => (
            <NavItem key={item.name} item={item} onClick={onNavigate} />
          ))}
        </div>

        {/* Renters Section */}
        <div className="mt-6">
          <SectionHeader>Renters</SectionHeader>
          <div className="space-y-1">
            {rentersNavigation.map((item) => (
              <NavItem key={item.name} item={item} onClick={onNavigate} />
            ))}
          </div>
        </div>

        {/* Accounting Section */}
        <div className="mt-6">
          <SectionHeader>Accounting</SectionHeader>
          <div className="space-y-1">
            {accountingNavigation.map((item) => (
              <NavItem key={item.name} item={item} onClick={onNavigate} />
            ))}
          </div>
        </div>

        {/* Resources Section */}
        <div className="mt-6">
          <SectionHeader>Resources</SectionHeader>
          <div className="space-y-1">
            {resourcesNavigation.map((item) => (
              <NavItem key={item.name} item={item} onClick={onNavigate} />
            ))}
          </div>
        </div>
      </nav>

      {/* Account Link at Bottom */}
      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/dashboard/account"
          onClick={onNavigate}
          aria-current={isActive('/dashboard/account') ? 'page' : undefined}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200',
            isActive('/dashboard/account')
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
          )}
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
          Account
          <ChevronRight className="h-4 w-4 ml-auto text-sidebar-foreground/50" />
        </Link>
      </div>
    </div>
  );
}
