import { NextResponse } from 'next/server';
import { LegislativeAgent } from '@/lib/intelligence/legislative';

export async function GET() {
    try {
        // "Agent" performs the crawl
        const updates = await LegislativeAgent.crawl();

        return NextResponse.json(updates);
    } catch (error) {
        console.error('Legislative Agent failed:', error);
        return NextResponse.json({ error: 'Agent failed to crawl' }, { status: 500 });
    }
}
