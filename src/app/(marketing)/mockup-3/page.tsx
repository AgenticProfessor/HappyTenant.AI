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
  ArrowRight,
  BarChart3,
  Wallet,
  Bot,
  Check,
  ChevronRight,
  Building2,
  Users,
  Clock,
  Star,
  Wrench,
} from 'lucide-react';
import './living.css';

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

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, hasStarted]);

  return { count, ref };
}

export default function IntelligentLivingLanding() {
  const landlordsStat = useCounter(50000, 2000);
  const propertiesStat = useCounter(125000, 2200);
  const hoursStat = useCounter(120, 1800);
  const satisfactionStat = useCounter(98, 1600);

  const features = [
    {
      number: '01',
      title: 'Tenant Communication',
      description: 'AI-crafted responses that maintain your professional voice while resolving inquiries instantly.',
    },
    {
      number: '02',
      title: 'Maintenance Orchestration',
      description: 'From triage to completion, your AI coordinates vendors and tracks every repair.',
    },
    {
      number: '03',
      title: 'Intelligent Collection',
      description: 'Diplomatic payment reminders and automated follow-ups that preserve relationships.',
    },
    {
      number: '04',
      title: 'Risk Assessment',
      description: 'Comprehensive screening with AI-powered analysis of credit, background, and rental history.',
    },
    {
      number: '05',
      title: 'Document Intelligence',
      description: 'Extract insights from leases, contracts, and correspondence with precision.',
    },
    {
      number: '06',
      title: 'Financial Clarity',
      description: 'Revenue forecasting, expense analysis, and market positioning at a glance.',
    },
  ];

  return (
    <div className="living-landing">
      {/* ========================================
          HERO SECTION
          ======================================== */}
      <section className="liv-hero">
        <div className="liv-hero-line" />

        <div className="liv-container relative z-10">
          <div className="max-w-3xl">
            <p className="liv-label liv-label-light mb-8 liv-fade-up">
              The Future of Property Management
            </p>

            <h1 className="liv-heading liv-heading-hero mb-8 liv-fade-up liv-delay-1">
              Where Intelligence
              <br />
              <span className="liv-serif-italic liv-gold-text">Meets</span> Living
            </h1>

            <p className="liv-text liv-text-lg mb-12 liv-fade-up liv-delay-2" style={{ maxWidth: '480px' }}>
              An AI-powered platform that transforms property management from
              daily burden to strategic advantage. For discerning landlords.
            </p>

            <div className="flex flex-wrap gap-4 liv-fade-up liv-delay-3">
              <Link href="/sign-up" className="liv-btn liv-btn-primary">
                Begin Your Journey
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="liv-btn liv-btn-outline">
                Explore Capabilities
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          STATS SECTION
          ======================================== */}
      <section className="liv-section" style={{ background: 'var(--liv-cream-dark)' }}>
        <div className="liv-container">
          <div className="liv-stats">
            <div className="liv-stat liv-fade-up">
              <p className="liv-stat-value">
                <span ref={landlordsStat.ref}>{landlordsStat.count.toLocaleString()}</span>+
              </p>
              <p className="liv-stat-label">Landlords</p>
            </div>
            <div className="liv-stat liv-fade-up liv-delay-1">
              <p className="liv-stat-value">
                <span ref={propertiesStat.ref}>{propertiesStat.count.toLocaleString()}</span>+
              </p>
              <p className="liv-stat-label">Properties</p>
            </div>
            <div className="liv-stat liv-fade-up liv-delay-2">
              <p className="liv-stat-value">
                <span ref={hoursStat.ref}>{hoursStat.count}</span>h
              </p>
              <p className="liv-stat-label">Saved Yearly</p>
            </div>
            <div className="liv-stat liv-fade-up liv-delay-3">
              <p className="liv-stat-value">
                <span ref={satisfactionStat.ref}>{satisfactionStat.count}</span>%
              </p>
              <p className="liv-stat-label">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          EDITORIAL DIVIDER
          ======================================== */}
      <section className="liv-section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="liv-container">
          <div className="liv-divider">
            <div className="liv-divider-line" />
            <p className="liv-divider-text">Six Intelligent Agents</p>
            <div className="liv-divider-line" />
          </div>
        </div>
      </section>

      {/* ========================================
          FEATURES GRID
          ======================================== */}
      <section className="liv-section" style={{ paddingTop: 0 }}>
        <div className="liv-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="liv-label mb-4">Capabilities</p>
            <h2 className="liv-heading liv-heading-section">
              A Suite of
              <br />
              <span className="liv-serif-italic">Intelligent</span> Services
            </h2>
          </div>

          <div className="liv-feature-grid">
            {features.map((feature, i) => (
              <div
                key={feature.number}
                className={`liv-feature-item liv-fade-up liv-delay-${i + 1}`}
              >
                <p className="liv-feature-number">{feature.number}</p>
                <h3 className="liv-heading liv-heading-card mb-3">{feature.title}</h3>
                <p className="liv-text liv-text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          AI SHOWCASE
          ======================================== */}
      <section className="liv-section" style={{ background: 'var(--liv-navy)' }}>
        <div className="liv-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="liv-slide-left">
              <p className="liv-label liv-label-light mb-4">Steward AI</p>
              <h2 className="liv-heading liv-heading-section mb-6" style={{ color: 'var(--liv-white)' }}>
                Conversations
                <br />
                <span className="liv-serif-italic liv-gold-text">Reimagined</span>
              </h2>
              <p className="liv-text liv-text-lg mb-10" style={{ color: 'var(--liv-text-light-muted)' }}>
                Your AI assistant responds with empathy and precision, scheduling
                vendors, answering questions, and resolving issues before they escalate.
              </p>

              <div className="space-y-4">
                {[
                  'Responds in under 10 seconds',
                  'Supports 100+ languages',
                  'Available 24 hours, every day',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-4">
                    <div
                      className="w-8 h-8 flex items-center justify-center"
                      style={{ background: 'rgba(201, 169, 98, 0.15)' }}
                    >
                      <Check className="w-4 h-4" style={{ color: 'var(--liv-gold)' }} />
                    </div>
                    <span style={{ color: 'var(--liv-text-light)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="liv-slide-right">
              <div className="liv-ai-demo">
                <div className="liv-ai-header">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5" style={{ color: 'var(--liv-gold)' }} />
                    <span className="text-sm font-medium">Steward AI</span>
                  </div>
                  <span className="liv-label" style={{ fontSize: '0.625rem' }}>Active</span>
                </div>
                <div className="liv-ai-body">
                  <div className="liv-message liv-message-user">
                    My heating stopped working and it&apos;s getting cold. Can someone come look at it?
                  </div>
                  <div className="liv-message liv-message-ai">
                    I understand how uncomfortable that must be. I&apos;ve contacted Elite HVAC
                    and they have availability tomorrow morning at 9:00 AM. I&apos;ve confirmed
                    the appointment on your behalf. You&apos;ll receive a confirmation shortly.
                  </div>
                  <div
                    className="flex items-center gap-3 p-4 mt-4"
                    style={{ background: 'var(--liv-cream)' }}
                  >
                    <Check className="w-5 h-5" style={{ color: 'var(--liv-gold-dark)' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--liv-navy)' }}>
                        Service scheduled
                      </p>
                      <p className="text-xs" style={{ color: 'var(--liv-text-muted)' }}>
                        Elite HVAC • Tomorrow 9:00 AM
                      </p>
                    </div>
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
      <section className="liv-section">
        <div className="liv-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="liv-report-card">
                <div className="liv-report-header">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5" style={{ color: 'var(--liv-gold)' }} />
                    <span className="font-medium">Profit & Loss</span>
                  </div>
                  <span className="liv-label" style={{ fontSize: '0.625rem' }}>Q4 2024</span>
                </div>
                {[
                  { label: 'Gross Revenue', value: '$127,400', positive: true },
                  { label: 'Operating Expenses', value: '$42,800', positive: false },
                  { label: 'Net Operating Income', value: '$84,600', positive: true },
                  { label: 'YoY Growth', value: '+14.2%', positive: true },
                ].map((row) => (
                  <div key={row.label} className="liv-report-row">
                    <span className="liv-report-label">{row.label}</span>
                    <span className={`liv-report-value ${row.positive ? 'liv-report-positive' : ''}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2 liv-fade-up">
              <p className="liv-label mb-4">Financial Intelligence</p>
              <h2 className="liv-heading liv-heading-section mb-6">
                Reports That
                <br />
                <span className="liv-serif-italic">Illuminate</span>
              </h2>
              <p className="liv-text liv-text-lg mb-8">
                From Balance Sheets to Rent Rolls, access 15+ comprehensive
                reports with AI-generated insights. Export to any format.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  'Balance Sheet',
                  'Cash Flow',
                  'Owner Statement',
                  'Rent Roll',
                  '1099 Reports',
                  'Aging Report',
                ].map((report) => (
                  <div key={report} className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--liv-gold)' }} />
                    <span className="liv-text-sm" style={{ color: 'var(--liv-text-dark)' }}>
                      {report}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          TESTIMONIAL
          ======================================== */}
      <section className="liv-section" style={{ background: 'var(--liv-cream-dark)' }}>
        <div className="liv-container">
          <div className="max-w-3xl mx-auto">
            <div className="liv-testimonial liv-fade-up">
              <p className="liv-testimonial-quote">
                &ldquo;Happy Tenant transformed how I manage my portfolio. The AI handles
                communication so elegantly that tenants often don&apos;t realize they&apos;re
                speaking with an assistant. It&apos;s preserved my time and my relationships.&rdquo;
              </p>
              <div className="flex items-center gap-4 mt-8">
                <div
                  className="w-14 h-14 rounded-full"
                  style={{ background: 'linear-gradient(135deg, var(--liv-navy) 0%, var(--liv-navy-light) 100%)' }}
                />
                <div>
                  <p className="font-medium" style={{ fontFamily: 'var(--font-serif)' }}>
                    Victoria Chen
                  </p>
                  <p className="liv-text-sm">45 Properties • San Francisco</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          PRICING
          ======================================== */}
      <section className="liv-section">
        <div className="liv-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="liv-label mb-4">Investment</p>
            <h2 className="liv-heading liv-heading-section">
              Straightforward
              <br />
              <span className="liv-serif-italic">Value</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Essential */}
            <div className="liv-pricing-card liv-fade-up">
              <p className="liv-label mb-4">Essential</p>
              <h3 className="liv-heading text-2xl mb-2">Free</h3>
              <p className="liv-text text-sm mb-8">For those beginning their journey</p>
              <div className="mb-8">
                <span className="liv-price">$0</span>
                <span className="liv-price-period">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                {['Up to 3 units', 'Basic AI assistance', 'Rent collection', 'Essential reports'].map(
                  (feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="w-4 h-4" style={{ color: 'var(--liv-gold)' }} />
                      <span className="liv-text-sm">{feature}</span>
                    </li>
                  )
                )}
              </ul>
              <button className="liv-btn liv-btn-text w-full justify-center">
                Start Free
              </button>
            </div>

            {/* Professional */}
            <div className="liv-pricing-card liv-pricing-featured liv-fade-up liv-delay-1">
              <p className="liv-label mb-4">Professional</p>
              <h3 className="liv-heading text-2xl mb-2">Pro</h3>
              <p className="liv-text text-sm mb-8" style={{ color: 'var(--liv-text-light-muted)' }}>
                For the serious property investor
              </p>
              <div className="mb-8">
                <span className="liv-price" style={{ color: 'var(--liv-gold)' }}>$12</span>
                <span className="liv-price-period" style={{ color: 'var(--liv-text-light-muted)' }}>
                  /unit/month
                </span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                {[
                  'Unlimited units',
                  'Full AI suite',
                  'All 6 agents',
                  '15+ reports',
                  'Priority support',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-4 h-4" style={{ color: 'var(--liv-gold)' }} />
                    <span className="liv-text-sm" style={{ color: 'var(--liv-text-light)' }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="liv-btn liv-btn-primary w-full justify-center">
                Begin Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          CTA
          ======================================== */}
      <section className="liv-section" style={{ paddingBottom: 0 }}>
        <div className="liv-container">
          <div className="liv-cta">
            <div className="relative z-10">
              <p className="liv-label liv-label-light mb-6">The Future Awaits</p>
              <h2 className="liv-heading liv-heading-section mb-6" style={{ color: 'var(--liv-white)' }}>
                Ready to Transform
                <br />
                <span className="liv-serif-italic liv-gold-text">Your Portfolio?</span>
              </h2>
              <p
                className="liv-text liv-text-lg mb-10 max-w-lg mx-auto"
                style={{ color: 'var(--liv-text-light-muted)' }}
              >
                Join 50,000+ landlords who&apos;ve elevated their property management
                with intelligent automation.
              </p>
              <Link href="/sign-up" className="liv-btn liv-btn-primary">
                Begin Your Journey
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm" style={{ color: 'var(--liv-text-light-muted)' }}>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" style={{ color: 'var(--liv-gold)' }} />
                  Free for 3 units
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" style={{ color: 'var(--liv-gold)' }} />
                  5 minute setup
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" style={{ color: 'var(--liv-gold)' }} />
                  Cancel anytime
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
