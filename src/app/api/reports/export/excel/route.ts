import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateExcelReport } from '@/lib/reports/export/excel-generator';
import type { ReportFilters } from '@/lib/reports/types';

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

    // Generate Excel content
    const excelBuffer = await generateExcelReport(prisma, organizationId, reportType, filters as ReportFilters);

    // Return as downloadable file
    const filename = `${reportType}-${filters.startDate}-to-${filters.endDate}.xlsx`;

    return new NextResponse(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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

    console.error('Excel export error:', error);
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}
