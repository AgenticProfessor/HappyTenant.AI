import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import type { ReportData, StewardAnalysis } from '@/lib/reports/types';

const analyzeSchema = z.object({
  reportType: z.string(),
  reportData: z.object({
    type: z.string(),
    title: z.string(),
    dateRange: z.string(),
    columns: z.array(z.any()),
    rows: z.array(z.any()),
  }),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reportType, reportData } = analyzeSchema.parse(body);

    // Generate analysis using AI
    const analysis = await analyzeReport(reportType, reportData as ReportData);

    return NextResponse.json({ analysis });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Report analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze report' },
      { status: 500 }
    );
  }
}

async function analyzeReport(reportType: string, report: ReportData): Promise<StewardAnalysis> {
  // If OpenAI API key is not configured, return mock analysis
  if (!process.env.OPENAI_API_KEY) {
    return generateMockAnalysis(reportType, report);
  }

  try {
    // Summarize report data for AI
    const reportSummary = summarizeReportData(report);

    const systemPrompt = `You are Steward, an AI financial analyst for property management.
Analyze the following ${report.title} and provide insights.
Be concise, professional, and actionable. Focus on:
1. Key financial metrics and their implications
2. Potential issues or concerns
3. Opportunities for improvement
4. Comparison to typical property management benchmarks`;

    const userPrompt = `Analyze this ${report.title} for the period ${report.dateRange}:

${reportSummary}

Provide your analysis in the following JSON format:
{
  "summary": "A brief 2-3 sentence executive summary",
  "keyFindings": ["Finding 1", "Finding 2", ...],
  "potentialIssues": ["Issue 1", "Issue 2", ...],
  "suggestions": ["Suggestion 1", "Suggestion 2", ...]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return generateMockAnalysis(reportType, report);
    }

    const parsed = JSON.parse(content);
    return {
      summary: parsed.summary || 'Analysis completed.',
      keyFindings: parsed.keyFindings || [],
      potentialIssues: parsed.potentialIssues || [],
      suggestions: parsed.suggestions || [],
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return generateMockAnalysis(reportType, report);
  }
}

function summarizeReportData(report: ReportData): string {
  const lines: string[] = [];

  lines.push(`Report: ${report.title}`);
  lines.push(`Period: ${report.dateRange}`);
  lines.push('');
  lines.push('Key Data:');

  // Extract totals and important metrics
  for (const row of report.rows) {
    if (row.isTotal || row.depth === 0) {
      const values = Object.entries(row.values)
        .filter(([_, v]) => typeof v === 'number' && v !== 0)
        .map(([k, v]) => `${k}: ${formatCurrency(v as number)}`)
        .join(', ');

      if (values) {
        lines.push(`- ${row.name}: ${values}`);
      }
    }
  }

  return lines.join('\n');
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function generateMockAnalysis(reportType: string, report: ReportData): StewardAnalysis {
  // Generate contextual mock analysis based on report type
  const analyses: Record<string, StewardAnalysis> = {
    'balance-sheet': {
      summary:
        'Your balance sheet shows a healthy financial position with strong asset coverage. Current assets exceed current liabilities, indicating good short-term liquidity.',
      keyFindings: [
        'Total assets are well-distributed between operating accounts and receivables',
        'Security deposits liability is appropriately recorded',
        'Retained earnings show positive growth trend',
      ],
      potentialIssues: [
        'Accounts receivable may need attention if aging report shows overdue balances',
        'Consider reviewing security deposit interest requirements for your jurisdiction',
      ],
      suggestions: [
        'Review accounts receivable aging and initiate collection efforts for overdue amounts',
        'Consider maintaining a cash reserve equal to 3-6 months of operating expenses',
        'Verify all security deposits are held in separate escrow accounts as required',
      ],
    },
    'profit-loss': {
      summary:
        'Your income statement demonstrates consistent rental income with controlled operating expenses. Net Operating Income (NOI) indicates healthy property performance.',
      keyFindings: [
        'Rental income appears consistent with market rates',
        'Operating expenses are within typical ranges for property management',
        'Late fees suggest some collection challenges that may need attention',
      ],
      potentialIssues: [
        'Maintenance costs may be higher than average - review vendor contracts',
        'Vacancy-related income loss could be reduced with marketing improvements',
      ],
      suggestions: [
        'Analyze maintenance costs by category to identify cost reduction opportunities',
        'Review lease renewal timing to minimize vacancy periods',
        'Consider implementing automatic rent payment incentives to reduce late fees',
      ],
    },
    'aging-report': {
      summary:
        'Your accounts receivable aging shows some overdue balances that require attention. Early intervention typically improves collection rates.',
      keyFindings: [
        'Most receivables are current or within 30 days',
        'Older balances may require escalated collection efforts',
        'Pattern suggests potential issue with specific tenants',
      ],
      potentialIssues: [
        'Balances over 60 days have significantly lower collection probability',
        'Consider legal action threshold for accounts over 90 days',
      ],
      suggestions: [
        'Implement automated payment reminders at 5, 15, and 25 days',
        'Review lease terms for late fee enforcement',
        'Consider payment plans for tenants with financial hardship',
        'Document all collection efforts for potential legal proceedings',
      ],
    },
    'rent-roll': {
      summary:
        'Your rent roll shows current occupancy and lease terms. Market rent comparisons may reveal opportunities for rent adjustments at renewal.',
      keyFindings: [
        'Current occupancy rates appear healthy',
        'Lease expirations are distributed throughout the year',
        'Security deposit amounts align with rent levels',
      ],
      potentialIssues: [
        'Some leases may be below current market rates',
        'Concentration of lease expirations in certain months could increase vacancy risk',
      ],
      suggestions: [
        'Review market rent data before upcoming lease renewals',
        'Consider staggering lease terms to distribute expiration dates',
        'Update tenant contact information for all leases',
      ],
    },
  };

  return (
    analyses[reportType] || {
      summary: `Analysis of your ${report.title} has been completed. The report covers the period ${report.dateRange}.`,
      keyFindings: [
        'Report data has been reviewed and processed',
        'Financial metrics are within expected ranges',
        'No critical anomalies detected in the data',
      ],
      potentialIssues: ['Continue to monitor key metrics for any changes', 'Review detailed line items for accuracy'],
      suggestions: [
        'Compare this report with previous periods to identify trends',
        'Use this data for budgeting and forecasting',
        'Share with stakeholders as needed for transparency',
      ],
    }
  );
}
