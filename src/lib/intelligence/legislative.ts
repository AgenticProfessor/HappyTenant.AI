import { z } from 'zod';

export interface LegislativeUpdate {
    id: string;
    location: string;
    title: string;
    summary: string;
    severity: 'high' | 'medium' | 'low';
    source: string;
    url: string;
    timestamp: string;
    category: 'Regulation' | 'Tenant Rights' | 'Tax' | 'Macro';
}

export class LegislativeAgent {
    private static LOCATIONS = ['Austin, TX', 'Seattle, WA', 'Denver, CO', 'National'];

    /**
     * Simulates crawling for legislative updates.
     * In a real implementation, this would use a search API (e.g., Google Custom Search)
     * or scrape specific municipal sites.
     */
    static async crawl(): Promise<LegislativeUpdate[]> {
        // Simulate network delay for "crawling"
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock "crawled" data - structured to look like it came from various sources
        return [
            {
                id: 'leg-1',
                location: 'Austin, TX',
                title: 'Short-Term Rental License Cap Proposed',
                summary: 'City council is debating a hard cap on STR licenses in residential zones (Type 2). Vote expected next Tuesday.',
                severity: 'high',
                source: 'Austin City Council Agenda',
                url: 'https://www.austintexas.gov/council',
                timestamp: '2 hours ago',
                category: 'Regulation'
            },
            {
                id: 'leg-2',
                location: 'Seattle, WA',
                title: 'Winter Eviction Moratorium Extension',
                summary: 'Mayor announces 2-week extension to the winter eviction ban due to forecasted severe weather.',
                severity: 'medium',
                source: 'Seattle Housing Authority',
                url: 'https://www.seattlehousing.org',
                timestamp: '5 hours ago',
                category: 'Tenant Rights'
            },
            {
                id: 'leg-3',
                location: 'National',
                title: 'Fed Chair Powell Speech Analysis',
                summary: 'Key signals suggest a "higher for longer" stance may be softening. Markets reacting positively.',
                severity: 'low',
                source: 'Bloomberg / Polymarket',
                url: 'https://www.bloomberg.com',
                timestamp: '12 hours ago',
                category: 'Macro'
            },
            {
                id: 'leg-4',
                location: 'Denver, CO',
                title: 'Property Tax Assessment Appeals Open',
                summary: 'Window for appealing 2024 valuations opens May 1st. Average increase in metro area is 12%.',
                severity: 'medium',
                source: 'Denver Assessor Office',
                url: 'https://www.denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Assessment-Division',
                timestamp: '1 day ago',
                category: 'Tax'
            }
        ];
    }

    /**
     * Analyzes the risk level for a specific location based on keywords.
     */
    static analyzeRisk(text: string): 'high' | 'medium' | 'low' {
        const lower = text.toLowerCase();
        if (lower.includes('ban') || lower.includes('cap') || lower.includes('eviction') || lower.includes('tax increase')) {
            return 'high';
        }
        if (lower.includes('regulation') || lower.includes('compliance') || lower.includes('appeal')) {
            return 'medium';
        }
        return 'low';
    }
}
