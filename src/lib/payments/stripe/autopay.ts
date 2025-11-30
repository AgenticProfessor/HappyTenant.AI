/**
 * AutoPay Scheduling Service
 *
 * Manages automatic recurring payments:
 * - Schedule setup and management
 * - Payment processing jobs
 * - Retry logic for failed payments
 */

import { prisma } from '@/lib/prisma';
import { processPayment, calculateFees } from './charge-payment';
import { Decimal } from '@prisma/client/runtime/library';
import { ChargeType } from '@prisma/client';

// ============================================================
// TYPES
// ============================================================

export interface AutoPaySchedule {
  id: string;
  leaseId: string;
  tenantId: string;
  paymentMethodId: string;
  paymentMethodDetails: {
    type: string;
    last4?: string;
    brand?: string;
    bankName?: string;
  };
  dayOfMonth: number;
  amount: number;
  chargeTypes: string[];
  isActive: boolean;
  lastProcessedAt: Date | null;
  lastProcessedStatus: string | null;
  nextPaymentDate: Date;
  createdAt: Date;
}

export interface SetupAutoPayInput {
  tenantId: string;
  leaseId: string;
  paymentMethodId: string;
  dayOfMonth: number;
  amount?: number; // If not provided, will pay full balance
  chargeTypes?: string[]; // If not provided, will pay all charge types
}

export interface AutoPayResult {
  success: boolean;
  schedule?: AutoPaySchedule;
  error?: string;
}

// ============================================================
// AUTOPAY SETUP
// ============================================================

/**
 * Set up AutoPay for a tenant's lease
 */
export async function setupAutoPay(input: SetupAutoPayInput): Promise<AutoPayResult> {
  const { tenantId, leaseId, paymentMethodId, dayOfMonth, amount, chargeTypes } = input;

  // Validate day of month
  if (dayOfMonth < 1 || dayOfMonth > 28) {
    return {
      success: false,
      error: 'Day of month must be between 1 and 28',
    };
  }

  // Verify payment method belongs to tenant
  const paymentMethod = await prisma.tenantPaymentMethod.findFirst({
    where: {
      id: paymentMethodId,
      tenantId,
      isActive: true,
    },
  });

  if (!paymentMethod) {
    return {
      success: false,
      error: 'Payment method not found',
    };
  }

  // Verify lease belongs to tenant
  const lease = await prisma.lease.findFirst({
    where: {
      id: leaseId,
      leaseTenants: {
        some: { tenantId },
      },
      status: 'ACTIVE',
    },
  });

  if (!lease) {
    return {
      success: false,
      error: 'Lease not found or not active',
    };
  }

  // Check for existing AutoPay
  const existing = await prisma.scheduledPayment.findUnique({
    where: {
      leaseId_tenantId: {
        leaseId,
        tenantId,
      },
    },
  });

  if (existing) {
    // Update existing
    const updated = await prisma.scheduledPayment.update({
      where: { id: existing.id },
      data: {
        paymentMethodId,
        dayOfMonth,
        amount: amount ? new Decimal(amount) : lease.rentAmount,
        chargeTypes: (chargeTypes as ChargeType[]) || [ChargeType.RENT],
        isActive: true,
      },
      include: {
        paymentMethod: true,
      },
    });

    return {
      success: true,
      schedule: mapToAutoPaySchedule(updated, updated.paymentMethod),
    };
  }

  // Create new AutoPay schedule
  const schedule = await prisma.scheduledPayment.create({
    data: {
      leaseId,
      tenantId,
      paymentMethodId,
      dayOfMonth,
      amount: amount ? new Decimal(amount) : lease.rentAmount,
      chargeTypes: (chargeTypes as ChargeType[]) || [ChargeType.RENT],
      isActive: true,
    },
    include: {
      paymentMethod: true,
    },
  });

  return {
    success: true,
    schedule: mapToAutoPaySchedule(schedule, schedule.paymentMethod),
  };
}

/**
 * Get AutoPay schedule for a tenant's lease
 */
export async function getAutoPaySchedule(
  tenantId: string,
  leaseId: string
): Promise<AutoPaySchedule | null> {
  const schedule = await prisma.scheduledPayment.findUnique({
    where: {
      leaseId_tenantId: {
        leaseId,
        tenantId,
      },
    },
    include: {
      paymentMethod: true,
    },
  });

  if (!schedule) return null;

  return mapToAutoPaySchedule(schedule, schedule.paymentMethod);
}

/**
 * Get all AutoPay schedules for a tenant
 */
export async function getTenantAutoPaySchedules(
  tenantId: string
): Promise<AutoPaySchedule[]> {
  const schedules = await prisma.scheduledPayment.findMany({
    where: {
      tenantId,
      isActive: true,
    },
    include: {
      paymentMethod: true,
      lease: {
        include: {
          unit: {
            include: {
              property: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return schedules.map((s) => mapToAutoPaySchedule(s, s.paymentMethod));
}

/**
 * Cancel AutoPay for a lease
 */
export async function cancelAutoPay(
  tenantId: string,
  leaseId: string
): Promise<{ success: boolean; error?: string }> {
  const schedule = await prisma.scheduledPayment.findUnique({
    where: {
      leaseId_tenantId: {
        leaseId,
        tenantId,
      },
    },
  });

  if (!schedule) {
    return { success: false, error: 'AutoPay not found' };
  }

  await prisma.scheduledPayment.update({
    where: { id: schedule.id },
    data: { isActive: false },
  });

  return { success: true };
}

/**
 * Update AutoPay settings
 */
export async function updateAutoPay(
  tenantId: string,
  leaseId: string,
  updates: {
    paymentMethodId?: string;
    dayOfMonth?: number;
    amount?: number;
  }
): Promise<AutoPayResult> {
  const schedule = await prisma.scheduledPayment.findUnique({
    where: {
      leaseId_tenantId: {
        leaseId,
        tenantId,
      },
    },
  });

  if (!schedule) {
    return { success: false, error: 'AutoPay not found' };
  }

  // Validate payment method if being updated
  if (updates.paymentMethodId) {
    const paymentMethod = await prisma.tenantPaymentMethod.findFirst({
      where: {
        id: updates.paymentMethodId,
        tenantId,
        isActive: true,
      },
    });

    if (!paymentMethod) {
      return { success: false, error: 'Payment method not found' };
    }
  }

  // Validate day of month
  if (updates.dayOfMonth && (updates.dayOfMonth < 1 || updates.dayOfMonth > 28)) {
    return { success: false, error: 'Day of month must be between 1 and 28' };
  }

  const updated = await prisma.scheduledPayment.update({
    where: { id: schedule.id },
    data: {
      paymentMethodId: updates.paymentMethodId,
      dayOfMonth: updates.dayOfMonth,
      amount: updates.amount ? new Decimal(updates.amount) : undefined,
    },
    include: {
      paymentMethod: true,
    },
  });

  return {
    success: true,
    schedule: mapToAutoPaySchedule(updated, updated.paymentMethod),
  };
}

// ============================================================
// PAYMENT PROCESSING (for cron jobs)
// ============================================================

/**
 * Process all scheduled payments for today
 * This should be called by a cron job daily
 */
export async function processScheduledPayments(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  errors: string[];
}> {
  const today = new Date();
  const dayOfMonth = today.getDate();

  // Get all active schedules for today
  const schedules = await prisma.scheduledPayment.findMany({
    where: {
      isActive: true,
      dayOfMonth,
      // Don't process if already processed today
      OR: [
        { lastProcessedAt: null },
        {
          lastProcessedAt: {
            lt: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          },
        },
      ],
    },
    include: {
      paymentMethod: true,
      lease: {
        include: {
          unit: {
            include: {
              property: {
                include: {
                  organization: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const results = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const schedule of schedules) {
    results.processed++;

    try {
      // Get outstanding charges for the lease
      const charges = await prisma.charge.findMany({
        where: {
          leaseId: schedule.leaseId,
          status: { in: ['PENDING', 'PARTIAL', 'DUE'] },
          type: { in: schedule.chargeTypes },
        },
        orderBy: { dueDate: 'asc' },
      });

      if (charges.length === 0) {
        // No charges to pay, mark as processed
        await prisma.scheduledPayment.update({
          where: { id: schedule.id },
          data: {
            lastProcessedAt: new Date(),
            lastProcessedStatus: 'NO_CHARGES',
          },
        });
        continue;
      }

      // Calculate total amount to pay
      const totalOwed = charges.reduce((sum, c) => sum + Number(c.amount), 0);
      const amountToPay = Math.min(Number(schedule.amount), totalOwed);

      // Process payment
      const result = await processPayment({
        tenantId: schedule.tenantId,
        leaseId: schedule.leaseId,
        chargeIds: charges.map((c) => c.id),
        paymentMethodId: schedule.paymentMethodId,
        amount: amountToPay,
        description: `AutoPay - ${schedule.lease.unit.property.name}`,
      });

      // Update schedule status
      await prisma.scheduledPayment.update({
        where: { id: schedule.id },
        data: {
          lastProcessedAt: new Date(),
          lastProcessedChargeId: charges[0].id,
          lastProcessedStatus: result.success ? 'SUCCEEDED' : 'FAILED',
        },
      });

      if (result.success) {
        results.succeeded++;
      } else {
        results.failed++;
        results.errors.push(
          `Schedule ${schedule.id}: ${result.failureReason || 'Unknown error'}`
        );
      }
    } catch (error) {
      results.failed++;
      results.errors.push(
        `Schedule ${schedule.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );

      await prisma.scheduledPayment.update({
        where: { id: schedule.id },
        data: {
          lastProcessedAt: new Date(),
          lastProcessedStatus: 'ERROR',
        },
      });
    }
  }

  return results;
}

/**
 * Retry failed payments
 * This should be called by a cron job periodically
 */
export async function retryFailedPayments(): Promise<{
  retried: number;
  succeeded: number;
  failed: number;
}> {
  // Get failed payment attempts from the last 7 days with less than 4 attempts
  const failedAttempts = await prisma.paymentAttempt.findMany({
    where: {
      status: 'FAILED',
      attemptNumber: { lt: 4 },
      attemptedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
    include: {
      payment: {
        include: {
          tenant: true,
          lease: true,
        },
      },
      charge: true,
    },
    orderBy: { attemptedAt: 'asc' },
  });

  const results = {
    retried: 0,
    succeeded: 0,
    failed: 0,
  };

  for (const attempt of failedAttempts) {
    if (!attempt.payment || !attempt.payment.tenant) continue;

    // Check retry timing based on attempt number
    const hoursSinceAttempt =
      (Date.now() - attempt.attemptedAt.getTime()) / (1000 * 60 * 60);

    const requiredHours = getRetryDelay(attempt.attemptNumber);
    if (hoursSinceAttempt < requiredHours) continue;

    results.retried++;

    // Get payment method (use the original or default)
    const paymentMethod = await prisma.tenantPaymentMethod.findFirst({
      where: {
        tenantId: attempt.payment.tenantId!,
        isActive: true,
        isDefault: true,
      },
    });

    if (!paymentMethod) {
      results.failed++;
      continue;
    }

    try {
      const result = await processPayment({
        tenantId: attempt.payment.tenantId!,
        leaseId: attempt.payment.leaseId,
        chargeIds: [attempt.chargeId],
        paymentMethodId: paymentMethod.id,
        amount: Number(attempt.amount),
        description: `Retry payment attempt #${attempt.attemptNumber + 1}`,
      });

      if (result.success) {
        results.succeeded++;
      } else {
        results.failed++;
      }
    } catch (error) {
      results.failed++;
    }
  }

  return results;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function mapToAutoPaySchedule(
  schedule: {
    id: string;
    leaseId: string;
    tenantId: string;
    paymentMethodId: string;
    dayOfMonth: number;
    amount: Decimal;
    chargeTypes: string[];
    isActive: boolean;
    lastProcessedAt: Date | null;
    lastProcessedStatus: string | null;
    createdAt: Date;
  },
  paymentMethod: {
    type: string;
    cardLast4: string | null;
    cardBrand: string | null;
    bankAccountLast4: string | null;
    bankName: string | null;
  } | null
): AutoPaySchedule {
  return {
    id: schedule.id,
    leaseId: schedule.leaseId,
    tenantId: schedule.tenantId,
    paymentMethodId: schedule.paymentMethodId,
    paymentMethodDetails: {
      type: paymentMethod?.type || 'UNKNOWN',
      last4: paymentMethod?.cardLast4 || paymentMethod?.bankAccountLast4 || undefined,
      brand: paymentMethod?.cardBrand || undefined,
      bankName: paymentMethod?.bankName || undefined,
    },
    dayOfMonth: schedule.dayOfMonth,
    amount: Number(schedule.amount),
    chargeTypes: schedule.chargeTypes,
    isActive: schedule.isActive,
    lastProcessedAt: schedule.lastProcessedAt,
    lastProcessedStatus: schedule.lastProcessedStatus,
    nextPaymentDate: calculateNextPaymentDate(schedule.dayOfMonth),
    createdAt: schedule.createdAt,
  };
}

function calculateNextPaymentDate(dayOfMonth: number): Date {
  const now = new Date();
  const currentDay = now.getDate();

  let nextDate: Date;
  if (currentDay < dayOfMonth) {
    // This month
    nextDate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
  } else {
    // Next month
    nextDate = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
  }

  return nextDate;
}

function getRetryDelay(attemptNumber: number): number {
  // Retry schedule: 24h, 72h, 168h (7 days)
  switch (attemptNumber) {
    case 1:
      return 24;
    case 2:
      return 72;
    case 3:
      return 168;
    default:
      return Infinity;
  }
}
