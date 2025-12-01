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
  BarChart3,
  PieChart,
  Wallet,
  Activity,
  Database,
  Cpu,
  Terminal,
  ChevronUp,
  ChevronDown,
  Check,
  Wrench,
  Globe,
  Clock,
} from 'lucide-react';
import './symphony.css';

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

export default function DataSymphonyLanding() {
  const revenueStat = useCounter(2400000, 2000);
  const tenantsStat = useCounter(1247, 1800);
  const responseStat = useCounter(8, 1500);
  const collectionStat = useCounter(98, 1600);

  const aiAgents = [
    { icon: MessageSquare, name: 'Communication', status: 'active', requests: '12.4k' },
    { icon: Wrench, name: 'Maintenance', status: 'active', requests: '8.2k' },
    { icon: Wallet, name: 'Collection', status: 'active', requests: '15.1k' },
    { icon: Shield, name: 'Screening', status: 'beta', requests: '3.8k' },
    { icon: FileText, name: 'Documents', status: 'beta', requests: '2.1k' },
    { icon: TrendingUp, name: 'Insights', status: 'coming', requests: '—' },
  ];

  const reports = [
    { name: 'Profit & Loss', type: 'Financial', updated: '2 min ago', trend: '+12.4%', up: true },
    { name: 'Balance Sheet', type: 'Financial', updated: '5 min ago', trend: '+8.2%', up: true },
    { name: 'Rent Roll', type: 'Property', updated: 'Live', trend: '98%', up: true },
    { name: 'Aging Report', type: 'Tenant', updated: '1 min ago', trend: '-2.1%', up: false },
    { name: 'Cash Flow', type: 'Financial', updated: '3 min ago', trend: '+$45.2k', up: true },
  ];

  const chartBars = [
    { height: 65, label: 'Jan', value: '$42k' },
    { height: 78, label: 'Feb', value: '$51k' },
    { height: 45, label: 'Mar', value: '$38k' },
    { height: 92, label: 'Apr', value: '$68k' },
    { height: 85, label: 'May', value: '$62k' },
    { height: 100, label: 'Jun', value: '$74k' },
  ];

  return (
    <div className="symphony-landing">
      {/* ========================================
          HERO SECTION
          ======================================== */}
      <section className="sym-hero">
        <div className="sym-grid-bg" />
        <div className="sym-hero-orb sym-hero-orb-1" />
        <div className="sym-hero-orb sym-hero-orb-2" />

        <div className="sym-container">
          <div className="max-w-5xl">
            <div className="sym-badge sym-badge-blue mb-8 sym-fade-up">
              <Activity className="w-3 h-3" />
              Real-Time Intelligence
            </div>

            <h1 className="sym-heading sym-heading-hero mb-6 sym-fade-up sym-delay-1">
              Property
              <br />
              <span className="sym-gradient-text">Command Center</span>
            </h1>

            <p className="sym-text sym-text-lg max-w-xl mb-12 sym-fade-up sym-delay-2">
              Six AI agents. 15+ financial reports. Real-time market intelligence.
              Everything you need to run your portfolio like a Fortune 500.
            </p>

            <div className="flex flex-wrap gap-4 sym-fade-up sym-delay-3">
              <Link href="/sign-up" className="sym-btn sym-btn-primary">
                Launch Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="sym-btn sym-btn-outline">
                <Terminal className="w-4 h-4" />
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          LIVE METRICS
          ======================================== */}
      <section className="sym-section" style={{ paddingTop: '4rem' }}>
        <div className="sym-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Revenue Managed', value: revenueStat, prefix: '$', suffix: '', format: true },
              { label: 'Active Tenants', value: tenantsStat, prefix: '', suffix: '', format: true },
              { label: 'Avg Response', value: responseStat, prefix: '', suffix: 's', format: false },
              { label: 'Collection Rate', value: collectionStat, prefix: '', suffix: '%', format: false },
            ].map((metric, i) => (
              <div key={metric.label} className={`sym-card sym-fade-up sym-delay-${i + 1}`}>
                <div className="sym-metric">
                  <span className="sym-metric-value sym-gradient-text" ref={metric.value.ref}>
                    {metric.prefix}
                    {metric.format
                      ? metric.value.count.toLocaleString()
                      : metric.value.count}
                    {metric.suffix}
                  </span>
                  <span className="sym-metric-label">{metric.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          AI AGENTS GRID
          ======================================== */}
      <section className="sym-section">
        <div className="sym-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="sym-badge sym-badge-mint mb-6">
              <Cpu className="w-3 h-3" />
              Neural Network
            </div>
            <h2 className="sym-heading sym-heading-section mb-6">
              <span className="sym-gradient-mint">Six Agents.</span>
              <br />
              One Mission.
            </h2>
            <p className="sym-text sym-text-lg">
              Each AI agent is purpose-built for a specific domain, working in concert
              to automate your entire property management workflow.
            </p>
          </div>

          <div className="sym-agent-grid">
            {aiAgents.map((agent, i) => (
              <div key={agent.name} className={`sym-agent-card sym-fade-up sym-delay-${i + 1}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="sym-icon-box">
                    <agent.icon className="w-5 h-5" style={{ color: 'var(--sym-neon-mint)' }} />
                  </div>
                  <div className="sym-agent-status">
                    <span
                      className={`sym-status-dot ${
                        agent.status === 'active'
                          ? 'sym-status-active'
                          : agent.status === 'beta'
                          ? 'sym-status-beta'
                          : 'sym-status-coming'
                      }`}
                    />
                    <span style={{ color: 'var(--sym-text-dim)' }}>
                      {agent.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <h3 className="sym-heading sym-heading-card mb-2">{agent.name}</h3>
                <p className="sym-mono" style={{ color: 'var(--sym-text-dim)' }}>
                  {agent.requests} requests/mo
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          DATA VISUALIZATION SECTION
          ======================================== */}
      <section className="sym-section">
        <div className="sym-container">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Revenue Chart */}
            <div className="sym-chart-container">
              <div className="sym-chart-header">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5" style={{ color: 'var(--sym-neon-blue)' }} />
                  <span className="sym-mono" style={{ fontWeight: 600 }}>
                    Revenue Overview
                  </span>
                </div>
                <span className="sym-metric-trend sym-metric-trend-up">
                  <ChevronUp className="w-3 h-3" />
                  +24.5%
                </span>
              </div>
              <div className="sym-chart-body">
                <div className="sym-bar-chart">
                  {chartBars.map((bar, i) => (
                    <div key={bar.label} className="flex flex-col items-center gap-2 flex-1">
                      <div
                        className={`sym-bar w-full ${i === 5 ? 'sym-bar-mint' : 'sym-bar-blue'}`}
                        style={{
                          height: `${bar.height}%`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                        data-value={bar.value}
                      />
                      <span className="sym-mono text-xs" style={{ color: 'var(--sym-text-dim)' }}>
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Terminal */}
            <div className="sym-terminal">
              <div className="sym-terminal-header">
                <div className="sym-terminal-dot" style={{ background: '#ff5f57' }} />
                <div className="sym-terminal-dot" style={{ background: '#febc2e' }} />
                <div className="sym-terminal-dot" style={{ background: '#28c840' }} />
                <span className="ml-auto sym-mono text-xs" style={{ color: 'var(--sym-text-dim)' }}>
                  steward-ai-v3.2.1
                </span>
              </div>
              <div className="sym-terminal-body space-y-4">
                <div className="sym-terminal-line">
                  <span className="sym-terminal-prompt">$</span>
                  <span className="sym-terminal-output">steward analyze --portfolio</span>
                </div>
                <div className="sym-terminal-line">
                  <span className="sym-terminal-output" style={{ color: 'var(--sym-neon-mint)' }}>
                    ✓ Scanning 47 properties...
                  </span>
                </div>
                <div className="sym-terminal-line">
                  <span className="sym-terminal-output" style={{ color: 'var(--sym-neon-mint)' }}>
                    ✓ Analyzing 1,247 tenant records...
                  </span>
                </div>
                <div className="sym-terminal-line">
                  <span className="sym-terminal-output" style={{ color: 'var(--sym-neon-mint)' }}>
                    ✓ Processing $2.4M in transactions...
                  </span>
                </div>
                <div className="sym-terminal-line">
                  <span className="sym-terminal-output">
                    <br />
                    INSIGHTS GENERATED:
                  </span>
                </div>
                <div className="sym-terminal-line">
                  <span className="sym-terminal-output">
                    → 3 leases expiring in 30 days
                  </span>
                </div>
                <div className="sym-terminal-line">
                  <span className="sym-terminal-output">
                    → Unit 4B rent 8% below market
                  </span>
                </div>
                <div className="sym-terminal-line">
                  <span className="sym-terminal-output">
                    → Predicted Q4 revenue: +$18,400
                  </span>
                </div>
                <div className="sym-terminal-line mt-4">
                  <span className="sym-terminal-prompt">$</span>
                  <span className="sym-terminal-output">
                    <span className="animate-pulse">▋</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          REPORTS TABLE
          ======================================== */}
      <section className="sym-section">
        <div className="sym-container">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div>
              <div className="sym-badge mb-4">
                <Database className="w-3 h-3" />
                15+ Report Types
              </div>
              <h2 className="sym-heading sym-heading-section">
                <span className="sym-gradient-text">Financial</span>
                <br />
                Intelligence
              </h2>
            </div>
            <p className="sym-text max-w-md">
              From P&L to Rent Rolls, get comprehensive reports with AI-powered insights.
              Export to Excel, PDF, or sync directly with your accounting software.
            </p>
          </div>

          <div className="sym-chart-container">
            <table className="sym-table">
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Type</th>
                  <th>Last Updated</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.name}>
                    <td>
                      <span style={{ color: 'var(--sym-text)' }}>{report.name}</span>
                    </td>
                    <td>
                      <span className="sym-badge">{report.type}</span>
                    </td>
                    <td>
                      <span className="sym-mono">{report.updated}</span>
                    </td>
                    <td>
                      <span
                        className={`sym-metric-trend ${
                          report.up ? 'sym-metric-trend-up' : 'sym-metric-trend-down'
                        }`}
                      >
                        {report.up ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                        {report.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================
          FEATURES STRIP
          ======================================== */}
      <section className="sym-section" style={{ background: 'var(--sym-bg-elevated)' }}>
        <div className="sym-container">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: '8s Response Time',
                description: 'AI responds to tenant inquiries 24/7, averaging under 8 seconds.',
              },
              {
                icon: Globe,
                title: '100+ Languages',
                description: 'Automatic translation for global tenant communication.',
              },
              {
                icon: Clock,
                title: '120h Saved/Year',
                description: 'Average time saved per property through automation.',
              },
            ].map((feature, i) => (
              <div key={feature.title} className={`sym-fade-up sym-delay-${i + 1}`}>
                <div className="sym-icon-box mb-6">
                  <feature.icon className="w-5 h-5" style={{ color: 'var(--sym-neon-blue)' }} />
                </div>
                <h3 className="sym-heading text-xl mb-3">{feature.title}</h3>
                <p className="sym-text">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          PRICING
          ======================================== */}
      <section className="sym-section">
        <div className="sym-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="sym-heading sym-heading-section mb-4">
              Simple Pricing
            </h2>
            <p className="sym-text sym-text-lg">
              Start free. Scale as you grow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="sym-pricing-card">
              <h3 className="sym-heading text-2xl mb-2">Free</h3>
              <p className="sym-text text-sm mb-6">For getting started</p>
              <div className="mb-8">
                <span className="sym-heading text-5xl">$0</span>
                <span className="sym-text">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Up to 3 units', 'Basic AI features', 'Rent collection', '5 reports'].map(
                  (feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="w-4 h-4" style={{ color: 'var(--sym-neon-mint)' }} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  )
                )}
              </ul>
              <button className="sym-btn sym-btn-outline w-full justify-center">
                Start Free
              </button>
            </div>

            {/* Pro */}
            <div className="sym-pricing-card sym-pricing-popular">
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-semibold sym-mono"
                style={{
                  background: 'var(--sym-gradient-blue)',
                  borderRadius: '4px',
                  color: 'white',
                }}
              >
                RECOMMENDED
              </div>
              <h3 className="sym-heading text-2xl mb-2">Pro</h3>
              <p className="sym-text text-sm mb-6">For serious landlords</p>
              <div className="mb-8">
                <span className="sym-heading text-5xl">$12</span>
                <span className="sym-text">/unit/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited units',
                  'All 6 AI Agents',
                  '15+ reports',
                  'Market intelligence',
                  'Priority support',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-4 h-4" style={{ color: 'var(--sym-neon-mint)' }} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="sym-btn sym-btn-primary w-full justify-center">
                Start 14-Day Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          CTA
          ======================================== */}
      <section className="sym-section">
        <div className="sym-container">
          <div className="sym-cta">
            <div className="relative z-10">
              <h2 className="sym-heading sym-heading-section mb-6">
                Ready to Take
                <br />
                <span className="sym-gradient-text">Command?</span>
              </h2>
              <p className="sym-text sym-text-lg mb-10 max-w-lg mx-auto">
                Join 50,000+ landlords running their portfolios with AI-powered intelligence.
              </p>
              <Link href="/sign-up" className="sym-btn sym-btn-primary">
                Launch Your Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex flex-wrap justify-center gap-8 mt-12 sym-mono text-xs" style={{ color: 'var(--sym-text-dim)' }}>
                <span className="flex items-center gap-2">
                  <Check className="w-3 h-3" style={{ color: 'var(--sym-neon-mint)' }} />
                  FREE FOR 3 UNITS
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-3 h-3" style={{ color: 'var(--sym-neon-mint)' }} />
                  5 MIN SETUP
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-3 h-3" style={{ color: 'var(--sym-neon-mint)' }} />
                  CANCEL ANYTIME
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
