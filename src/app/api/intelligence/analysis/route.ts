import { NextResponse } from 'next/server';
import { StewardAnalyst } from '@/lib/intelligence/steward-analyst';

export async function GET() {
    try {
        // "Agent" performs the analysis
        const analysis = await StewardAnalyst.analyzePortfolio();

        return NextResponse.json(analysis);
    } catch (error) {
        console.error('Steward Analyst failed:', error);
        return NextResponse.json({ error: 'Agent failed to analyze' }, { status: 500 });
    }
}
