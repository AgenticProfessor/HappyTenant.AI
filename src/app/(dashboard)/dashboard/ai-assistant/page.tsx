'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  MessageSquare,
  Users,
  Wrench,
  DollarSign,
  FileSearch,
  TrendingUp,
  Brain,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { AIAssistantChat } from '@/components/ai/AIAssistantChat';

const aiAgents = [
  {
    id: 'communication',
    name: 'Tenant Communication',
    description: 'Draft professional messages, respond to inquiries, and manage tenant communications',
    icon: MessageSquare,
    status: 'active',
    capabilities: ['Draft messages', 'Auto-respond', 'Tone adjustment', 'Multi-language'],
  },
  {
    id: 'maintenance',
    name: 'Maintenance Triage',
    description: 'Automatically categorize and prioritize maintenance requests',
    icon: Wrench,
    status: 'active',
    capabilities: ['Priority scoring', 'Vendor matching', 'Cost estimation', 'Scheduling'],
  },
  {
    id: 'collection',
    name: 'Rent Collection',
    description: 'Optimize collection strategies and automate payment reminders',
    icon: DollarSign,
    status: 'active',
    capabilities: ['Payment reminders', 'Late fee tracking', 'Collection scripts', 'Risk assessment'],
  },
  {
    id: 'screening',
    name: 'Tenant Screening',
    description: 'Analyze applications and provide risk assessments for potential tenants',
    icon: Users,
    status: 'beta',
    capabilities: ['Background checks', 'Income verification', 'Reference analysis', 'Risk scoring'],
  },
  {
    id: 'documents',
    name: 'Document Analysis',
    description: 'Extract information from leases, contracts, and other documents',
    icon: FileSearch,
    status: 'beta',
    capabilities: ['Lease parsing', 'Contract review', 'Data extraction', 'Compliance checks'],
  },
  {
    id: 'insights',
    name: 'Financial Insights',
    description: 'Generate reports and provide financial recommendations',
    icon: TrendingUp,
    status: 'coming_soon',
    capabilities: ['Revenue forecasting', 'Expense analysis', 'Market comparison', 'Tax optimization'],
  },
];

const recentActivity = [
  { agent: 'Maintenance Triage', action: 'Prioritized request #234 as Urgent', time: '5 min ago' },
  { agent: 'Tenant Communication', action: 'Drafted rent reminder for 3 tenants', time: '15 min ago' },
  { agent: 'Rent Collection', action: 'Sent payment confirmation to John Smith', time: '1 hour ago' },
  { agent: 'Tenant Screening', action: 'Completed analysis for applicant Maria Garcia', time: '2 hours ago' },
];

export default function AIAssistantPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Powered by AI
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Your intelligent property management co-pilot
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            Activity Log
          </Button>
          <Button>
            <Zap className="h-4 w-4 mr-2" />
            Configure Agents
          </Button>
        </div>
      </div>

      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList>
          <TabsTrigger value="chat">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="agents">
            <Brain className="h-4 w-4 mr-2" />
            AI Agents
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Clock className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b py-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base">Happy Tenant AI</CardTitle>
                  <CardDescription>Ask anything about property management</CardDescription>
                </div>
                <Badge variant="outline" className="ml-auto gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Online
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <AIAssistantChat />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          {/* AI capabilities overview */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Agents
                </CardTitle>
                <Brain className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">Running 24/7</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tasks Automated
                </CardTitle>
                <Zap className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">847</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Time Saved
                </CardTitle>
                <Clock className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42 hrs</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* AI Agents grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {aiAgents.map((agent) => (
              <Card key={agent.id} className={agent.status === 'coming_soon' ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      agent.status === 'active' ? 'bg-primary/10' :
                      agent.status === 'beta' ? 'bg-amber-100' : 'bg-muted'
                    }`}>
                      <agent.icon className={`h-5 w-5 ${
                        agent.status === 'active' ? 'text-primary' :
                        agent.status === 'beta' ? 'text-amber-600' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <Badge
                      variant={
                        agent.status === 'active' ? 'default' :
                        agent.status === 'beta' ? 'secondary' : 'outline'
                      }
                    >
                      {agent.status === 'coming_soon' ? 'Coming Soon' : agent.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-3">{agent.name}</CardTitle>
                  <CardDescription>{agent.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.map((cap, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                  {agent.status !== 'coming_soon' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                    >
                      Configure
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Safety & Privacy */}
          <Card className="bg-muted/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Safety & Privacy</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    All AI agents operate with strict safety rails. They can never authorize payments,
                    access sensitive financial data, or take irreversible actions without your approval.
                    Your data is encrypted and never used to train AI models.
                  </p>
                  <div className="flex gap-4 mt-3">
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Human oversight required
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Data encrypted
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Audit logging
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Activity</CardTitle>
              <CardDescription>See what your AI agents have been doing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-3 rounded-lg border"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.agent}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Full Activity Log
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
