import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Users,
  CreditCard,
  Wrench,
  FileText,
  MessageSquare,
  Sparkles,
  Check,
  Star,
  ArrowRight,
  Shield,
  Zap,
  Bot,
  TrendingUp,
  Clock,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section aria-labelledby="hero-heading" className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            {/* Left column - Text */}
            <div className="max-w-xl">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
                AI-Powered Property Management
              </Badge>
              <h1 id="hero-heading" className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Simplify how you{' '}
                <span className="text-primary">manage your rentals.</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Get leads, screen tenants, create leases, and collect rent — all in one place.
                With AI that works while you sleep.{' '}
                <span className="font-semibold text-foreground">Free for landlords.</span>
              </p>

              {/* Unit selector */}
              <div className="mt-8">
                <fieldset>
                  <legend className="text-sm font-medium text-muted-foreground mb-3">
                    How many units do you manage?
                  </legend>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Number of units">
                    {['1-2', '3-9', '10+', 'None yet'].map((option) => (
                      <Button
                        key={option}
                        variant="outline"
                        className="px-6 hover:bg-primary hover:text-primary-foreground"
                        aria-label={`${option} units`}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/sign-up">
                  <Button size="lg" className="w-full sm:w-auto">
                    Sign Up for Free
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
              </div>

              {/* Social proof */}
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full bg-muted border-2 border-background"
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1">
                    <div className="flex" role="img" aria-label="5 out of 5 stars">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                      ))}
                    </div>
                    <span className="ml-1 font-semibold">4.9/5</span>
                  </div>
                  <p className="text-muted-foreground">from 2,000+ landlords</p>
                </div>
              </div>
            </div>

            {/* Right column - AI Demo Card */}
            <div className="relative">
              <Card className="shadow-2xl border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-semibold">AI Assistant</span>
                    <Badge variant="secondary" className="ml-auto">Live Demo</Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">Tenant message received:</p>
                      <p className="text-sm mt-1">&quot;When will someone fix the leak?&quot;</p>
                    </div>

                    <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">AI-Generated Response</span>
                      </div>
                      <p className="text-sm">
                        &quot;Hi John! Mike&apos;s Plumbing is scheduled for tomorrow 10am-12pm
                        to fix your kitchen faucet leak. You&apos;ll get a reminder in the morning!&quot;
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm">Send</Button>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="text-center p-2 rounded-lg bg-green-50">
                        <p className="text-lg font-bold text-green-600">2.5s</p>
                        <p className="text-xs text-muted-foreground">Response time</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-blue-50">
                        <p className="text-lg font-bold text-blue-600">24/7</p>
                        <p className="text-xs text-muted-foreground">Available</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-purple-50">
                        <p className="text-lg font-bold text-purple-600">95%</p>
                        <p className="text-xs text-muted-foreground">Accuracy</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y bg-muted/30 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-6">
            Trusted by 50,000+ landlords managing $2B+ in rental properties
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {['Zillow', 'TransUnion', 'Stripe', 'Plaid'].map((partner) => (
              <div key={partner} className="text-xl font-bold text-muted-foreground">
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section aria-labelledby="features-heading" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 id="features-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features made simple, with AI that enhances every step.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Home,
                title: 'Property Management',
                description: 'Track units, leases, and docs in one place',
                ai: 'AI organizes your documents',
              },
              {
                icon: Users,
                title: 'Tenant Screening',
                description: 'Credit, criminal, eviction checks in minutes',
                ai: 'AI risk scoring',
              },
              {
                icon: CreditCard,
                title: 'Rent Collection',
                description: 'ACH & card payments, autopay & late fees',
                ai: 'AI-optimized reminders',
              },
              {
                icon: FileText,
                title: 'Lease Management',
                description: 'State-specific templates, e-signatures',
                ai: 'AI drafts custom clauses',
              },
              {
                icon: Wrench,
                title: 'Maintenance Requests',
                description: 'Track, assign, and resolve issues fast',
                ai: 'AI triage & vendor matching',
              },
              {
                icon: MessageSquare,
                title: 'Communication Hub',
                description: 'In-app chat, SMS & email in one inbox',
                ai: 'AI auto-responses',
              },
            ].map((feature) => (
              <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{feature.description}</p>
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Sparkles className="h-3 w-3" />
                    {feature.ai}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Showcase Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">
              <Bot className="mr-1 h-3 w-3" />
              Powered by AI
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Meet your AI property manager
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              It handles the busy work so you can focus on growing your portfolio.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {[
              {
                icon: MessageSquare,
                title: 'Smart Communication',
                description: 'AI reads tenant messages, understands intent, and drafts perfect responses. You approve with one click.',
                stat: '80%',
                statLabel: 'messages handled automatically',
              },
              {
                icon: Wrench,
                title: 'Maintenance Triage',
                description: 'AI analyzes photos, categorizes issues, assesses urgency, and matches with the right vendor.',
                stat: '45min',
                statLabel: 'avg response time (vs 4 hours)',
              },
              {
                icon: TrendingUp,
                title: 'Financial Insights',
                description: 'AI spots rent optimization opportunities, predicts vacancies, and identifies cost-saving measures.',
                stat: '$2,400',
                statLabel: 'avg annual savings found',
              },
            ].map((item) => (
              <Card key={item.title} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                  <div className="pt-4 border-t">
                    <p className="text-2xl font-bold text-primary">{item.stat}</p>
                    <p className="text-sm text-muted-foreground">{item.statLabel}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Get started in under 5 minutes
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Add your properties', time: '2 min', icon: Home },
              { step: '2', title: 'Import tenants & leases', time: '3 min', icon: Users },
              { step: '3', title: 'Let AI handle the rest', time: 'Done!', icon: Sparkles },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center">
                {i < 2 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-4 h-8 w-8 text-muted-foreground/30" />
                )}
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-sm font-medium text-primary mb-1">Step {item.step}</div>
                <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.time}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/sign-up">
              <Button size="lg">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple pricing. Powerful features.
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="relative">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold">Free</h3>
                <p className="text-muted-foreground mt-1">For getting started</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-8 space-y-3">
                  {[
                    'Up to 3 units',
                    'Basic screening',
                    'Rent collection',
                    'Maintenance tracking',
                    '50 AI requests/month',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-8" variant="outline">
                  Start Free
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary">Most Popular</Badge>
              </div>
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold">Pro</h3>
                <p className="text-muted-foreground mt-1">For serious landlords</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold">$12</span>
                  <span className="text-muted-foreground">/unit/month</span>
                </div>
                <ul className="mt-8 space-y-3">
                  {[
                    'Unlimited units',
                    'Premium screening',
                    'AI Assistant',
                    'Auto rent collection',
                    'E-signatures',
                    'Accounting sync',
                    'Priority support',
                    '500 AI requests/month',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-8">
                  Start 14-day trial
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-muted-foreground mt-8">
            Managing 50+ units?{' '}
            <Link href="/contact" className="text-primary hover:underline">
              Contact us for Enterprise pricing →
            </Link>
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Landlords love Happy Tenant
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                quote: "The AI features are game-changing. It responded to my tenant at 2am about a maintenance issue and had it scheduled before I woke up.",
                name: 'Sarah M.',
                role: '12 units in Austin, TX',
                rating: 5,
              },
              {
                quote: "Finally, software that doesn't feel like work. The AI handles 80% of tenant messages. I just approve and move on.",
                name: 'Mike R.',
                role: '5 units',
                rating: 5,
              },
              {
                quote: "Switched from TurboTenant and I'm never going back. The AI assistant alone is worth the upgrade.",
                name: 'Jennifer L.',
                role: '28 units',
                rating: 5,
              },
            ].map((testimonial, i) => (
              <Card key={i} className="bg-muted/30">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm mb-4">&quot;{testimonial.quote}&quot;</p>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 sm:p-12 text-center">
              <Home className="h-12 w-12 mx-auto mb-4 opacity-80" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Ready to manage smarter, not harder?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Join 50,000+ landlords who&apos;ve upgraded their property management with AI.
              </p>
              <Link href="/sign-up">
                <Button size="lg" variant="secondary">
                  Get Started Free - No Credit Card Required
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/70">
                <span className="flex items-center gap-1">
                  <Check className="h-4 w-4" /> Free forever for up to 3 units
                </span>
                <span className="flex items-center gap-1">
                  <Check className="h-4 w-4" /> Setup in under 5 minutes
                </span>
                <span className="flex items-center gap-1">
                  <Check className="h-4 w-4" /> Cancel anytime
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
