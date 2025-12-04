import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/dashboard
 * Get dashboard statistics for the organization
 */
export async function GET() {
  try {
    const { userId, organizationId } = await auth();

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current date info for time-based queries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Run all queries in parallel for better performance
    const [
      propertyCount,
      unitStats,
      tenantCount,
      maintenanceStats,
      chargesThisMonth,
      paymentsThisMonth,
      recentProperties,
      recentTenants,
      recentTransactions,
      recentMaintenanceRequests,
      unreadMessageStats,
      activeApplicationCount,
      overduePaymentCount,
    ] = await Promise.all([
      // Property count
      prisma.property.count({
        where: { organizationId },
      }),

      // Unit stats (total and occupied)
      prisma.unit.groupBy({
        by: ['status'],
        where: {
          property: { organizationId },
        },
        _count: true,
      }),

      // Active tenant count
      prisma.tenant.count({
        where: {
          organizationId,
          isActive: true,
        },
      }),

      // Maintenance request stats
      prisma.maintenanceRequest.groupBy({
        by: ['status'],
        where: {
          unit: { property: { organizationId } },
        },
        _count: true,
      }),

      // Charges due this month
      prisma.charge.aggregate({
        where: {
          lease: { unit: { property: { organizationId } } },
          dueDate: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),

      // Payments received this month
      prisma.payment.aggregate({
        where: {
          lease: { unit: { property: { organizationId } } },
          status: 'COMPLETED',
          receivedAt: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),

      // Recent properties (5)
      prisma.property.findMany({
        where: { organizationId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          type: true,
          addressLine1: true,
          city: true,
          state: true,
          _count: { select: { units: true } },
        },
      }),

      // Recent tenants (5)
      prisma.tenant.findMany({
        where: { organizationId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isActive: true,
        },
      }),

      // Recent transactions (5)
      prisma.payment.findMany({
        where: {
          lease: { unit: { property: { organizationId } } },
        },
        take: 5,
        orderBy: { receivedAt: 'desc' },
        include: {
          lease: {
            include: {
              unit: {
                include: {
                  property: true,
                },
              },
              leaseTenants: {
                where: { role: 'PRIMARY' },
                take: 1,
                include: {
                  tenant: true,
                },
              },
            },
          },
        },
      }),

      // Recent maintenance requests (5)
      prisma.maintenanceRequest.findMany({
        where: {
          unit: { property: { organizationId } },
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          unit: {
            select: {
              unitNumber: true,
              property: { select: { name: true } },
            },
          },
        },
      }),

      // Unread message count for the current user
      prisma.conversationParticipant.aggregate({
        where: {
          userId: userId,
          conversation: { organizationId },
        },
        _sum: { unreadCount: true },
      }),

      // Active application count
      prisma.application.count({
        where: {
          unit: { property: { organizationId } },
          status: { in: ['NEW', 'UNDER_REVIEW', 'SCREENING_IN_PROGRESS'] },
        },
      }),

      // Overdue payments count (charges that are DUE and past due date)
      prisma.charge.count({
        where: {
          lease: { unit: { property: { organizationId } } },
          status: 'DUE',
          dueDate: { lt: now },
        },
      }),
    ]);

    // Calculate totals from unit stats
    const totalUnits = unitStats.reduce((sum, s) => sum + s._count, 0);
    const occupiedUnits = unitStats.find((s) => s.status === 'OCCUPIED')?._count || 0;

    // Calculate maintenance stats
    const openMaintenanceRequests = maintenanceStats
      .filter((s) => ['SUBMITTED', 'ACKNOWLEDGED', 'SCHEDULED', 'IN_PROGRESS'].includes(s.status))
      .reduce((sum, s) => sum + s._count, 0);

    // Calculate collection stats
    const totalDue = Number(chargesThisMonth._sum.amount || 0);
    const totalCollected = Number(paymentsThisMonth._sum.amount || 0);
    const collectionRate = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 100;

    // Format recent properties
    const formattedProperties = recentProperties.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      address: p.addressLine1,
      city: p.city,
      state: p.state,
      units: p._count.units,
    }));

    // Format recent tenants
    const formattedTenants = recentTenants.map((t) => ({
      id: t.id,
      name: `${t.firstName} ${t.lastName}`,
      email: t.email,
      status: t.isActive ? 'active' : 'inactive',
      avatarUrl: undefined,
    }));

    // Format recent transactions
    const formattedTransactions = recentTransactions.map((p) => {
      const tenantName = p.lease.leaseTenants[0]?.tenant
        ? `${p.lease.leaseTenants[0].tenant.firstName} ${p.lease.leaseTenants[0].tenant.lastName}`
        : 'Unknown';
      return {
        id: p.id,
        type: 'income' as const,
        category: 'rent',
        description: `${tenantName} - ${p.lease.unit.property.name} Unit ${p.lease.unit.unitNumber}`,
        amount: Number(p.amount),
        date: p.receivedAt.toISOString(),
        status: p.status.toLowerCase(),
      };
    });

    // Format recent maintenance requests
    const formattedMaintenanceRequests = recentMaintenanceRequests.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      priority: m.priority.toLowerCase(),
      status: m.status.toLowerCase().replace(/_/g, '_'),
      unitId: m.unit.unitNumber,
      property: m.unit.property.name,
      createdAt: m.createdAt.toISOString(),
    }));

    return NextResponse.json({
      stats: {
        totalRevenue: Number(totalCollected),
        totalProperties: propertyCount,
        totalUnits,
        occupiedUnits,
        activeTenants: tenantCount,
        collectionRate,
        collectedRent: Number(totalCollected),
        outstandingRent: Number(totalDue) - Number(totalCollected),
        openMaintenanceRequests,
        unreadMessages: unreadMessageStats._sum.unreadCount || 0,
        activeApplications: activeApplicationCount,
        overduePayments: overduePaymentCount,
      },
      properties: formattedProperties,
      tenants: formattedTenants,
      transactions: formattedTransactions,
      maintenanceRequests: formattedMaintenanceRequests,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
