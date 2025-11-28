'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Wrench,
  ShieldCheck,
  CreditCard,
  BarChart3,
  MessageSquare,
  Sparkles,
  Check,
  Star,
  ArrowRight,
  Bot,
  Home,
  Users,
  Play,
  Zap,
  Clock,
  ArrowUpRight,
  CircleCheck,
} from 'lucide-react';

// Counter animation hook
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, hasStarted]);

  return { count, ref };
}

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0);

  const landlordsStat = useCountUp(50000, 2000);
  const savingsStat = useCountUp(2400, 1800);
  const responseTimeStat = useCountUp(45, 1500);

  const features = [
    {
      icon: Phone,
      title: 'AI Voice Calls',
      description: 'Makes actual phone calls for rent reminders, maintenance scheduling, and lease renewals.',
      highlight: 'Speaks naturally',
    },
    {
      icon: Wrench,
      title: 'Maintenance Coordination',
      description: 'Triages issues, collects vendor bids, assigns jobs, and verifies completion.',
      highlight: 'End-to-end',
    },
    {
      icon: ShieldCheck,
      title: 'Smart Screening',
      description: 'Instant credit, criminal, and eviction reports with AI-powered risk scoring.',
      highlight: 'Instant results',
    },
    {
      icon: CreditCard,
      title: 'Auto-Rent Collection',
      description: 'Automated ACH payments, late fees, and diplomatic follow-ups for missed payments.',
      highlight: 'Zero effort',
    },
    {
      icon: BarChart3,
      title: 'Market Intelligence',
      description: 'Real-time rent analysis and vacancy optimization based on hyper-local data.',
      highlight: 'Data-driven',
    },
    {
      icon: MessageSquare,
      title: 'Communication Hub',
      description: 'In-app chat, SMS & email unified. AI drafts responses you approve with one click.',
      highlight: '80% automated',
    },
  ];

  return (
    <div className="landing-page">
      {/* ========================================
          HERO SECTION
          ======================================== */}
      <section className="lp-hero-bg min-h-screen flex items-center relative">
        <div className="lp-grid-pattern" />

        <div className="lp-container relative z-10 py-20 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left Column */}
            <div className="lp-fade-in">
              <div className="lp-badge mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Property Management
              </div>

              <h1 className="lp-heading lp-heading-hero mb-6">
                Property management
                <br />
                <span className="lp-text-gradient">on autopilot.</span>
              </h1>

              <p className="lp-text text-xl mb-10 max-w-lg">
                The AI assistant that handles tenant communication, maintenance coordination,
                and rent collection — so you don&apos;t have to.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/sign-up" className="lp-btn lp-btn-primary">
                  Get started free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button className="lp-btn lp-btn-secondary">
                  <Play className="w-4 h-4" />
                  Watch demo
                </button>
              </div>

              {/* Trust Stats */}
              <div className="flex items-center gap-8">
                <div>
                  <p className="lp-heading text-2xl">
                    <span ref={landlordsStat.ref}>{landlordsStat.count.toLocaleString()}</span>+
                  </p>
                  <p className="lp-text-sm text-[var(--lp-gray-400)]">Landlords</p>
                </div>
                <div className="w-px h-10 bg-[var(--lp-gray-200)]" />
                <div>
                  <p className="lp-heading text-2xl">$2B+</p>
                  <p className="lp-text-sm text-[var(--lp-gray-400)]">Managed</p>
                </div>
                <div className="w-px h-10 bg-[var(--lp-gray-200)]" />
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="lp-text-sm ml-1">4.9</span>
                </div>
              </div>
            </div>

            {/* Right Column - Demo Card */}
            <div className="lp-fade-in lp-delay-2 relative">
              <div className="lp-demo-card lp-float">
                <div className="lp-demo-header">
                  <div className="lp-demo-dot bg-red-400" />
                  <div className="lp-demo-dot bg-yellow-400" />
                  <div className="lp-demo-dot bg-green-400" />
                  <span className="ml-auto text-sm text-[var(--lp-gray-400)]">AI Assistant</span>
                </div>
                <div className="lp-demo-content space-y-4">
                  {/* User Message */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 flex-shrink-0" />
                    <div className="lp-message lp-message-user">
                      When will someone fix the leak? It&apos;s been 3 days.
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex gap-3 justify-end">
                    <div className="lp-message lp-message-ai lp-shimmer">
                      Hi John! I&apos;ve scheduled Mike&apos;s Plumbing for tomorrow 10am-12pm.
                      You&apos;ll get a reminder in the morning. Sorry for the wait!
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[var(--lp-blue)] flex-shrink-0 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between text-sm pt-4 border-t border-[var(--lp-gray-100)]">
                    <span className="flex items-center gap-2 text-[var(--lp-gray-400)]">
                      <Clock className="w-4 h-4" />
                      Responded in 2.5s
                    </span>
                    <span className="flex items-center gap-1 text-green-500 font-medium">
                      <CircleCheck className="w-4 h-4" />
                      Vendor scheduled
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Badges */}
              <div className="lp-floating-badge lp-hide-mobile -top-4 -left-4 lp-float-delayed">
                <Zap className="w-4 h-4 text-[var(--lp-blue)]" />
                <span>24/7 Active</span>
              </div>
              <div className="lp-floating-badge lp-hide-mobile -bottom-4 -right-4 lp-float">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span>95% Accuracy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          TRUST BAR
          ======================================== */}
      <section className="py-12 border-b border-[var(--lp-gray-100)]">
        <div className="lp-container">
          <div className="flex flex-wrap justify-center items-center gap-10 lg:gap-16">
            {['Zillow', 'TransUnion', 'Stripe', 'Plaid'].map((partner) => (
              <span
                key={partner}
                className="text-xl font-semibold tracking-wide text-[var(--lp-gray-400)] hover:text-[var(--lp-gray-600)] transition-colors"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          CAPABILITIES
          ======================================== */}
      <section className="lp-section">
        <div className="lp-container">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="lp-badge-outline lp-badge mb-4">CAPABILITIES</span>
            <h2 className="lp-heading lp-heading-section mb-4">
              Your full-stack operations team
            </h2>
            <p className="lp-text">
              Most platforms give you tools to do the work. Happy Tenant does the work for you.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="lp-feature-grid">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`lp-card lp-fade-in ${index === activeFeature ? 'border-[var(--lp-blue)]' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="lp-icon-box mb-5">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="lp-heading lp-heading-card mb-2">{feature.title}</h3>
                <p className="lp-text lp-text-sm mb-4">{feature.description}</p>
                <span className="lp-badge text-xs">{feature.highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          AI SHOWCASE
          ======================================== */}
      <section className="lp-section lp-bg-subtle">
        <div className="lp-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Text */}
            <div className="lp-fade-in">
              <span className="lp-badge mb-4">
                <Bot className="w-4 h-4" />
                AI Assistant
              </span>
              <h2 className="lp-heading lp-heading-section mb-6">
                It handles the busy work
                <br />
                <span className="lp-text-gradient">so you can grow.</span>
              </h2>
              <p className="lp-text mb-10">
                Our AI reads tenant messages, understands intent, drafts responses,
                coordinates vendors, and can even make phone calls. You approve with one click.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="lp-stat-value lp-stat-value-blue">80%</p>
                  <p className="lp-text-sm text-[var(--lp-gray-400)]">Messages handled automatically</p>
                </div>
                <div>
                  <p className="lp-stat-value lp-stat-value-blue">
                    <span ref={responseTimeStat.ref}>{responseTimeStat.count}</span>min
                  </p>
                  <p className="lp-text-sm text-[var(--lp-gray-400)]">Avg response time (vs 4 hours)</p>
                </div>
                <div>
                  <p className="lp-stat-value lp-stat-value-blue">
                    $<span ref={savingsStat.ref}>{savingsStat.count.toLocaleString()}</span>
                  </p>
                  <p className="lp-text-sm text-[var(--lp-gray-400)]">Avg annual savings found</p>
                </div>
                <div>
                  <p className="lp-stat-value lp-stat-value-blue">24/7</p>
                  <p className="lp-text-sm text-[var(--lp-gray-400)]">Always available</p>
                </div>
              </div>
            </div>

            {/* Right - Visual */}
            <div className="lp-fade-in lp-delay-2">
              <div className="lp-card-floating p-8">
                <div className="space-y-6">
                  {/* Conversation Preview */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-300 to-blue-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm mb-1">Tenant Sarah</p>
                      <div className="p-4 rounded-2xl rounded-tl-sm bg-[var(--lp-off-white)]">
                        <p className="text-sm">The AC isn&apos;t working and it&apos;s 95 degrees. This is urgent!</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end">
                    <div className="text-right">
                      <p className="font-medium text-sm mb-1 text-[var(--lp-blue-dark)]">AI Assistant</p>
                      <div className="p-4 rounded-2xl rounded-tr-sm bg-[var(--lp-blue)] text-white">
                        <p className="text-sm">
                          I&apos;m so sorry! I&apos;ve contacted CoolAir HVAC — they can come TODAY at 3pm.
                          I&apos;ll send you updates. Stay cool!
                        </p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[var(--lp-blue)] flex-shrink-0 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Action Taken */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
                    <CircleCheck className="w-5 h-5 text-green-500" />
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-green-800">Vendor dispatched automatically</p>
                      <p className="text-xs text-green-600">CoolAir HVAC • Today 3:00 PM</p>
                    </div>
                    <span className="text-xs text-green-500">8 seconds</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          HOW IT WORKS
          ======================================== */}
      <section className="lp-section">
        <div className="lp-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="lp-heading lp-heading-section">
              Get started in <span className="lp-text-gradient">5 minutes</span>
            </h2>
          </div>

          <div className="lp-steps grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                icon: Home,
                title: 'Add properties',
                description: 'Import from spreadsheet or add manually.',
              },
              {
                step: '02',
                icon: Users,
                title: 'Import tenants',
                description: 'Connect existing data or start fresh.',
              },
              {
                step: '03',
                icon: Sparkles,
                title: 'Let AI work',
                description: 'Sit back while your AI assistant takes over.',
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className="lp-step lp-fade-in text-center relative"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="lp-step-number mb-4">{item.step}</div>
                <div className="lp-icon-box w-16 h-16 mx-auto mb-5">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="lp-heading text-xl mb-2">{item.title}</h3>
                <p className="lp-text lp-text-sm">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/sign-up" className="lp-btn lp-btn-primary-blue">
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================
          PRICING
          ======================================== */}
      <section className="lp-section lp-bg-subtle">
        <div className="lp-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="lp-heading lp-heading-section">
              Simple, transparent pricing
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="lp-card lp-fade-in">
              <div className="mb-8">
                <h3 className="lp-heading text-2xl">Free</h3>
                <p className="lp-text-sm text-[var(--lp-gray-400)] mt-1">For getting started</p>
              </div>
              <div className="mb-8">
                <span className="lp-heading text-5xl">$0</span>
                <span className="lp-text text-[var(--lp-gray-400)]">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Up to 3 units',
                  'Basic screening',
                  'Rent collection',
                  'Maintenance tracking',
                  '50 AI requests/month',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[var(--lp-blue)]" />
                    <span className="lp-text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="lp-btn lp-btn-secondary w-full">
                Start free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="lp-card lp-pricing-popular lp-fade-in lp-delay-1 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="lp-badge lp-badge-dark">Most Popular</span>
              </div>
              <div className="mb-8">
                <h3 className="lp-heading text-2xl">Pro</h3>
                <p className="lp-text-sm text-[var(--lp-gray-400)] mt-1">For serious landlords</p>
              </div>
              <div className="mb-8">
                <span className="lp-heading text-5xl">$12</span>
                <span className="lp-text text-[var(--lp-gray-400)]">/unit/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Unlimited units',
                  'Premium screening',
                  'Full AI Assistant',
                  'Auto rent collection',
                  'E-signatures',
                  'Accounting sync',
                  'Priority support',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[var(--lp-blue)]" />
                    <span className="lp-text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="lp-btn lp-btn-primary-blue w-full justify-center">
                Start 14-day trial
              </Link>
            </div>
          </div>

          <p className="text-center lp-text-sm text-[var(--lp-gray-400)] mt-8">
            Managing 50+ units?{' '}
            <Link href="/contact" className="text-[var(--lp-blue-dark)] hover:underline font-medium">
              Contact us for Enterprise pricing
              <ArrowUpRight className="w-3 h-3 inline ml-1" />
            </Link>
          </p>
        </div>
      </section>

      {/* ========================================
          TESTIMONIALS
          ======================================== */}
      <section className="lp-section">
        <div className="lp-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="lp-heading lp-heading-section">
              Loved by landlords
            </h2>
          </div>

          <div className="lp-carousel">
            {[
              {
                quote: "The AI features are game-changing. It responded to my tenant at 2am about a maintenance issue and had it scheduled before I woke up.",
                name: 'Sarah M.',
                role: '12 units • Austin, TX',
              },
              {
                quote: "Finally, software that doesn't feel like work. The AI handles 80% of tenant messages. I just approve and move on.",
                name: 'Mike R.',
                role: '5 units',
              },
              {
                quote: "Switched from TurboTenant and I'm never going back. The AI assistant alone is worth the upgrade.",
                name: 'Jennifer L.',
                role: '28 units',
              },
              {
                quote: "I was skeptical about AI but it saved me 10+ hours a week. The voice calls feature is incredible.",
                name: 'David K.',
                role: '45 units • Phoenix',
              },
            ].map((testimonial, index) => (
              <div key={index} className="lp-carousel-item">
                <div className="lp-card h-full">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="lp-text lp-text-sm mb-6">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--lp-blue-light)] to-[var(--lp-blue)]" />
                    <div>
                      <p className="font-medium text-sm">{testimonial.name}</p>
                      <p className="text-xs text-[var(--lp-gray-400)]">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          FINAL CTA
          ======================================== */}
      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-cta-gradient rounded-3xl p-10 md:p-16 lg:p-20 text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-8">
                <Home className="w-8 h-8 text-white" />
              </div>
              <h2 className="lp-heading lp-heading-section text-white mb-4">
                Ready to manage smarter?
              </h2>
              <p className="lp-text text-white/70 mb-10 max-w-lg mx-auto">
                Join 50,000+ landlords who&apos;ve upgraded their property management with AI.
              </p>
              <Link
                href="/sign-up"
                className="lp-btn lp-btn-primary-blue inline-flex"
              >
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-white/60">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" /> Free forever for 3 units
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" /> 5 minute setup
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" /> Cancel anytime
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
