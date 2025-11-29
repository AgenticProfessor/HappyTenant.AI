import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getReportDefinition, getDateRangeFromPeriod } from '@/lib/reports/definitions';
import { generateBalanceSheet } from '@/lib/reports/calculations/balance-sheet';
import { generateProfitLoss } from '@/lib/reports/calculations/profit-loss';
import { generateRentRoll } from '@/lib/reports/calculations/rent-roll';
import { generateAgingReport } from '@/lib/reports/calculations/aging-report';
import { generateCashFlow } from '@/lib/reports/calculations/cash-flow';
import { generateSecurityDeposit } from '@/lib/reports/calculations/security-deposit';
import { generateExpenseReport } from '@/lib/reports/calculations/expense-report';
import { generateOwnerStatement } from '@/lib/reports/calculations/owner-statement';
import { generatePropertyPerformance } from '@/lib/reports/calculations/property-performance';
import { generateVacancyReport } from '@/lib/reports/calculations/vacancy';
import { generateTenantLedger } from '@/lib/reports/calculations/tenant-ledger';
import { generateTax1099 } from '@/lib/reports/calculations/tax-1099';
import { generateDepreciation } from '@/lib/reports/calculations/depreciation';
import type { ReportFilters, ReportType, ReportData } from '@/lib/reports/types';

// GET /api/reports/[type] - Generate a specific report
export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await params;
    const reportType = type as ReportType;

    // Validate report type
    const definition = getReportDefinition(reportType);
    if (!definition) {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'year-to-date';
    const dateRange = getDateRangeFromPeriod(period);

    const filters: ReportFilters = {
      period: period as ReportFilters['period'],
      startDate: searchParams.get('startDate') || dateRange.startDate,
      endDate: searchParams.get('endDate') || dateRange.endDate,
      accountingMethod: (searchParams.get('accountingMethod') || 'cash') as 'cash' | 'accrual',
      groupBy: (searchParams.get('groupBy') || 'none') as ReportFilters['groupBy'],
      propertyId: searchParams.get('propertyId') || undefined,
    };

    const organizationId = user.organizationId;

    // Generate the report based on type
    let report: ReportData;

    switch (reportType) {
      case 'balance-sheet':
        report = await generateBalanceSheet(prisma, organizationId, filters);
        break;
      case 'profit-loss':
        report = await generateProfitLoss(prisma, organizationId, filters);
        break;
      case 'cash-flow':
        report = await generateCashFlow(prisma, organizationId, filters);
        break;
      case 'owner-statement':
        report = await generateOwnerStatement(prisma, organizationId, filters);
        break;
      case 'rent-roll':
        report = await generateRentRoll(prisma, organizationId, filters);
        break;
      case 'property-performance':
        report = await generatePropertyPerformance(prisma, organizationId, filters);
        break;
      case 'vacancy':
        report = await generateVacancyReport(prisma, organizationId, filters);
        break;
      case 'aging-report':
        report = await generateAgingReport(prisma, organizationId, filters);
        break;
      case 'security-deposit':
        report = await generateSecurityDeposit(prisma, organizationId, filters);
        break;
      case 'tenant-ledger':
        report = await generateTenantLedger(prisma, organizationId, filters);
        break;
      case 'tax-1099':
        report = await generateTax1099(prisma, organizationId, filters);
        break;
      case 'expense-report':
        report = await generateExpenseReport(prisma, organizationId, filters);
        break;
      case 'depreciation':
        report = await generateDepreciation(prisma, organizationId, filters);
        break;
      default:
        return NextResponse.json({ error: 'Report type not implemented' }, { status: 501 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
