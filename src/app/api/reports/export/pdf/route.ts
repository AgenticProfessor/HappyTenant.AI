import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generatePDFReport } from '@/lib/reports/export/pdf-generator';

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

    // Generate PDF content (returns HTML for browser print)
    const pdfContent = await generatePDFReport(prisma, user.organizationId, reportType, filters as unknown as import('@/lib/reports/types').ReportFilters);

    // Return as HTML that can be printed to PDF by the browser
    const filename = `${reportType}-${filters.startDate}-to-${filters.endDate}.html`;

    return new NextResponse(pdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
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

    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}
