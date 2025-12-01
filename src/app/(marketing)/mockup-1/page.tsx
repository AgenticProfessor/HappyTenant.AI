'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Sparkles,
  MessageSquare,
  FileText,
  Shield,
  TrendingUp,
  Zap,
  Bot,
  ArrowRight,
  Play,
  ChevronRight,
  BarChart3,
  PieChart,
  Wallet,
  Home,
  Users,
  CheckCircle2,
  Globe,
  Clock,
  Phone,
  Wrench,
} from 'lucide-react';
import './flow.css';

// Intersection Observer hook for scroll animations
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// Animated counter hook
function useCounter(end: number, duration: number = 2000) {
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

// Wave text component for button hover effect
function WaveText({ text }: { text: string }) {
  return (
    <>
      {text.split('').map((char, i) => (
        <span key={i}>{char === ' ' ? '\u00A0' : char}</span>
      ))}
    </>
  );
}

export default function FlowStateLanding() {
  const statsSection = useInView(0.3);
  const featuresSection = useInView(0.2);
  const aiSection = useInView(0.2);
  const reportsSection = useInView(0.2);

  const landlordsStat = useCounter(50000, 2000);
  const hoursStat = useCounter(120, 1800);
  const responseStat = useCounter(8, 1500);
  const satisfactionStat = useCounter(98, 1600);

  const aiAgents = [
    {
      icon: MessageSquare,
      title: 'Tenant Communication',
      description: 'Drafts professional messages, auto-responds to inquiries, adjusts tone per situation.',
      status: 'active',
    },
    {
      icon: Wrench,
      title: 'Maintenance Triage',
      description: 'Categorizes requests, matches vendors, estimates costs, handles scheduling.',
      status: 'active',
    },
    {
      icon: Wallet,
      title: 'Rent Collection',
      description: 'Payment reminders, late fee tracking, diplomatic collection scripts.',
      status: 'active',
    },
    {
      icon: Shield,
      title: 'Tenant Screening',
      description: 'Background checks, income verification, reference analysis, risk scoring.',
      status: 'beta',
    },
    {
      icon: FileText,
      title: 'Document Analysis',
      description: 'Lease parsing, contract review, data extraction, compliance checks.',
      status: 'beta',
    },
    {
      icon: TrendingUp,
      title: 'Financial Insights',
      description: 'Revenue forecasting, expense analysis, market comparison, tax optimization.',
      status: 'coming',
    },
  ];

  const reports = [
    { name: 'Profit & Loss', type: 'Financial', period: 'Monthly', trend: '+12.4%' },
    { name: 'Balance Sheet', type: 'Financial', period: 'Quarterly', trend: '+8.2%' },
    { name: 'Rent Roll', type: 'Property', period: 'Current', trend: '98% Occupied' },
    { name: 'Aging Report', type: 'Tenant', period: 'Live', trend: '$2,400 Due' },
    { name: 'Cash Flow', type: 'Financial', period: 'YTD', trend: '+$45,200' },
  ];

  return (
    <div className="flow-landing">
      {/* ========================================
          HERO SECTION
          ======================================== */}
      <section className="flow-hero">
        {/* Morphing Blobs */}
        <div className="flow-hero-blob flow-hero-blob-1" />
        <div className="flow-hero-blob flow-hero-blob-2" />

        {/* Top Marquee */}
        <div className="flow-marquee-wrap flow-marquee-top">
          <div className="flow-marquee">
            <div className="flow-marquee-content">
              {[...Array(4)].map((_, i) => (
                <span key={i} className="flow-marquee-text">
                  Property Management
                </span>
              ))}
            </div>
            <div className="flow-marquee-content">
              {[...Array(4)].map((_, i) => (
                <span key={i} className="flow-marquee-text">
                  Property Management
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Marquee (reverse) */}
        <div className="flow-marquee-wrap flow-marquee-bottom flow-marquee-reverse">
          <div className="flow-marquee">
            <div className="flow-marquee-content">
              {[...Array(4)].map((_, i) => (
                <span key={i} className="flow-marquee-text flow-marquee-text-solid">
                  AI Autopilot
                </span>
              ))}
            </div>
            <div className="flow-marquee-content">
              {[...Array(4)].map((_, i) => (
                <span key={i} className="flow-marquee-text flow-marquee-text-solid">
                  AI Autopilot
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flow-container relative z-10">
          <div className="max-w-4xl">
            <div className="flow-chip mb-8">
              <Sparkles className="w-4 h-4" />
              AI-Powered Property Management
            </div>

            <h1 className="flow-heading flow-heading-hero mb-8">
              Don&apos;t manage.
              <br />
              <span className="flow-text-gradient">Just own.</span>
            </h1>

            <p className="flow-text flow-text-lg max-w-xl mb-12">
              Your AI assistant handles tenant messages, maintenance coordination,
              rent collection, and everything in between. You just approve.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/sign-up" className="flow-btn flow-btn-primary flow-btn-wave">
                <WaveText text="Get Started" />
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="flow-btn flow-btn-outline">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          STATS SECTION
          ======================================== */}
      <section className="flow-section" style={{ background: 'var(--flow-cream-dark)' }}>
        <div
          ref={statsSection.ref}
          className={`flow-container flow-reveal ${statsSection.isVisible ? 'visible' : ''}`}
        >
          <div className="flow-stats">
            <div className="text-center">
              <p className="flow-stat-value">
                <span ref={landlordsStat.ref}>{landlordsStat.count.toLocaleString()}</span>+
              </p>
              <p className="flow-stat-label">Landlords Trust Us</p>
            </div>
            <div className="text-center">
              <p className="flow-stat-value">
                <span ref={hoursStat.ref}>{hoursStat.count}</span>h
              </p>
              <p className="flow-stat-label">Saved per Year</p>
            </div>
            <div className="text-center">
              <p className="flow-stat-value">
                <span ref={responseStat.ref}>{responseStat.count}</span>s
              </p>
              <p className="flow-stat-label">Avg Response Time</p>
            </div>
            <div className="text-center">
              <p className="flow-stat-value">
                <span ref={satisfactionStat.ref}>{satisfactionStat.count}</span>%
              </p>
              <p className="flow-stat-label">Tenant Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          AI AGENTS SECTION
          ======================================== */}
      <section className="flow-section">
        <div className="flow-container">
          <div
            ref={aiSection.ref}
            className={`flow-reveal ${aiSection.isVisible ? 'visible' : ''}`}
          >
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="flow-chip flow-chip-accent mb-6">
                <Brain className="w-4 h-4" />
                AI Intelligence
              </div>
              <h2 className="flow-heading flow-heading-section mb-6">
                Six AI agents.
                <br />
                <span className="flow-text-gradient">One platform.</span>
              </h2>
              <p className="flow-text flow-text-lg">
                Each agent is specialized for a specific task, working together
                to automate your entire property management workflow.
              </p>
            </div>
          </div>

          <div
            ref={featuresSection.ref}
            className={`flow-feature-grid ${featuresSection.isVisible ? '' : ''}`}
          >
            {aiAgents.map((agent, index) => (
              <div
                key={agent.title}
                className="flow-feature-item"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flow-card h-full">
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flow-icon-box">
                        <agent.icon className="w-7 h-7" />
                      </div>
                      <span
                        className={`flow-chip text-xs ${
                          agent.status === 'active'
                            ? 'flow-chip-accent'
                            : agent.status === 'beta'
                            ? ''
                            : 'opacity-60'
                        }`}
                      >
                        {agent.status === 'active' && 'Active'}
                        {agent.status === 'beta' && 'Beta'}
                        {agent.status === 'coming' && 'Coming Soon'}
                      </span>
                    </div>
                    <h3 className="flow-heading flow-heading-card mb-3">{agent.title}</h3>
                    <p className="flow-text" style={{ fontSize: '0.9375rem' }}>
                      {agent.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          AI DEMO SECTION
          ======================================== */}
      <section className="flow-section" style={{ background: 'var(--flow-cream-dark)' }}>
        <div className="flow-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flow-chip mb-6">
                <Bot className="w-4 h-4" />
                Steward AI
              </div>
              <h2 className="flow-heading flow-heading-section mb-6">
                Conversations that
                <br />
                <span className="flow-text-gradient">convert.</span>
              </h2>
              <p className="flow-text flow-text-lg mb-10">
                Watch your AI handle tenant inquiries in real-time. Natural language,
                empathetic responses, instant action. No more 2am texts.
              </p>

              <div className="space-y-6">
                {[
                  { icon: Zap, text: 'Responds in under 10 seconds, 24/7' },
                  { icon: Globe, text: 'Supports 100+ languages automatically' },
                  { icon: CheckCircle2, text: 'Schedules vendors without your input' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--flow-cyan-soft)] flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-[var(--flow-teal)]" />
                    </div>
                    <span className="flow-text" style={{ color: 'var(--flow-black)' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flow-demo">
              <div className="flow-demo-header">
                <div className="flow-demo-dot" style={{ background: '#ff5f57' }} />
                <div className="flow-demo-dot" style={{ background: '#febc2e' }} />
                <div className="flow-demo-dot" style={{ background: '#28c840' }} />
                <span className="ml-auto text-sm" style={{ color: 'var(--flow-gray)' }}>
                  Steward AI Assistant
                </span>
              </div>
              <div className="flow-demo-body space-y-6">
                <div className="flow-message flow-message-user" style={{ animationDelay: '0s' }}>
                  The AC stopped working and my apartment is 85 degrees!
                  This is urgent, when can someone come fix it?
                </div>
                <div className="flow-message flow-message-ai" style={{ animationDelay: '0.3s' }}>
                  I completely understand how uncomfortable that must be! I&apos;ve already
                  contacted CoolAir HVAC and they have an opening TODAY at 2:30 PM.
                  I&apos;ve booked them for you. You&apos;ll receive a confirmation text shortly.
                  Is there anything else I can help with?
                </div>
                <div
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{
                    background: 'rgba(3, 79, 70, 0.1)',
                    animationDelay: '0.6s',
                  }}
                >
                  <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--flow-teal)' }} />
                  <div className="flex-grow">
                    <p className="text-sm font-medium" style={{ color: 'var(--flow-teal)' }}>
                      Vendor automatically dispatched
                    </p>
                    <p className="text-xs" style={{ color: 'var(--flow-gray)' }}>
                      CoolAir HVAC • Today 2:30 PM • Emergency Priority
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          REPORTS SECTION
          ======================================== */}
      <section className="flow-section">
        <div className="flow-container">
          <div
            ref={reportsSection.ref}
            className={`flow-reveal ${reportsSection.isVisible ? 'visible' : ''}`}
          >
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="flow-reports-preview">
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-6 h-6" style={{ color: 'var(--flow-cyan)' }} />
                      <span
                        className="font-semibold"
                        style={{ color: 'var(--flow-cream)', fontFamily: 'var(--font-display)' }}
                      >
                        Financial Reports
                      </span>
                    </div>
                  </div>
                  <div className="flow-reports-grid">
                    <div className="flow-report-row flow-report-header">
                      <span>Report</span>
                      <span>Type</span>
                      <span>Period</span>
                      <span>Trend</span>
                    </div>
                    {reports.map((report, i) => (
                      <div
                        key={report.name}
                        className="flow-report-row"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <span style={{ color: 'var(--flow-cream)' }}>{report.name}</span>
                        <span>{report.type}</span>
                        <span>{report.period}</span>
                        <span style={{ color: 'var(--flow-cyan)' }}>{report.trend}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="flow-chip mb-6">
                  <PieChart className="w-4 h-4" />
                  15+ Report Types
                </div>
                <h2 className="flow-heading flow-heading-section mb-6">
                  Reports that
                  <br />
                  <span className="flow-text-gradient">actually help.</span>
                </h2>
                <p className="flow-text flow-text-lg mb-8">
                  From Profit & Loss to Rent Rolls, get comprehensive financial reports
                  with AI-powered insights. Export to Excel, PDF, or copy to clipboard.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    'Balance Sheet',
                    'Cash Flow',
                    'Owner Statement',
                    'Vacancy Report',
                    '1099 Reports',
                    'Tenant Ledger',
                  ].map((report) => (
                    <div key={report} className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4" style={{ color: 'var(--flow-teal)' }} />
                      <span className="text-sm" style={{ color: 'var(--flow-black)' }}>
                        {report}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          TESTIMONIALS
          ======================================== */}
      <section className="flow-section" style={{ background: 'var(--flow-cream-dark)' }}>
        <div className="flow-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="flow-heading flow-heading-section">
              Loved by landlords
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "The AI responded to my tenant at 2am about a burst pipe. By 6am, a plumber was scheduled. I didn't lose a minute of sleep.",
                name: 'Sarah Chen',
                role: '28 units • San Francisco',
              },
              {
                quote: "Finally, software that doesn't feel like work. I went from 15 hours a week on property management to maybe 2.",
                name: 'Marcus Williams',
                role: '12 units • Austin',
              },
              {
                quote: "The reports alone are worth it. My accountant said it's the cleanest data she's ever received from a property manager.",
                name: 'Jennifer Park',
                role: '45 units • Chicago',
              },
            ].map((testimonial, i) => (
              <div key={i} className="flow-card">
                <div className="flow-testimonial relative z-10">
                  <p className="flow-text mb-8">{testimonial.quote}</p>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, var(--flow-teal) 0%, var(--flow-cyan) 100%)`,
                      }}
                    />
                    <div>
                      <p className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                        {testimonial.name}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--flow-gray)' }}>
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          PRICING PREVIEW
          ======================================== */}
      <section className="flow-section">
        <div className="flow-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="flow-heading flow-heading-section mb-4">
              Simple pricing
            </h2>
            <p className="flow-text flow-text-lg">
              Start free. Scale as you grow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flow-card">
              <div className="relative z-10">
                <h3 className="flow-heading text-2xl mb-2">Free</h3>
                <p className="flow-text text-sm mb-6">Perfect for getting started</p>
                <div className="mb-8">
                  <span className="flow-heading text-5xl">$0</span>
                  <span className="flow-text">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Up to 3 units', 'Basic AI features', 'Rent collection', 'Essential reports'].map(
                    (feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--flow-teal)' }} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    )
                  )}
                </ul>
                <button className="flow-btn flow-btn-outline w-full justify-center">
                  Start Free
                </button>
              </div>
            </div>

            <div className="flow-card flow-card-dark relative overflow-visible">
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'var(--flow-cyan)', color: 'var(--flow-black)' }}
              >
                Most Popular
              </div>
              <div className="relative z-10">
                <h3
                  className="text-2xl mb-2"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
                >
                  Pro
                </h3>
                <p className="text-sm mb-6" style={{ color: 'var(--flow-gray)' }}>
                  For serious landlords
                </p>
                <div className="mb-8">
                  <span
                    className="text-5xl"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
                  >
                    $12
                  </span>
                  <span style={{ color: 'var(--flow-gray)' }}>/unit/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    'Unlimited units',
                    'Full AI Assistant',
                    'All 6 AI Agents',
                    'Advanced reports',
                    'Priority support',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--flow-cyan)' }} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className="flow-btn w-full justify-center"
                  style={{ background: 'var(--flow-cyan)', color: 'var(--flow-black)' }}
                >
                  Start 14-Day Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          CTA SECTION
          ======================================== */}
      <section className="flow-section">
        <div className="flow-container">
          <div className="flow-cta">
            <div className="relative z-10">
              <h2 className="flow-heading flow-heading-section mb-6">
                Ready to own smarter?
              </h2>
              <p
                className="text-lg mb-10 max-w-lg mx-auto"
                style={{ color: 'rgba(255, 255, 235, 0.7)' }}
              >
                Join 50,000+ landlords who&apos;ve put their property management on autopilot.
              </p>
              <Link
                href="/sign-up"
                className="flow-btn inline-flex"
                style={{ background: 'var(--flow-cream)', color: 'var(--flow-teal)' }}
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>

              <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm" style={{ color: 'rgba(255, 255, 235, 0.6)' }}>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Free for 3 units
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> 5 minute setup
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Cancel anytime
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
