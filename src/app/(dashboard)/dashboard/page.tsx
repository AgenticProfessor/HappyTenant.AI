'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Home,
  Calendar,
  MoreHorizontal,
} from 'lucide-react';
import {
  mockDashboardStats,
  mockProperties as initialProperties,
  mockTenants as initialTenants,
  mockTransactions as initialTransactions,
  mockMaintenanceRequests,
  mockAIInsights,
  mockUnits as initialUnits,
} from '@/data/mock-data';
import { AddPropertyDialog } from '@/components/dashboard/AddPropertyDialog';
import { AddTenantDialog } from '@/components/dashboard/AddTenantDialog';
import { RecordPaymentDialog } from '@/components/dashboard/RecordPaymentDialog';
import { SendMessageDialog } from '@/components/dashboard/SendMessageDialog';
import { useStewardContext } from '@/hooks/use-steward-context';

// Type definitions
interface Property {
  id: string;
  organizationId: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  units: number;
}

interface Tenant {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'past';
  moveInDate: string;
  avatarUrl?: string;
}

interface Unit {
  id: string;
  propertyId: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  rent: number;
  status: 'occupied' | 'vacant';
}

interface Transaction {
  id: string;
  propertyId?: string;
  unitId?: string;
  tenantId?: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}

interface Message {
  id: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  body: string;
  channels: string[];
  sentAt: string;
}

export default function DashboardPage() {
  const stats = mockDashboardStats;

  useStewardContext({
    type: 'page',
    name: 'dashboard-overview',
    description: 'Main dashboard overview showing key performance indicators and recent activity',
    data: {
      stats,
      kpiSummary: {
        revenue: stats.totalRevenue,
        properties: stats.totalProperties,
        units: stats.totalUnits,
        occupancy: stats.occupiedUnits / stats.totalUnits,
      }
    },
    url: '/dashboard',
  });

  // Local state for data (persists until page refresh)
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [messages, setMessages] = useState<Message[]>([]);

  // Dialog open states
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [addTenantOpen, setAddTenantOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [sendMessageOpen, setSendMessageOpen] = useState(false);

  // Handlers for adding new data
  const handlePropertyAdded = (property: Property) => {
    setProperties((prev) => [...prev, property]);
  };

  const handleTenantAdded = (tenant: Tenant, lease?: { unitId: string; startDate: string; endDate: string; rentAmount: number }) => {
    setTenants((prev) => [...prev, tenant]);

    // If a lease was created, update the unit status to occupied
    if (lease) {
      setUnits((prev) =>
        prev.map((unit) =>
          unit.id === lease.unitId ? { ...unit, status: 'occupied' as const } : unit
        )
      );
    }
  };

  const handlePaymentRecorded = (transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
  };

  const handleMessageSent = (message: Message) => {
    setMessages((prev) => [message, ...prev]);
  };

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: '+12%',
      trend: 'up',
      icon: DollarSign,
      description: 'This month',
    },
    {
      title: 'Properties',
      value: stats.totalProperties.toString(),
      change: `${stats.totalUnits} units`,
      trend: 'neutral',
      icon: Building2,
      description: `${stats.occupiedUnits} occupied`,
    },
    {
      title: 'Active Tenants',
      value: stats.activeTenants.toString(),
      change: '+2',
      trend: 'up',
      icon: Users,
      description: 'This month',
    },
    {
      title: 'Collection Rate',
      value: `${stats.collectionRate}%`,
      change: '+3%',
      trend: 'up',
      icon: TrendingUp,
      description: 'vs last month',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your properties.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" aria-label="Select date range">
            <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
            Nov 2024
          </Button>
          <Button aria-label="View AI Insights">
            <Sparkles className="h-4 w-4 mr-2" aria-hidden="true" />
            AI Insights
          </Button>
        </div>
      </header>

      {/* KPI Cards */}
      <section aria-labelledby="kpi-heading" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <h2 id="kpi-heading" className="sr-only">Key Performance Indicators</h2>
        {kpiCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {card.trend === 'up' && (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" aria-label="Trending up" />
                )}
                {card.trend === 'down' && (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" aria-label="Trending down" />
                )}
                <span className={card.trend === 'up' ? 'text-green-500' : card.trend === 'down' ? 'text-red-500' : ''}>
                  {card.change}
                </span>
                <span className="ml-1">{card.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* AI Insights Banner */}
      <section aria-labelledby="ai-insights-heading">
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center" aria-hidden="true">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 id="ai-insights-heading" className="font-semibold">AI Assistant</h2>
                  <p className="text-sm text-muted-foreground">3 new insights for you today</p>
                </div>
              </div>
              <div className="flex-1 grid gap-3 sm:grid-cols-3">
                {mockAIInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className="p-3 rounded-lg bg-background/80 border"
                    role="article"
                    aria-label={`${insight.type} insight: ${insight.message}`}
                  >
                    <div className="flex items-start justify-between">
                      <Badge
                        variant={
                          insight.priority === 'high'
                            ? 'destructive'
                            : insight.priority === 'medium'
                              ? 'default'
                              : 'secondary'
                        }
                        className="text-xs"
                      >
                        {insight.type}
                      </Badge>
                      {insight.priority === 'high' && (
                        <AlertCircle className="h-4 w-4 text-destructive" aria-label="High priority" />
                      )}
                    </div>
                    <p className="text-sm mt-2 line-clamp-2">{insight.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rent Collection */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Rent Collection</CardTitle>
                <CardDescription>November 2024</CardDescription>
              </div>
              <Link href="/dashboard/payments">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Collected</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${stats.collectedRent.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-sm font-medium">Outstanding</p>
                    <p className="text-2xl font-bold text-amber-600">
                      ${stats.outstandingRent.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Progress value={stats.collectionRate} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {stats.collectionRate}% collected • {100 - stats.collectionRate}% pending
                </p>
              </div>

              {/* Recent payments */}
              <div className="mt-6 space-y-3">
                <p className="text-sm font-medium">Recent Payments</p>
                {transactions.slice(0, 3).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.status === 'completed' ? 'bg-green-100' : tx.status === 'pending' ? 'bg-amber-100' : 'bg-red-100'
                        }`}>
                        {tx.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : tx.status === 'pending' ? (
                          <Clock className="h-4 w-4 text-amber-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </p>
                      <Badge
                        variant={
                          tx.status === 'completed' ? 'default' : tx.status === 'pending' ? 'secondary' : 'destructive'
                        }
                        className="text-xs"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Maintenance Requests</CardTitle>
                <CardDescription>
                  {stats.openMaintenanceRequests} open requests
                </CardDescription>
              </div>
              <Link href="/dashboard/maintenance">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMaintenanceRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${request.priority === 'high' ? 'bg-red-100' :
                        request.priority === 'normal' ? 'bg-amber-100' : 'bg-blue-100'
                        }`}>
                        <Wrench className={`h-5 w-5 ${request.priority === 'high' ? 'text-red-600' :
                          request.priority === 'normal' ? 'text-amber-600' : 'text-blue-600'
                          }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{request.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Unit {request.unitId} • {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          request.status === 'open' ? 'destructive' :
                            request.status === 'in_progress' ? 'default' : 'secondary'
                        }
                      >
                        {request.status.replace('_', ' ')}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Properties Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Properties</CardTitle>
              <Link href="/dashboard/properties">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {properties.map((property) => (
                  <Link
                    key={property.id}
                    href={`/dashboard/properties/${property.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{property.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {property.units} units • {property.city}, {property.state}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {property.type}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tenants */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Tenants</CardTitle>
              <Link href="/dashboard/tenants">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tenants.slice(0, 5).map((tenant) => (
                  <div
                    key={tenant.id}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={tenant.avatarUrl} alt={tenant.name} />
                      <AvatarFallback>
                        {tenant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {tenant.email}
                      </p>
                    </div>
                    <Badge
                      variant={tenant.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {tenant.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="justify-start" onClick={() => setAddPropertyOpen(true)} aria-label="Add a new property">
                <Building2 className="h-4 w-4 mr-2" aria-hidden="true" />
                Add Property
              </Button>
              <Button variant="outline" size="sm" className="justify-start" onClick={() => setAddTenantOpen(true)} aria-label="Add a new tenant">
                <Users className="h-4 w-4 mr-2" aria-hidden="true" />
                Add Tenant
              </Button>
              <Button variant="outline" size="sm" className="justify-start" onClick={() => setRecordPaymentOpen(true)} aria-label="Record a payment">
                <DollarSign className="h-4 w-4 mr-2" aria-hidden="true" />
                Record Payment
              </Button>
              <Button variant="outline" size="sm" className="justify-start" onClick={() => setSendMessageOpen(true)} aria-label="Send a message">
                <MessageSquare className="h-4 w-4 mr-2" aria-hidden="true" />
                Send Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <AddPropertyDialog
        open={addPropertyOpen}
        onOpenChange={setAddPropertyOpen}
        onPropertyAdded={handlePropertyAdded}
      />

      <AddTenantDialog
        open={addTenantOpen}
        onOpenChange={setAddTenantOpen}
        onTenantAdded={handleTenantAdded}
        properties={properties}
        units={units}
      />

      <RecordPaymentDialog
        open={recordPaymentOpen}
        onOpenChange={setRecordPaymentOpen}
        onPaymentRecorded={handlePaymentRecorded}
        tenants={tenants}
      />

      <SendMessageDialog
        open={sendMessageOpen}
        onOpenChange={setSendMessageOpen}
        onMessageSent={handleMessageSent}
        tenants={tenants}
      />
    </div>
  );
}
