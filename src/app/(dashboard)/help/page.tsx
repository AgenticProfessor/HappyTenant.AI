'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  HelpCircle,
  Mail,
  MessageSquare,
  Book,
  Video,
  FileText,
  ExternalLink,
  Send,
  Phone,
  Clock,
  Play,
  CheckCircle2,
  Circle,
  AlertCircle,
  Activity,
  Zap,
  Server,
  Database,
  Shield,
  RefreshCw,
  ChevronRight,
  Rocket,
  Target,
  Award,
  Sparkles,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { mockUser } from '@/data/mock-data';

// Contact form schema
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  category: z.string().min(1, 'Please select a category'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

// Types
interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  thumbnail?: string;
  isNew?: boolean;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  href: string;
}

interface SystemStatus {
  service: string;
  status: 'operational' | 'degraded' | 'outage';
  latency?: number;
  uptime: string;
}

// Video tutorials data
const videoTutorials: VideoTutorial[] = [
  {
    id: '1',
    title: 'Getting Started with Happy Tenant',
    description: 'Learn the basics of setting up your account and adding your first property',
    duration: '8:32',
    category: 'Getting Started',
    isNew: true
  },
  {
    id: '2',
    title: 'Adding and Managing Properties',
    description: 'Complete guide to adding properties, units, and setting up rent amounts',
    duration: '12:45',
    category: 'Properties'
  },
  {
    id: '3',
    title: 'Tenant Screening Best Practices',
    description: 'How to screen tenants effectively using our built-in tools',
    duration: '15:20',
    category: 'Tenants'
  },
  {
    id: '4',
    title: 'Setting Up Online Rent Collection',
    description: 'Enable online payments and automatic rent reminders',
    duration: '10:15',
    category: 'Payments'
  },
  {
    id: '5',
    title: 'Managing Maintenance Requests',
    description: 'Track, assign, and resolve maintenance issues efficiently',
    duration: '9:48',
    category: 'Maintenance'
  },
  {
    id: '6',
    title: 'Creating and Sending Leases',
    description: 'Generate professional leases and collect e-signatures',
    duration: '11:30',
    category: 'Documents'
  },
  {
    id: '7',
    title: 'Financial Reports and Analytics',
    description: 'Understand your rental income and expenses at a glance',
    duration: '14:22',
    category: 'Reports'
  },
  {
    id: '8',
    title: 'Using the AI Assistant',
    description: 'Leverage AI to optimize rent pricing and predict issues',
    duration: '7:55',
    category: 'AI Features',
    isNew: true
  }
];

// Onboarding steps
const initialOnboardingSteps: OnboardingStep[] = [
  {
    id: '1',
    title: 'Complete your profile',
    description: 'Add your contact information and preferences',
    completed: true,
    href: '/dashboard/settings'
  },
  {
    id: '2',
    title: 'Add your first property',
    description: 'Set up your rental property with address and units',
    completed: true,
    href: '/dashboard/properties'
  },
  {
    id: '3',
    title: 'Add tenants',
    description: 'Add existing tenants or start finding new ones',
    completed: false,
    href: '/dashboard/tenants'
  },
  {
    id: '4',
    title: 'Set up rent collection',
    description: 'Enable online payments and automatic reminders',
    completed: false,
    href: '/dashboard/payments'
  },
  {
    id: '5',
    title: 'Create your first lease',
    description: 'Generate a professional lease agreement',
    completed: false,
    href: '/dashboard/docs'
  },
  {
    id: '6',
    title: 'Invite team members',
    description: 'Add property managers or assistants to your account',
    completed: false,
    href: '/dashboard/settings'
  }
];

// System status data
const systemStatuses: SystemStatus[] = [
  { service: 'Web Application', status: 'operational', latency: 45, uptime: '99.99%' },
  { service: 'API Services', status: 'operational', latency: 32, uptime: '99.98%' },
  { service: 'Database', status: 'operational', latency: 12, uptime: '99.99%' },
  { service: 'Payment Processing', status: 'operational', latency: 89, uptime: '99.95%' },
  { service: 'Email Delivery', status: 'operational', latency: 156, uptime: '99.97%' },
  { service: 'Document Storage', status: 'operational', latency: 67, uptime: '99.99%' },
  { service: 'AI Services', status: 'operational', latency: 234, uptime: '99.90%' }
];

// FAQ data
const faqData = [
  {
    category: 'Getting Started',
    questions: [
      {
        question: 'How do I add my first property?',
        answer:
          'To add a property, click on the "Properties" menu item in the sidebar, then click the "Add Property" button. Fill in the property details including name, address, and number of units. You can then add individual units to the property with their specific details like rent amount, bedrooms, and bathrooms.',
      },
      {
        question: 'How do I add tenants to my properties?',
        answer:
          'Navigate to the "Tenants" section and click "Add Tenant". Fill in the tenant information and select which unit they will be leasing. You can also create a lease agreement at the same time, or add it later from the tenant\'s profile page.',
      },
      {
        question: 'What is the AI Assistant and how does it work?',
        answer:
          'The AI Assistant helps you manage your properties more efficiently by analyzing your data and providing intelligent insights. It can suggest optimal rent prices, predict maintenance needs, identify collection risks, and help you draft messages to tenants. Access it from the "AI Assistant" menu or from various context-specific locations throughout the app.',
      },
    ],
  },
  {
    category: 'Rent & Payments',
    questions: [
      {
        question: 'How do I record a rent payment?',
        answer:
          'Go to the "Payments" section and click "Record Payment". Select the tenant, enter the payment amount, and choose the payment method. The payment will be automatically linked to the tenant\'s active lease and reflected in your financial reports.',
      },
      {
        question: 'Can tenants pay rent online?',
        answer:
          'Yes! Tenants can log into their portal and pay rent online using a credit card, debit card, or bank transfer. You can enable automatic payment reminders and late fee calculations in your settings. Payment processing fees may apply.',
      },
      {
        question: 'How do I set up automatic rent reminders?',
        answer:
          'Navigate to Settings > Notifications and enable "Rent Payment Reminders". You can customize when reminders are sent (e.g., 5 days before due date, on due date, and after due date). Reminders can be sent via email, SMS, or push notification.',
      },
    ],
  },
  {
    category: 'Maintenance Requests',
    questions: [
      {
        question: 'How do I manage maintenance requests?',
        answer:
          'View all maintenance requests in the "Maintenance" section. You can see request details, priority level, and status. Click on any request to view photos, assign it to a vendor, schedule repairs, update status, and communicate with the tenant about progress.',
      },
      {
        question: 'Can tenants submit maintenance requests themselves?',
        answer:
          'Yes! Tenants can submit maintenance requests through their tenant portal. They can describe the issue, upload photos, select a category, and indicate urgency. You\'ll receive an immediate notification and can respond directly through the platform.',
      },
    ],
  },
  {
    category: 'Leases & Documents',
    questions: [
      {
        question: 'How do I create a lease agreement?',
        answer:
          'From the Tenants page, click on a tenant and select "Create Lease". Fill in the lease terms including start date, end date (or select month-to-month), rent amount, security deposit, and any additional terms. You can use our customizable lease templates or upload your own.',
      },
      {
        question: 'Can tenants sign leases electronically?',
        answer:
          'Yes! Once you create a lease, you can send it to tenants for electronic signature. They\'ll receive an email with a link to review and sign the document. You\'ll be notified when it\'s signed, and the fully executed lease is stored in the Documents section.',
      },
    ],
  },
  {
    category: 'Account & Billing',
    questions: [
      {
        question: 'What subscription plans are available?',
        answer:
          'We offer Free, Pro, and Enterprise plans. The Free plan includes up to 2 properties with basic features. Pro ($49/month) includes unlimited properties, advanced analytics, and priority support. Enterprise offers custom solutions for large portfolios. View all plans in Settings > Billing.',
      },
      {
        question: 'Is my data secure?',
        answer:
          'Yes! We use bank-level encryption (256-bit SSL) for all data transmission and storage. Our servers are SOC 2 compliant and regularly audited. We perform daily backups and you can export your data at any time. We never share your data with third parties without your explicit consent.',
      },
    ],
  },
];

// Quick links data
const quickLinks = [
  {
    title: 'User Guide',
    description: 'Complete guide to using Happy Tenant',
    icon: Book,
    href: '#',
  },
  {
    title: 'Video Tutorials',
    description: 'Step-by-step video walkthroughs',
    icon: Video,
    href: '#',
  },
  {
    title: 'API Documentation',
    description: 'Developer documentation and API reference',
    icon: FileText,
    href: '#',
  },
  {
    title: 'Community Forum',
    description: 'Connect with other landlords',
    icon: MessageSquare,
    href: '/dashboard/community',
  },
];

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  const [onboardingSteps, setOnboardingSteps] = useState(initialOnboardingSteps);
  const [videoCategory, setVideoCategory] = useState('All');

  // Contact form
  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: mockUser.name,
      email: mockUser.email,
      subject: '',
      category: '',
      message: '',
    },
  });

  const onContactSubmit = (data: ContactFormValues) => {
    toast.success('Support request submitted successfully');
    console.log('Contact form data:', data);
    contactForm.reset({
      name: mockUser.name,
      email: mockUser.email,
      subject: '',
      category: '',
      message: '',
    });
  };

  // Toggle onboarding step
  const toggleOnboardingStep = (stepId: string) => {
    setOnboardingSteps(steps =>
      steps.map(step =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    );
  };

  // Calculate onboarding progress
  const completedSteps = onboardingSteps.filter(s => s.completed).length;
  const onboardingProgress = (completedSteps / onboardingSteps.length) * 100;

  // Filter FAQs based on search query
  const filteredFaqData = faqData.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

  // Video categories
  const videoCategories = ['All', ...Array.from(new Set(videoTutorials.map(v => v.category)))];
  const filteredVideos = videoCategory === 'All'
    ? videoTutorials
    : videoTutorials.filter(v => v.category === videoCategory);

  // Get status color
  const getStatusColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'outage': return 'text-red-600 bg-red-100';
    }
  };

  const getStatusIcon = (status: SystemStatus['status']) => {
    switch (status) {
      case 'operational': return <CheckCircle2 className="h-4 w-4" />;
      case 'degraded': return <AlertCircle className="h-4 w-4" />;
      case 'outage': return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">
          Get help with Happy Tenant, watch tutorials, and track your setup progress
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Tutorials</span>
          </TabsTrigger>
          <TabsTrigger value="onboarding" className="gap-2">
            <Rocket className="h-4 w-4" />
            <span className="hidden sm:inline">Get Started</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">FAQ</span>
          </TabsTrigger>
          <TabsTrigger value="status" className="gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Status</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Support options */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Live Chat</CardTitle>
                    <CardDescription className="text-xs">
                      Available 9am - 5pm EST
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Email Support</CardTitle>
                    <CardDescription className="text-xs">
                      Response within 24 hours
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  support@happytenant.com
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Phone Support</CardTitle>
                    <CardDescription className="text-xs">
                      Pro & Enterprise only
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  1-800-HAPPY-01
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Popular resources and documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {quickLinks.map((link) => (
                  <a
                    key={link.title}
                    href={link.href}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <link.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{link.title}</p>
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {link.description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Onboarding Progress Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5" />
                    Setup Progress
                  </CardTitle>
                  <CardDescription>
                    {completedSteps} of {onboardingSteps.length} steps completed
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setActiveTab('onboarding')}>
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={onboardingProgress} className="h-2" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {onboardingSteps.slice(0, 3).map((step) => (
                    <div
                      key={step.id}
                      className={`flex items-center gap-2 p-2 rounded-lg ${
                        step.completed ? 'bg-green-50' : 'bg-muted/50'
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={`text-sm ${step.completed ? 'text-green-700' : ''}`}>
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support Form */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Can&apos;t find what you&apos;re looking for? Send us a message and we&apos;ll get back to you soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...contactForm}>
                <form
                  onSubmit={contactForm.handleSubmit(onContactSubmit)}
                  className="space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={contactForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={contactForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your.email@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={contactForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="technical">Technical Issue</SelectItem>
                            <SelectItem value="billing">Billing Question</SelectItem>
                            <SelectItem value="feature">Feature Request</SelectItem>
                            <SelectItem value="account">Account Help</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={contactForm.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief description of your issue"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={contactForm.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe your issue or question in detail..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Please include as much detail as possible to help us assist you better
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Average response time: 2-4 hours during business hours
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" size="lg">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Tutorials Tab */}
        <TabsContent value="videos" className="mt-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Video Tutorials</h2>
              <p className="text-sm text-muted-foreground">
                Step-by-step guides to help you master Happy Tenant
              </p>
            </div>
            <Select value={videoCategory} onValueChange={setVideoCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {videoCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVideos.map((video) => (
              <Card
                key={video.id}
                className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-14 w-14 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
                      <Play className="h-6 w-6 text-primary ml-1" />
                    </div>
                  </div>
                  {video.isNew && (
                    <Badge className="absolute top-2 left-2 bg-green-500">New</Badge>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <CardContent className="p-4">
                  <Badge variant="outline" className="mb-2 text-xs">
                    {video.category}
                  </Badge>
                  <h3 className="font-semibold line-clamp-1">{video.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {video.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Video Dialog */}
          <Dialog open={selectedVideo !== null} onOpenChange={() => setSelectedVideo(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{selectedVideo?.title}</DialogTitle>
                <DialogDescription>{selectedVideo?.description}</DialogDescription>
              </DialogHeader>
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="h-20 w-20 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-4">
                    <Play className="h-10 w-10 text-primary ml-1" />
                  </div>
                  <p className="text-muted-foreground">Video player placeholder</p>
                  <p className="text-sm text-muted-foreground">{selectedVideo?.duration}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Onboarding Tab */}
        <TabsContent value="onboarding" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle>Get Started with Happy Tenant</CardTitle>
                  <CardDescription>
                    Complete these steps to set up your account
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{Math.round(onboardingProgress)}%</p>
                  <p className="text-sm text-muted-foreground">Complete</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={onboardingProgress} className="h-3 mb-6" />

              <div className="space-y-4">
                {onboardingSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${
                      step.completed ? 'bg-green-50 border-green-200' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={step.completed}
                        onCheckedChange={() => toggleOnboardingStep(step.id)}
                      />
                      <span className={`text-lg font-semibold ${
                        step.completed ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${step.completed ? 'text-green-700' : ''}`}>
                        {step.title}
                      </h4>
                      <p className={`text-sm ${step.completed ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {step.description}
                      </p>
                    </div>
                    {!step.completed && (
                      <Button size="sm" asChild>
                        <a href={step.href}>
                          Start
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </a>
                      </Button>
                    )}
                    {step.completed && (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                ))}
              </div>

              {onboardingProgress === 100 && (
                <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 text-center">
                  <Award className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-green-700">
                    Congratulations! Setup Complete
                  </h3>
                  <p className="text-sm text-green-600 mt-1">
                    You&apos;re all set to manage your properties like a pro!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-700">Set up automatic rent reminders</p>
                    <p className="text-sm text-blue-600">
                      Reduce late payments by 60% with automated reminders
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50">
                  <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-700">Use the AI assistant</p>
                    <p className="text-sm text-purple-600">
                      Get optimal rent pricing suggestions based on market data
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Find answers to common questions about using Happy Tenant
                  </CardDescription>
                </div>
                <HelpCircle className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* FAQ Accordion */}
              {filteredFaqData.length > 0 ? (
                <div className="space-y-6">
                  {filteredFaqData.map((category) => (
                    <div key={category.category} className="space-y-3">
                      <h3 className="text-sm font-semibold text-primary">
                        {category.category}
                      </h3>
                      <Accordion type="single" collapsible className="w-full">
                        {category.questions.map((item, index) => (
                          <AccordionItem key={index} value={`${category.category}-${index}`}>
                            <AccordionTrigger className="text-left">
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {item.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No FAQs found matching your search.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Status Tab */}
        <TabsContent value="status" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Status
                  </CardTitle>
                  <CardDescription>
                    Current operational status of all Happy Tenant services
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500">All Systems Operational</Badge>
                  <Button variant="ghost" size="sm">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemStatuses.map((service) => (
                  <div
                    key={service.service}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(service.status)}`}>
                        {service.service === 'Web Application' && <Server className="h-4 w-4" />}
                        {service.service === 'API Services' && <Zap className="h-4 w-4" />}
                        {service.service === 'Database' && <Database className="h-4 w-4" />}
                        {service.service === 'Payment Processing' && <Shield className="h-4 w-4" />}
                        {service.service === 'Email Delivery' && <Mail className="h-4 w-4" />}
                        {service.service === 'Document Storage' && <FileText className="h-4 w-4" />}
                        {service.service === 'AI Services' && <Sparkles className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{service.service}</p>
                        <p className="text-sm text-muted-foreground">
                          Uptime: {service.uptime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {service.latency && (
                        <div className="text-right">
                          <p className="text-sm font-medium">{service.latency}ms</p>
                          <p className="text-xs text-muted-foreground">Latency</p>
                        </div>
                      )}
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStatusColor(service.status)}`}>
                        {getStatusIcon(service.status)}
                        <span className="capitalize">{service.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status History */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-4">Recent Incidents</h4>
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p>No incidents reported in the last 90 days</p>
                </div>
              </div>

              {/* Subscribe to updates */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Subscribe to Status Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified about service disruptions via email
                    </p>
                  </div>
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Subscribe
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
