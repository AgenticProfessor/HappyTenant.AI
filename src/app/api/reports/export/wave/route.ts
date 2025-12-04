import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateReportData } from '@/lib/reports/export/csv-generator';
import type { ReportFilters } from '@/lib/reports/types';

/**
 * Wave Export Implementation
 * 
 * Generates a CSV formatted for Wave import.
 * Wave typically expects: Date, Description, Amount
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
        const { userId, organizationId } = await auth();

        if (!userId || !organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { reportType, filters } = exportSchema.parse(body);

        // Reuse CSV generator for now, but in a real implementation we would map columns
        // to Wave's specific import format.
        const csvContent = await generateReportData(prisma, organizationId, reportType, filters as ReportFilters);

        // Return as downloadable file
        const filename = `${reportType}-wave-${filters.startDate}-to-${filters.endDate}.csv`;

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

        console.error('Wave export error:', error);
        return NextResponse.json(
            { error: 'Failed to export to Wave' },
            { status: 500 }
        );
    }
}
