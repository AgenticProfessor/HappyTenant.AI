import { z } from 'zod';

// Types for Polymarket API response
interface Market {
    id: string;
    question: string;
    slug: string;
    endDateIso: string;
    outcomePrices: string; // JSON string
    volume: string;
    groupItemTitle?: string;
    active?: boolean;
    closed?: boolean;
    outcomes?: string; // JSON string
}

interface Event {
    id: string;
    ticker: string;
    slug: string;
    title: string;
    markets: Market[];
}

export interface FedRatePrediction {
    marketQuestion: string;
    probability: number;
    yesProbability?: number;
    noProbability?: number;
    prediction: string;
    meetingDate: string;
    volume: number;
    slug: string;
    marketId?: string;
}

const POLYMARKET_API_URL = 'https://gamma-api.polymarket.com/events';

export class PolymarketService {
    /**
     * Fetches the latest Federal Reserve interest rate prediction.
     * Scours the Polymarket API for the most relevant active market.
     */
    static async getFedRatePrediction(): Promise<FedRatePrediction | null> {
        try {
            // 1. Search for active FOMC markets
            // We look for "FOMC" to find specific meeting probabilities
            const query = 'FOMC';
            const url = `${POLYMARKET_API_URL}?q=${encodeURIComponent(query)}&active=true&closed=false&limit=20`;

            const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
            if (!response.ok) {
                throw new Error(`Polymarket API error: ${response.statusText}`);
            }

            const events: Event[] = await response.json();

            // 2. Filter and find the best market
            // We want the next upcoming meeting.
            // Strategy: Look for markets with "Fed Interest Rate" in the title, sorted by date.

            const now = new Date();

            // Flatten all markets from events
            const allMarkets = events.flatMap(event => event.markets);

            const relevantMarkets = allMarkets
                .filter(market => {
                    // Must be active and in the future
                    const endDate = new Date(market.endDateIso);
                    return market.active !== false && !market.closed && endDate > now;
                })
                .filter(market => {
                    // Must be about Fed Rates/FOMC
                    const q = market.question.toLowerCase();
                    return q.includes('fomc') || (q.includes('fed') && q.includes('rate'));
                })
                .sort((a, b) => {
                    // Sort by volume (descending) to find the most liquid/authoritative market
                    return parseFloat(b.volume) - parseFloat(a.volume);
                });

            if (relevantMarkets.length === 0) {
                return null;
            }

            // Pick the highest volume market
            const bestMarket = relevantMarkets[0];

            // Parse outcomes and prices
            const outcomes = JSON.parse(bestMarket.outcomes || '[]') as string[];
            const prices = JSON.parse(bestMarket.outcomePrices) as string[];

            // Find the outcome with the highest probability
            let maxProb = 0;
            let predictedOutcome = '';

            prices.forEach((price, index) => {
                const prob = parseFloat(prices[index]);
                if (prob > maxProb) {
                    maxProb = prob;
                    predictedOutcome = outcomes[index];
                }
            });

            return {
                marketQuestion: bestMarket.question,
                probability: Math.round(maxProb * 100),
                prediction: predictedOutcome,
                meetingDate: new Date(bestMarket.endDateIso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                volume: parseFloat(bestMarket.volume),
                slug: bestMarket.slug
            };

        } catch (error) {
            console.error('Failed to fetch Polymarket data:', error);
            return null;
        }
    }

    // Helper method to search for events by query
    private static async searchEvents(query: string): Promise<Event[]> {
        const url = `${POLYMARKET_API_URL}?q=${encodeURIComponent(query)}&active=true&closed=false&limit=20`;
        const response = await fetch(url, { next: { revalidate: 3600 } });
        if (!response.ok) {
            throw new Error(`Polymarket API error: ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * Fetches the Federal Reserve interest rate prediction for a specific market.
     * This version targets the "fed-decision-in-december" market.
     */
    static async getFedDecisionInDecemberPrediction(): Promise<FedRatePrediction | null> {
        try {
            // Fetch the specific Fed decision market
            const events = await this.searchEvents('fed-decision-in-december');

            if (!events || events.length === 0) {
                return null;
            }

            // Find the "No change" market or the highest volume market
            const event = events[0];
            const noChangeMarket = event.markets.find((m: Market) => m.groupItemTitle === "No change") || event.markets[0];

            // Calculate total volume
            const totalVolume = event.markets.reduce((acc: number, m: Market) => acc + parseFloat(m.volume || '0'), 0);

            // Get probability of "No change"
            const noChangeProb = parseFloat(noChangeMarket.outcomePrices ? JSON.parse(noChangeMarket.outcomePrices)[0] : '0');

            // If "No change" is dominant (>50%), prediction is "Hold". Else "Cut".
            // This is a simplification; ideally we sum up cut probabilities.
            const cutMarkets = event.markets.filter((m: Market) => m.groupItemTitle?.includes('decrease'));
            const cutProb = cutMarkets.reduce((acc: number, m: Market) => acc + parseFloat(m.outcomePrices ? JSON.parse(m.outcomePrices)[0] : '0'), 0);

            const prediction = noChangeProb > cutProb ? "Hold" : "Cut";
            const probability = Math.max(noChangeProb, cutProb);

            return {
                marketQuestion: event.title,
                probability: Math.round(probability * 100),
                yesProbability: Math.round(cutProb * 100), // Assuming "Yes" means Cut for this context
                noProbability: Math.round(noChangeProb * 100), // Assuming "No" means Hold
                prediction: prediction,
                meetingDate: 'Dec 2025', // Hardcoded based on market title for now, or parse from description
                volume: totalVolume,
                slug: event.slug || '', // Ensure slug is not undefined
                marketId: noChangeMarket.id // Return market ID for history fetching
            };
        } catch (error) {
            console.error('Error fetching Polymarket data:', error);
            return null;
        }
    }

    static async getMarketHistory(marketId: string): Promise<{ t: number; p: number }[]> {
        try {
            const response = await fetch(`https://clob.polymarket.com/prices-history?interval=1d&market=${marketId}&fidelity=1000`);
            if (!response.ok) {
                throw new Error('Failed to fetch history');
            }
            const data = await response.json();
            return data.history.map((point: any) => ({
                t: point.t,
                p: point.p
            }));
        } catch (error) {
            console.error('Error fetching market history:', error);
            return [];
        }
    }
}
