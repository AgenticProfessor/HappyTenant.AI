import { NextResponse } from 'next/server';
import { StewardAccountingAnalyst } from '@/lib/intelligence/steward-accounting';

export async function GET() {
    try {
        const analysis = await StewardAccountingAnalyst.analyzeFinancials();
        return NextResponse.json(analysis);
    } catch (error) {
        console.error('Steward Accounting Analyst failed:', error);
        return NextResponse.json({ error: 'Agent failed to analyze financials' }, { status: 500 });
    }
}
