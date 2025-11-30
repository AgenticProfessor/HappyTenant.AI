'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    ArrowRight,
    ExternalLink,
    Info,
    Activity,
    Globe,
    MessageSquare,
    Users2,
    Newspaper,
    Building2,
    Clock,
    RefreshCw,
    Sparkles
} from "lucide-react";

interface MarketData {
    marketQuestion: string;
    probability: number;
    yesProbability?: number;
    noProbability?: number;
    prediction: string;
    meetingDate: string;
    volume: number;
    slug: string;
    marketId?: string;
    history?: { t: number; p: number }[];
}

interface LegislativeUpdate {
    id: string;
    location: string;
    title: string;
    summary: string;
    severity: 'high' | 'medium' | 'low';
    source: string;
    url: string;
    timestamp: string;
    category: string;
}

interface StewardAnalysis {
    summary: string;
    sentiment: 'positive' | 'neutral' | 'negative' | 'caution';
    keyInsights: string[];
    actionItems: string[];
    timestamp: string;
}

export default function IntelligencePage() {
    const [marketData, setMarketData] = useState<MarketData | null>(null);
    const [legislativeUpdates, setLegislativeUpdates] = useState<LegislativeUpdate[]>([]);
    const [stewardAnalysis, setStewardAnalysis] = useState<StewardAnalysis | null>(null);

    const [loadingMarket, setLoadingMarket] = useState(true);
    const [loadingLegislative, setLoadingLegislative] = useState(true);
    const [loadingAnalysis, setLoadingAnalysis] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const fetchMarketData = async () => {
        try {
            const res = await fetch('/api/intelligence/market-data');
            const data = await res.json();
            setMarketData(data);
        } catch (error) {
            console.error('Failed to fetch market data', error);
        } finally {
            setLoadingMarket(false);
            setRefreshing(false);
        }
    };

    const fetchLegislativeData = async () => {
        try {
            const res = await fetch('/api/intelligence/legislative');
            const data = await res.json();
            setLegislativeUpdates(data);
        } catch (error) {
            console.error('Failed to fetch legislative data', error);
        } finally {
            setLoadingLegislative(false);
        }
    };

    const fetchAnalysis = async () => {
        try {
            const res = await fetch('/api/intelligence/analysis');
            const data = await res.json();
            setStewardAnalysis(data);
        } catch (error) {
            console.error('Failed to fetch analysis', error);
        } finally {
            setLoadingAnalysis(false);
        }
    };

    useEffect(() => {
        fetchMarketData();
        fetchLegislativeData();
        fetchAnalysis();

        // Auto-refresh agent (every 30 seconds) for market data
        const interval = setInterval(() => {
            setRefreshing(true);
            fetchMarketData();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Format history data for chart
    const chartData = marketData?.history?.map(point => ({
        date: new Date(point.t * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: point.p * 100
    })) || [];

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            Intelligence Hub
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Real-time monitoring of regulatory risks and market dynamics affecting your portfolio.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {refreshing && (
                            <span className="text-xs text-indigo-500 flex items-center gap-1 animate-pulse">
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                Agent Refreshing...
                            </span>
                        )}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Live Data
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {/* Fed Rate */}
                <a
                    href="https://fred.stlouisfed.org/series/FEDFUNDS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transition-transform hover:scale-[1.02]"
                >
                    <Card className="bg-slate-900 text-white border-slate-800 relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Activity className="h-24 w-24" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                FED FUNDS RATE
                                <ExternalLink className="h-3 w-3" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold mb-1">4.50%</div>
                            <div className="flex items-center text-emerald-400 text-sm">
                                <TrendingDown className="h-4 w-4 mr-1" />
                                -25 bps (Last Meeting)
                            </div>
                            <div className="mt-4 text-xs text-slate-500">
                                Next Meeting: Dec 18, 2025
                            </div>
                        </CardContent>
                    </Card>
                </a>

                {/* Polymarket Prediction (Dynamic Embed) */}
                <div className="col-span-2 h-full">
                    <Card className="bg-white border-slate-200 relative overflow-hidden h-full shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2 flex flex-row items-start justify-between">
                            <div>
                                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2 uppercase tracking-wider">
                                    Polymarket Forecast
                                    <ExternalLink className="h-3 w-3" />
                                </CardTitle>
                                <CardDescription className="text-slate-900 font-semibold mt-1 text-lg">
                                    {marketData?.marketQuestion || 'Loading market data...'}
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                {marketData?.volume ? `$${(marketData.volume / 1000000).toFixed(1)}M Vol` : '...'}
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            {marketData?.marketId ? (
                                <div className="w-full h-[200px] relative">
                                    <iframe
                                        title="polymarket-market-iframe"
                                        src={`https://embed.polymarket.com/market.html?market=${marketData.marketId}`}
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        className="w-full h-full"
                                    />
                                </div>
                            ) : (
                                <div className="h-[200px] flex items-center justify-center text-slate-400">
                                    {loadingMarket ? 'Loading market embed...' : 'Market data unavailable'}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Legislative Risk Score */}
                <a
                    href="https://www.google.com/search?q=real+estate+legislation+California"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transition-transform hover:scale-[1.02]"
                >
                    <Card className="bg-amber-50 border-amber-100 h-full hover:bg-amber-100/50 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-amber-800 flex items-center gap-2">
                                LEGISLATIVE RISK
                                <AlertTriangle className="h-4 w-4" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-2 mb-2">
                                <div className="text-4xl font-bold text-amber-900">High</div>
                                <div className="text-sm font-medium text-amber-700 mb-1.5">/ Critical</div>
                            </div>
                            <p className="text-xs text-amber-800/80 leading-relaxed">
                                New tenant protection bill (SB 567) advancing in state senate. Potential impact on eviction proceedings.
                            </p>
                        </CardContent>
                    </Card>
                </a>

                {/* News Feed */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                    <Card className="h-[400px] flex flex-col border-slate-200 shadow-sm">
                        <CardHeader className="border-b bg-slate-50/50 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Newspaper className="h-5 w-5 text-indigo-600" />
                                        Location-Based Intelligence
                                    </CardTitle>
                                    <CardDescription>
                                        AI-curated updates for your property jurisdictions.
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="bg-white text-slate-500">
                                    <RefreshCw className={`h-3 w-3 mr-1 ${loadingLegislative ? 'animate-spin' : ''}`} />
                                    {loadingLegislative ? 'Updating...' : 'Auto-Updating'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-hidden relative">
                            <ScrollArea className="h-full">
                                <div className="divide-y divide-slate-100">
                                    {legislativeUpdates.length > 0 ? (
                                        legislativeUpdates.map((update) => (
                                            <div key={update.id} className="p-4 hover:bg-slate-50 transition-colors group">
                                                <div className="flex items-start gap-4">
                                                    <div className={`mt-1 p-2 rounded-lg shrink-0 ${update.severity === 'high' ? 'bg-red-50 text-red-600' :
                                                        update.severity === 'medium' ? 'bg-amber-50 text-amber-600' :
                                                            'bg-blue-50 text-blue-600'
                                                        }`}>
                                                        {update.severity === 'high' ? <AlertTriangle className="h-4 w-4" /> :
                                                            update.category === 'Macro' ? <Globe className="h-4 w-4" /> :
                                                                <Building2 className="h-4 w-4" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="secondary" className="text-[10px] font-medium px-1.5 py-0 h-5">
                                                                {update.location}
                                                            </Badge>
                                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {update.timestamp}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                            {update.title}
                                                        </h3>
                                                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                                            {update.summary}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-slate-500">
                                            {loadingLegislative ? 'Scanning legislative databases...' : 'No recent updates found.'}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* Ask the Agent */}
                <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-0 shadow-lg relative overflow-hidden col-span-1 md:col-span-2 lg:col-span-1">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Users2 className="h-32 w-32" />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Sparkles className="h-5 w-5 text-indigo-200" />
                            Steward AI Analyst
                        </CardTitle>
                        <CardDescription className="text-indigo-100">
                            Powered by <strong>Gemini 3 Pro</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 relative z-10">
                            {loadingAnalysis ? (
                                <div className="animate-pulse space-y-3">
                                    <div className="h-4 bg-white/20 rounded w-3/4"></div>
                                    <div className="h-4 bg-white/20 rounded w-full"></div>
                                    <div className="h-4 bg-white/20 rounded w-5/6"></div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-indigo-50 text-sm leading-relaxed">
                                        "{stewardAnalysis?.summary || "Analyzing portfolio data..."}"
                                    </p>
                                    {stewardAnalysis?.keyInsights && stewardAnalysis.keyInsights.length > 0 && (
                                        <div className="bg-white/10 rounded p-2 text-xs text-indigo-100 border border-white/10">
                                            <strong>Insight:</strong> {stewardAnalysis.keyInsights[0]}
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="flex flex-col gap-2 pt-2">
                                <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-indigo-50 border-0 w-full justify-start">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Chat with Steward
                                </Button>
                                <Button variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white/10 w-full justify-start">
                                    View Full Report
                                    <ArrowRight className="h-4 w-4 ml-auto" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
