import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { Transaction } from '@/lib/reports/types';

const querySchema = z.object({
  accountId: z.string(),
  columnKey: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

export async function GET(request: Request, { params }: { params: Promise<{ type: string }> }) {
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

    const { searchParams } = new URL(request.url);
    const { accountId, columnKey, startDate, endDate } = querySchema.parse({
      accountId: searchParams.get('accountId'),
      columnKey: searchParams.get('columnKey'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    });

    const { type: reportType } = await params;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Parse the column key to determine date filtering
    // Column keys can be: 'total', 'jan', 'feb', etc., or 'q1', 'q2', etc.
    const { columnStart, columnEnd } = getColumnDateRange(columnKey, start, end);

    // Fetch transactions based on report type and account
    const transactions = await fetchTransactions(
      user.organizationId,
      reportType,
      accountId,
      columnStart,
      columnEnd
    );

    return NextResponse.json({ transactions });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }

    console.error('Transactions fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

function getColumnDateRange(
  columnKey: string,
  periodStart: Date,
  periodEnd: Date
): { columnStart: Date; columnEnd: Date } {
  const year = periodStart.getFullYear();

  // Month columns (jan, feb, etc.)
  const months: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  if (months[columnKey] !== undefined) {
    const monthIndex = months[columnKey];
    const columnStart = new Date(year, monthIndex, 1);
    const columnEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
    return { columnStart, columnEnd };
  }

  // Quarter columns
  const quarters: Record<string, { startMonth: number; endMonth: number }> = {
    q1: { startMonth: 0, endMonth: 2 },
    q2: { startMonth: 3, endMonth: 5 },
    q3: { startMonth: 6, endMonth: 8 },
    q4: { startMonth: 9, endMonth: 11 },
  };

  if (quarters[columnKey]) {
    const { startMonth, endMonth } = quarters[columnKey];
    const columnStart = new Date(year, startMonth, 1);
    const columnEnd = new Date(year, endMonth + 1, 0, 23, 59, 59, 999);
    return { columnStart, columnEnd };
  }

  // Default to full period for 'total' or unknown columns
  return { columnStart: periodStart, columnEnd: periodEnd };
}

async function fetchTransactions(
  organizationId: string,
  reportType: string,
  accountId: string,
  startDate: Date,
  endDate: Date
): Promise<Transaction[]> {
  const transactions: Transaction[] = [];

  // Parse account ID to determine what type of data to fetch
  // Account IDs follow patterns like: 'rent', 'late_fees', 'security_deposits', 'expense_repairs', etc.
  const accountParts = accountId.split('_');
  const accountCategory = accountParts[0];

  // Income accounts - fetch charges/payments
  if (['rent', 'late', 'utility', 'parking', 'pet', 'other'].includes(accountCategory)) {
    const chargeType = getChargeTypeFromAccount(accountId);

    if (chargeType) {
      const charges = await prisma.charge.findMany({
        where: {
          lease: {
            unit: {
              property: {
                organizationId,
              },
            },
          },
          type: chargeType,
          dueDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          lease: {
            include: {
              unit: {
                include: {
                  property: true,
                },
              },
              leaseTenants: {
                include: {
                  tenant: true,
                },
              },
            },
          },
          paymentAllocations: {
            include: {
              payment: true,
            },
          },
        },
        orderBy: {
          dueDate: 'desc',
        },
        take: 100,
      });

      for (const charge of charges) {
        const tenant = charge.lease.leaseTenants[0]?.tenant;
        const property = charge.lease.unit.property;

        transactions.push({
          id: charge.id,
          date: charge.dueDate.toISOString(),
          description: charge.description,
          amount: Number(charge.amount),
          type: 'charge',
          category: charge.type,
          reference: `CHG-${charge.id.slice(-6).toUpperCase()}`,
          propertyName: property.name,
          unitNumber: charge.lease.unit.unitNumber,
          tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : undefined,
          status: charge.status,
        });
      }
    }
  }

  // Expense accounts - fetch expenses
  if (accountCategory === 'expense' || accountId.startsWith('expenses_')) {
    const expenseCategory = getExpenseCategoryFromAccount(accountId);

    const expenses = await prisma.expense.findMany({
      where: {
        organizationId,
        ...(expenseCategory ? { category: expenseCategory } : {}),
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        expenseDate: 'desc',
      },
      take: 100,
    });

    for (const expense of expenses) {
      transactions.push({
        id: expense.id,
        date: expense.expenseDate.toISOString(),
        description: expense.description,
        amount: Number(expense.amount),
        type: 'expense',
        category: expense.category,
        reference: `EXP-${expense.id.slice(-6).toUpperCase()}`,
        status: expense.paidAt ? 'PAID' : 'PENDING',
      });
    }
  }

  // Payment-related accounts
  if (accountId === 'payments' || accountId.includes('payment')) {
    const payments = await prisma.payment.findMany({
      where: {
        lease: {
          unit: {
            property: {
              organizationId,
            },
          },
        },
        receivedAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
            leaseTenants: {
              include: {
                tenant: true,
              },
            },
          },
        },
      },
      orderBy: {
        receivedAt: 'desc',
      },
      take: 100,
    });

    for (const payment of payments) {
      const tenant = payment.lease.leaseTenants[0]?.tenant;
      const property = payment.lease.unit.property;

      transactions.push({
        id: payment.id,
        date: payment.receivedAt.toISOString(),
        description: `Payment - ${payment.method}`,
        amount: Number(payment.amount),
        type: 'payment',
        category: payment.method,
        reference: payment.receiptNumber || `PMT-${payment.id.slice(-6).toUpperCase()}`,
        propertyName: property.name,
        unitNumber: payment.lease.unit.unitNumber,
        tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : undefined,
        status: payment.status,
      });
    }
  }

  // Security deposits
  if (accountId.includes('security') || accountId.includes('deposit')) {
    const deposits = await prisma.charge.findMany({
      where: {
        lease: {
          unit: {
            property: {
              organizationId,
            },
          },
        },
        type: 'SECURITY_DEPOSIT',
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
            leaseTenants: {
              include: {
                tenant: true,
              },
            },
          },
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
      take: 100,
    });

    for (const deposit of deposits) {
      const tenant = deposit.lease.leaseTenants[0]?.tenant;
      const property = deposit.lease.unit.property;

      transactions.push({
        id: deposit.id,
        date: deposit.dueDate.toISOString(),
        description: deposit.description,
        amount: Number(deposit.amount),
        type: 'charge',
        category: 'SECURITY_DEPOSIT',
        reference: `DEP-${deposit.id.slice(-6).toUpperCase()}`,
        propertyName: property.name,
        unitNumber: deposit.lease.unit.unitNumber,
        tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : undefined,
        status: deposit.status,
      });
    }
  }

  return transactions;
}

function getChargeTypeFromAccount(
  accountId: string
): 'RENT' | 'LATE_FEE' | 'UTILITY' | 'PARKING' | 'PET_RENT' | 'SECURITY_DEPOSIT' | 'OTHER' | null {
  const mapping: Record<string, 'RENT' | 'LATE_FEE' | 'UTILITY' | 'PARKING' | 'PET_RENT' | 'SECURITY_DEPOSIT' | 'OTHER'> = {
    rent: 'RENT',
    late_fees: 'LATE_FEE',
    late: 'LATE_FEE',
    utility: 'UTILITY',
    utilities: 'UTILITY',
    parking: 'PARKING',
    pet: 'PET_RENT',
    pet_rent: 'PET_RENT',
    security: 'SECURITY_DEPOSIT',
    security_deposit: 'SECURITY_DEPOSIT',
    other: 'OTHER',
    other_income: 'OTHER',
  };

  return mapping[accountId] || null;
}

function getExpenseCategoryFromAccount(
  accountId: string
):
  | 'REPAIRS_MAINTENANCE'
  | 'PROPERTY_TAX'
  | 'INSURANCE'
  | 'UTILITIES'
  | 'PROPERTY_MANAGEMENT'
  | 'LEGAL_PROFESSIONAL'
  | 'ADVERTISING'
  | 'SUPPLIES'
  | 'HOA_FEES'
  | 'MORTGAGE_INTEREST'
  | 'DEPRECIATION'
  | 'OTHER'
  | null {
  const mapping: Record<
    string,
    | 'REPAIRS_MAINTENANCE'
    | 'PROPERTY_TAX'
    | 'INSURANCE'
    | 'UTILITIES'
    | 'PROPERTY_MANAGEMENT'
    | 'LEGAL_PROFESSIONAL'
    | 'ADVERTISING'
    | 'SUPPLIES'
    | 'HOA_FEES'
    | 'MORTGAGE_INTEREST'
    | 'DEPRECIATION'
    | 'OTHER'
  > = {
    expense_repairs: 'REPAIRS_MAINTENANCE',
    expense_maintenance: 'REPAIRS_MAINTENANCE',
    expenses_repairs: 'REPAIRS_MAINTENANCE',
    expense_tax: 'PROPERTY_TAX',
    expense_taxes: 'PROPERTY_TAX',
    expenses_property_tax: 'PROPERTY_TAX',
    expense_insurance: 'INSURANCE',
    expenses_insurance: 'INSURANCE',
    expense_utilities: 'UTILITIES',
    expenses_utilities: 'UTILITIES',
    expense_management: 'PROPERTY_MANAGEMENT',
    expenses_management: 'PROPERTY_MANAGEMENT',
    expense_legal: 'LEGAL_PROFESSIONAL',
    expenses_legal: 'LEGAL_PROFESSIONAL',
    expense_advertising: 'ADVERTISING',
    expenses_advertising: 'ADVERTISING',
    expense_supplies: 'SUPPLIES',
    expenses_supplies: 'SUPPLIES',
    expense_hoa: 'HOA_FEES',
    expenses_hoa: 'HOA_FEES',
    expense_mortgage: 'MORTGAGE_INTEREST',
    expenses_mortgage: 'MORTGAGE_INTEREST',
    expense_depreciation: 'DEPRECIATION',
    expenses_depreciation: 'DEPRECIATION',
    expense_other: 'OTHER',
    expenses_other: 'OTHER',
  };

  return mapping[accountId] || null;
}
