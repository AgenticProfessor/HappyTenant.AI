'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Menu,
  Home,
  Sparkles,
  Bell,
  Megaphone,
  FileSearch,
  FileText,
  CreditCard,
  Users,
  Bot,
  Calculator,
  GraduationCap,
  Scale,
  BookOpen,
  Search,
  Receipt,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import React from 'react';

// Navigation data
const featuresData = [
  {
    title: 'Marketing & Listings',
    icon: Megaphone,
    items: [
      { name: 'Property Listings', href: '/features/listings' },
      { name: 'Syndication', href: '/features/syndication' },
      { name: 'AI-Generated Descriptions', href: '/features/ai-descriptions', ai: true },
    ],
  },
  {
    title: 'Applications & Screenings',
    icon: FileSearch,
    items: [
      { name: 'Tenant Applications', href: '/features/applications' },
      { name: 'Background Checks', href: '/features/screening' },
      { name: 'AI Risk Assessment', href: '/features/ai-risk', ai: true },
    ],
  },
  {
    title: 'Leases',
    icon: FileText,
    items: [
      { name: 'Digital Leases', href: '/features/leases' },
      { name: 'E-Signatures', href: '/features/esignatures' },
      { name: 'AI Template Generator', href: '/features/ai-templates', ai: true },
    ],
  },
  {
    title: 'Accounting & Payments',
    icon: CreditCard,
    items: [
      { name: 'Rent Collection', href: '/features/rent-collection' },
      { name: 'Expense Tracking', href: '/features/expenses' },
      { name: 'Financial Reports', href: '/features/reports' },
    ],
  },
  {
    title: 'Tenant Management',
    icon: Users,
    items: [
      { name: 'Communication', href: '/features/messaging' },
      { name: 'Maintenance Tracking', href: '/features/maintenance' },
      { name: 'Document Storage', href: '/features/documents' },
    ],
  },
  {
    title: 'AI Assistant',
    icon: Bot,
    items: [
      { name: 'Chat Assistant', href: '/features/ai-assistant', ai: true },
      { name: 'Smart Insights', href: '/features/ai-insights', ai: true },
      { name: 'Automation', href: '/features/automation', ai: true },
    ],
  },
];

const landlordsData = {
  tools: [
    { name: 'Rent Estimator', href: '/tools/rent-estimator', icon: Calculator },
    { name: 'ROI Calculator', href: '/tools/roi-calculator', icon: Calculator },
    { name: 'Cap Rate Calculator', href: '/tools/cap-rate', icon: Calculator },
  ],
  education: [
    { name: 'Blog Articles', href: '/blog', icon: BookOpen },
    { name: 'Video Tutorials', href: '/tutorials', icon: GraduationCap },
    { name: 'Landlord Guides', href: '/guides', icon: BookOpen },
  ],
  resources: [
    { name: 'Landlord-Tenant Laws', href: '/laws', icon: Scale },
    { name: 'Forms Library', href: '/forms', icon: FileText },
    { name: 'Best Practices', href: '/best-practices', icon: Shield },
  ],
};

const rentersData = [
  {
    title: 'Find a Home',
    items: [
      { name: 'Property Search', href: '/search', icon: Search },
      { name: 'Application Portal', href: '/apply', icon: FileSearch },
    ],
  },
  {
    title: 'Resources',
    items: [
      { name: "Renter's Guide", href: '/renters-guide', icon: BookOpen },
      { name: 'Moving Checklist', href: '/moving-checklist', icon: FileText },
      { name: 'Know Your Rights', href: '/tenant-rights', icon: Scale },
    ],
  },
  {
    title: 'Payments',
    items: [
      { name: 'Pay Rent Online', href: '/tenant/payments', icon: CreditCard },
      { name: 'Payment History', href: '/tenant/history', icon: Receipt },
    ],
  },
];

// Mock notification count for AI regulatory updates
const pendingRegUpdates = 3;

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">
              Happy<span className="text-foreground">Tenant</span>
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:w-[400px] overflow-y-auto">
              <nav className="flex flex-col gap-2 mt-8">
                <Accordion type="single" collapsible className="w-full">
                  {/* Features Mobile */}
                  <AccordionItem value="features">
                    <AccordionTrigger className="text-base font-medium">Features</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pl-4">
                        {featuresData.map((category) => (
                          <div key={category.title}>
                            <p className="text-sm font-medium text-muted-foreground mb-2">{category.title}</p>
                            <div className="space-y-2">
                              {category.items.map((item) => (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {item.name}
                                  {item.ai && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-coral-light text-coral">
                                      AI
                                    </span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Landlords Mobile */}
                  <AccordionItem value="landlords">
                    <AccordionTrigger className="text-base font-medium">
                      <span className="flex items-center gap-2">
                        Landlords
                        {pendingRegUpdates > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-coral text-[10px] font-bold text-white">
                            {pendingRegUpdates}
                          </span>
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pl-4">
                        {/* AI Compliance Alert Mobile */}
                        <div className="p-3 rounded-lg bg-coral-light border border-coral/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-coral" />
                            <span className="text-sm font-semibold text-coral">AI Law Updates</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {pendingRegUpdates} pending regulatory changes in your states
                          </p>
                          <Link
                            href="/compliance"
                            className="text-xs font-medium text-coral flex items-center gap-1"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            View Updates <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Tools & Calculators</p>
                          <div className="space-y-2">
                            {landlordsData.tools.map((item) => (
                              <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <item.icon className="h-4 w-4 text-muted-foreground" />
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Education</p>
                          <div className="space-y-2">
                            {landlordsData.education.map((item) => (
                              <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <item.icon className="h-4 w-4 text-muted-foreground" />
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Resources</p>
                          <div className="space-y-2">
                            {landlordsData.resources.map((item) => (
                              <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <item.icon className="h-4 w-4 text-muted-foreground" />
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Renters Mobile */}
                  <AccordionItem value="renters">
                    <AccordionTrigger className="text-base font-medium">Renters</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pl-4">
                        {rentersData.map((section) => (
                          <div key={section.title}>
                            <p className="text-sm font-medium text-muted-foreground mb-2">{section.title}</p>
                            <div className="space-y-2">
                              {section.items.map((item) => (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  <item.icon className="h-4 w-4 text-muted-foreground" />
                                  {item.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Link
                  href="/pricing"
                  className="text-base font-medium py-4 border-b hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>

                <hr className="my-4" />
                <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Landlord Login
                  </Button>
                </Link>
                <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Started Free
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-1">
          <NavigationMenu>
            <NavigationMenuList>
              {/* Features Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm font-medium">Features</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[800px] p-6">
                    <div className="grid grid-cols-3 gap-6">
                      {featuresData.map((category) => (
                        <div key={category.title} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                              <category.icon className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="font-semibold text-sm">{category.title}</h3>
                          </div>
                          <ul className="space-y-2">
                            {category.items.map((item) => (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {item.name}
                                  {item.ai && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-coral-light text-coral">
                                      AI
                                    </span>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t">
                      <Link
                        href="/features"
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      >
                        View all features <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Landlords Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm font-medium">
                  <span className="flex items-center gap-2">
                    Landlords
                    {pendingRegUpdates > 0 && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[9px] font-bold text-white">
                        {pendingRegUpdates}
                      </span>
                    )}
                  </span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[600px] p-6">
                    {/* AI Compliance Highlight Section */}
                    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[var(--coral-light)] to-mint-light border border-coral/10">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                          <div className="relative">
                            <Bell className="h-6 w-6 text-coral" />
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[8px] font-bold text-white">
                              {pendingRegUpdates}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="h-4 w-4 text-coral" />
                            <h3 className="font-semibold text-coral">AI-Powered Compliance</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {pendingRegUpdates} pending regulatory changes detected in your states. Your templates stay compliant automatically.
                          </p>
                          <Link
                            href="/compliance"
                            className="inline-flex items-center gap-1 text-sm font-medium text-coral hover:underline"
                          >
                            View Updates <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                          <Calculator className="h-4 w-4 text-primary" />
                          Tools & Calculators
                        </h3>
                        <ul className="space-y-2">
                          {landlordsData.tools.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          Education
                        </h3>
                        <ul className="space-y-2">
                          {landlordsData.education.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          Resources
                        </h3>
                        <ul className="space-y-2">
                          {landlordsData.resources.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Renters Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm font-medium">Renters</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[500px] p-6">
                    <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-mint-light">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                          <Search className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Find Your Next Home</h3>
                          <p className="text-sm text-muted-foreground">Browse available rentals in your area</p>
                        </div>
                        <Button size="sm" className="ml-auto bg-mint hover:bg-mint/90 text-white">
                          Search
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      {rentersData.map((section) => (
                        <div key={section.title} className="space-y-3">
                          <h3 className="font-semibold text-sm">{section.title}</h3>
                          <ul className="space-y-2">
                            {section.items.map((item) => (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <item.icon className="h-4 w-4" />
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Pricing Link */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/pricing">Pricing</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop CTA buttons */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-3">
          <Link href="/sign-in">
            <Button variant="outline">Landlord Login</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-primary hover:bg-primary/90">
              <Sparkles className="mr-2 h-4 w-4" />
              Get Started Free
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
