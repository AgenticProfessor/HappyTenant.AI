'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
      {
        question: 'What payment methods are supported?',
        answer:
          'We support credit cards, debit cards, ACH bank transfers, and cash payments. For online payments, we use secure payment processing with industry-standard encryption. You can track all payment methods and their history in the Payments section.',
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
      {
        question: 'How do I track maintenance costs?',
        answer:
          'Each maintenance request includes fields for estimated and actual costs. When you mark a request as completed, you can enter the final cost which automatically gets added to your expense tracking. View all maintenance expenses in the Payments section under "Expenses".',
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
      {
        question: 'How do I store and organize documents?',
        answer:
          'The Documents section allows you to upload and organize all property-related documents including leases, inspection reports, photos, receipts, and more. Documents can be organized by property, unit, or tenant, and are securely stored with encryption.',
      },
    ],
  },
  {
    category: 'Reports & Analytics',
    questions: [
      {
        question: 'What financial reports are available?',
        answer:
          'You can generate income statements, cash flow reports, expense reports, and rent roll reports. All reports can be filtered by date range, property, or unit. Export reports to PDF or CSV for sharing with accountants or tax preparation.',
      },
      {
        question: 'How do I track my rental income and expenses?',
        answer:
          'All rent payments and expenses are automatically tracked in the system. View your dashboard for a high-level overview, or go to the Payments section for detailed transaction history. You can categorize expenses for tax purposes and generate year-end reports.',
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
        question: 'How do I upgrade or downgrade my plan?',
        answer:
          'Go to Settings > Billing and click "Change Plan". You can upgrade immediately, and any downgrade will take effect at the end of your current billing cycle. We\'ll prorate any charges or credits automatically.',
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
    href: '#',
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter FAQs based on search query
  const filteredFaqData = faqData.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">
          Get help with Happy Tenant and find answers to common questions
        </p>
      </div>

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

      {/* FAQ Section */}
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
            <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
    </div>
  );
}
