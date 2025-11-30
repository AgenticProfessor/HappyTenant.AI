import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { PolymarketService } from '@/lib/intelligence/polymarket';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch the specific Fed decision prediction
        const data = await PolymarketService.getFedDecisionInDecemberPrediction();

        if (!data) {
            // Fallback if API fails or no market found
            return NextResponse.json({
                marketQuestion: 'Fed Interest Rate',
                probability: 0,
                prediction: 'Data Unavailable',
                meetingDate: 'N/A',
                volume: 0,
                slug: '',
                marketId: ''
            });
        }

        // Add history fetching if marketId is present
        let history: { t: number; p: number }[] = [];
        if (data && data.marketId) {
            history = await PolymarketService.getMarketHistory(data.marketId);
        }

        return NextResponse.json({
            ...data,
            history
        });
    } catch (error) {
        console.error('Error in market data API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
