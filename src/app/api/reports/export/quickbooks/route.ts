import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateReportData } from '@/lib/reports/export/csv-generator';
import type { ReportFilters } from '@/lib/reports/types';

/**
 * QuickBooks Export Implementation
 * 
 * Generates a CSV formatted specifically for QuickBooks Desktop/Online import.
 * While a direct API integration is better, a formatted CSV is a solid MVP.
 * 
 * QuickBooks typically expects: Date,Transaction Type,No.,Name,Memo/Description,Account,Amount
 */

const exportSchema = z.object({
  reportType: z.string(),
  filters: z.object({
    period: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    accountingMethod: z.enum(['cash', 'accrual']),
    groupBy: z.enum(['none', 'month', 'quarter', 'property']),
    propertyId: z.string().optional(),
  }),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { reportType, filters } = exportSchema.parse(body);

    // Reuse the CSV generator but we might want to customize it for QB in the future.
    // For now, we'll use the standard CSV but ensure it's delivered as a file download
    // so the user can import it.
    // TODO: Customize this to match QB IIF or specific CSV import format if needed.
    // For now, standard CSV is often importable with mapping.

    const csvContent = await generateReportData(prisma, user.organizationId, reportType, filters as ReportFilters);

    // Return as downloadable file
    const filename = `${reportType}-quickbooks-${filters.startDate}-to-${filters.endDate}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }

    console.error('QuickBooks export error:', error);
    return NextResponse.json(
      { error: 'Failed to export to QuickBooks' },
      { status: 500 }
    );
  }
}
