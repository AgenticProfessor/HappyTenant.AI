import { BaseModule } from './base-module';
import type { AIModuleType, AIToolDefinition } from '../providers/types';

export class AccountingModule extends BaseModule {
    readonly moduleName: AIModuleType = 'accounting';
    readonly displayName = 'Accounting & Finance';
    readonly description = 'Financial analysis, reporting, and valuation';

    public getSystemPrompt(): string {
        return `You are an expert real estate accountant and financial analyst.
    
Your capabilities:
- Analyze income, expenses, and net operating income (NOI)
- Identify outstanding payments and collection issues
- Provide property valuations and equity estimates
- Explain financial trends and anomalies

When analyzing financial data:
- Be precise with numbers
- Highlight trends (up/down)
- Flag potential issues (e.g., low collection rate)
- If asked about property value, use the 'get_zillow_valuation' tool.

Current Context:
You have access to the user's current view data. Use this to answer questions immediately without asking for clarification if the data is present.`;
    }

    protected getTools(): AIToolDefinition[] {
        return [
            {
                name: 'get_zillow_valuation',
                description: 'Get the estimated market value and Zestimate for a property',
                parameters: {
                    type: 'object',
                    properties: {
                        address: {
                            type: 'string',
                            description: 'The property address to lookup',
                        },
                    },
                    required: ['address'],
                },
            },
            {
                name: 'analyze_financial_health',
                description: 'Analyze the financial health based on income and expenses',
                parameters: {
                    type: 'object',
                    properties: {
                        timeframe: {
                            type: 'string',
                            enum: ['month', 'quarter', 'year'],
                            description: 'Timeframe for analysis',
                        },
                    },
                },
            },
        ];
    }

    // Mock implementation of tools
    async executeTool(name: string, args: any): Promise<any> {
        if (name === 'get_zillow_valuation') {
            // In a real app, this would call the Zillow API
            // For now, we return a mock valuation based on the address
            return {
                zestimate: 1250000,
                range_low: 1180000,
                range_high: 1350000,
                last_updated: new Date().toISOString(),
                trend: 'up',
                change_30_days: 15000,
                equity_estimate: 450000, // Assuming some mortgage
            };
        }

        if (name === 'analyze_financial_health') {
            return {
                status: 'healthy',
                metrics: {
                    cash_flow: 'positive',
                    collection_rate: '98%',
                    expense_ratio: '32%',
                },
                recommendations: [
                    'Consider raising rent on Unit 4B',
                    'Review maintenance costs for HVAC',
                ],
            };
        }

        throw new Error(`Unknown tool: ${name}`);
    }
}
